const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Seller = require("../models/seller");
const { buildAppUrl, getMailTemplateConfig } = require("../config/mail");
const { enqueueMailJob } = require("../jobs/mail/sendMail");
const {
  buildBuyerOrderConfirmedTemplate,
  buildBuyerPaymentFailedTemplate,
  buildBuyerOrderStatusUpdatedTemplate,
  buildSellerApprovedTemplate,
  buildSellerRejectedTemplate,
} = require("../templates/mailTemplates");

const createMailPayload = ({
  templateKey,
  to,
  subject,
  html,
  text,
  idempotencyKey,
  tags = [],
  meta = {},
  replyTo,
}) => ({
  templateKey,
  to: Array.isArray(to) ? to : [to],
  subject,
  html,
  text,
  idempotencyKey,
  tags,
  meta,
  replyTo,
});

const mapOrderItems = (orders) =>
  orders.flatMap((order) =>
    order.products.map((item) => ({
      title: item.product?.title || "Product",
      quantity: item.quantity,
      price: item.price,
      sellerName: order.seller?.shopName || order.seller?.sellerName,
    })),
  );

const mapSingleOrderItems = (order) =>
  order.products.map((item) => ({
    title: item.product?.title || "Product",
    quantity: item.quantity,
    price: item.price,
    sellerName: order.seller?.shopName || order.seller?.sellerName,
  }));

const queueSellerStatusEmail = async ({ sellerId, status }) => {
  if (!["approved", "rejected"].includes(status)) {
    return null;
  }

  const seller = await Seller.findById(sellerId)
    .select("sellerName shopName email")
    .lean();

  if (!seller) {
    throw new Error("Seller not found while preparing seller status email");
  }

  if (!seller.email) {
    throw new Error("Seller email is missing");
  }

  const { sellerAppUrl, mailReplyTo } = getMailTemplateConfig();
  const loginUrl = buildAppUrl(sellerAppUrl, "/login");
  const template =
    status === "approved"
      ? buildSellerApprovedTemplate({
          sellerName: seller.sellerName,
          shopName: seller.shopName,
          loginUrl,
        })
      : buildSellerRejectedTemplate({
          sellerName: seller.sellerName,
          shopName: seller.shopName,
          loginUrl,
        });

  return enqueueMailJob(
    createMailPayload({
      templateKey: `seller-${status}`,
      to: seller.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      idempotencyKey: `seller-status-${seller._id}-${status}`,
      tags: [
        { name: "template", value: `seller-${status}` },
        { name: "seller_id", value: seller._id.toString() },
        { name: "status", value: status },
      ],
      meta: {
        sellerId: seller._id.toString(),
        status,
      },
      replyTo: mailReplyTo,
    }),
  );
};

const queueBuyerOrderConfirmedEmail = async ({ masterOrderId }) => {
  const masterOrder = await MasterOrder.findById(masterOrderId)
    .select("_id buyer orders totalAmount paymentMethod createdAt")
    .populate({
      path: "buyer",
      select: "name email",
    })
    .populate({
      path: "orders",
      select: "_id products seller",
      populate: [
        { path: "seller", select: "shopName sellerName" },
        { path: "products.product", select: "title" },
      ],
    })
    .lean();

  if (!masterOrder) {
    throw new Error(
      "Master order not found while preparing order confirmation email",
    );
  }

  if (!masterOrder.buyer?.email) {
    throw new Error("Buyer email is missing");
  }

  const { clientAppUrl, mailReplyTo } = getMailTemplateConfig();
  const orderUrl = buildAppUrl(clientAppUrl, "/account/orders");
  const items = mapOrderItems(masterOrder.orders || []);
  const template = buildBuyerOrderConfirmedTemplate({
    buyerName: masterOrder.buyer.name || "Customer",
    masterOrderId: masterOrder._id.toString(),
    totalAmount: masterOrder.totalAmount,
    paymentMethod: masterOrder.paymentMethod,
    createdAt: masterOrder.createdAt,
    orderUrl,
    items,
  });

  return enqueueMailJob(
    createMailPayload({
      templateKey: "buyer-order-confirmed",
      to: masterOrder.buyer.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      idempotencyKey: `buyer-order-confirmed-${masterOrder._id.toString()}`,
      tags: [
        { name: "template", value: "buyer-order-confirmed" },
        { name: "master_order_id", value: masterOrder._id.toString() },
        {
          name: "payment_method",
          value: String(masterOrder.paymentMethod || "").toLowerCase(),
        },
      ],
      meta: {
        masterOrderId: masterOrder._id.toString(),
        buyerId: masterOrder.buyer._id.toString(),
        paymentMethod: masterOrder.paymentMethod,
      },
      replyTo: mailReplyTo,
    }),
  );
};

const queueBuyerPaymentFailedEmail = async ({
  masterOrderId,
  paymentId,
  failureReason,
}) => {
  const masterOrder = await MasterOrder.findById(masterOrderId)
    .select(
      "_id buyer totalAmount paymentMethod reservationExpiresAt createdAt",
    )
    .populate({
      path: "buyer",
      select: "name email",
    })
    .lean();

  if (!masterOrder) {
    throw new Error(
      "Master order not found while preparing payment failed email",
    );
  }

  if (!masterOrder.buyer?.email) {
    throw new Error("Buyer email is missing");
  }

  const { clientAppUrl, mailReplyTo } = getMailTemplateConfig();
  const orderUrl = buildAppUrl(clientAppUrl, "/account/orders");
  const template = buildBuyerPaymentFailedTemplate({
    buyerName: masterOrder.buyer.name || "Customer",
    masterOrderId: masterOrder._id.toString(),
    totalAmount: masterOrder.totalAmount,
    paymentMethod: masterOrder.paymentMethod,
    failureReason,
    retryUntil: masterOrder.reservationExpiresAt,
    orderUrl,
  });

  return enqueueMailJob(
    createMailPayload({
      templateKey: "buyer-payment-failed",
      to: masterOrder.buyer.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      idempotencyKey: `buyer-payment-failed-${paymentId}`,
      tags: [
        { name: "template", value: "buyer-payment-failed" },
        { name: "master_order_id", value: masterOrder._id.toString() },
        { name: "payment_id", value: String(paymentId) },
      ],
      meta: {
        masterOrderId: masterOrder._id.toString(),
        buyerId: masterOrder.buyer._id.toString(),
        paymentId: String(paymentId),
        failureReason,
      },
      replyTo: mailReplyTo,
    }),
  );
};

const queueBuyerOrderStatusUpdatedEmail = async ({ orderId, status }) => {
  const order = await Order.findById(orderId)
    .select("_id buyer seller products orderStatus updatedAt")
    .populate({
      path: "buyer",
      select: "name email",
    })
    .populate({
      path: "seller",
      select: "shopName sellerName",
    })
    .populate({
      path: "products.product",
      select: "title",
    })
    .lean();

  if (!order) {
    throw new Error("Order not found while preparing order status email");
  }

  if (!order.buyer?.email) {
    throw new Error("Buyer email is missing");
  }

  const { clientAppUrl, mailReplyTo } = getMailTemplateConfig();
  const orderUrl = buildAppUrl(clientAppUrl, "/account/orders");
  const effectiveStatus = status || order.orderStatus;
  const template = buildBuyerOrderStatusUpdatedTemplate({
    buyerName: order.buyer.name || "Customer",
    orderId: order._id.toString(),
    status: effectiveStatus,
    sellerName: order.seller?.shopName || order.seller?.sellerName,
    updatedAt: order.updatedAt,
    orderUrl,
    items: mapSingleOrderItems(order),
  });

  return enqueueMailJob(
    createMailPayload({
      templateKey: "buyer-order-status-updated",
      to: order.buyer.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      idempotencyKey: `buyer-order-status-updated-${order._id}-${effectiveStatus}`,
      tags: [
        { name: "template", value: "buyer-order-status-updated" },
        { name: "order_id", value: order._id.toString() },
        { name: "status", value: String(effectiveStatus).toLowerCase() },
      ],
      meta: {
        orderId: order._id.toString(),
        buyerId: order.buyer._id.toString(),
        status: effectiveStatus,
      },
      replyTo: mailReplyTo,
    }),
  );
};

module.exports = {
  queueBuyerOrderConfirmedEmail,
  queueBuyerPaymentFailedEmail,
  queueBuyerOrderStatusUpdatedEmail,
  queueSellerStatusEmail,
};
