const MasterOrder = require("../models/masterOrder");
const Order = require("../models/order");
const Payment = require("../models/payment");
const { isReservationExpired } = require("../config/orderReservation");

const NON_RETRYABLE_PAYMENT_STATUSES = new Set([
  "authorized",
  "captured",
  "paid",
  "success",
]);

const buildPaymentSummary = (masterOrderId, masterOrder, latestPayment) => {
  if (!masterOrderId) {
    return null;
  }

  const method = masterOrder?.paymentMethod || null;
  const status = masterOrder?.paymentStatus || null;
  const latestAttemptStatus = latestPayment?.status || null;
  const reservationExpiresAt = masterOrder?.reservationExpiresAt || null;
  const canRetry =
    method === "Razorpay" &&
    status === "pending" &&
    !isReservationExpired(reservationExpiresAt) &&
    !NON_RETRYABLE_PAYMENT_STATUSES.has(latestAttemptStatus || "");

  return {
    masterOrderId,
    method,
    status,
    latestAttemptStatus,
    reservationExpiresAt,
    totalAmount: masterOrder?.totalAmount ?? null,
    canRetry,
  };
};

exports.getUserOrders = async (req, res) => {
  try {
    let { page = 1, limit } = req.query;
    page = Math.max(parseInt(page, 10) || 1, 1);
    limit = Math.min(parseInt(limit, 10) || 6, 20);

    const total = await MasterOrder.countDocuments({ buyer: req.user.id });
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
    const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;
    const skip = (currentPage - 1) * limit;

    const masterOrders = await MasterOrder.find({ buyer: req.user.id })
      .select(
        "_id paymentMethod paymentStatus reservationExpiresAt totalAmount createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (masterOrders.length === 0) {
      return res.status(200).json({
        message: "Order fetched successfully!",
        data: [],
        pagination: {
          total,
          page: currentPage,
          limit,
          totalPages,
        },
      });
    }

    const masterOrderIds = masterOrders.map((masterOrder) => masterOrder._id);
    const masterOrderPositionMap = new Map(
      masterOrders.map((masterOrder, index) => [
        masterOrder._id.toString(),
        index,
      ]),
    );

    const [orders, latestPayments] = await Promise.all([
      Order.find({
        buyer: req.user.id,
        masterOrder: { $in: masterOrderIds },
      })
        .populate({
          path: "seller",
          select: "shopName sellerName email",
        })
        .populate({
          path: "products.product",
          select: "title image",
        })
        .select(
          "masterOrder seller products orderStatus subTotal createdAt updatedAt",
        )
        .sort({ createdAt: -1 })
        .lean(),
      Payment.aggregate([
        {
          $match: {
            masterOrder: { $in: masterOrderIds },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: "$masterOrder",
            status: { $first: "$status" },
          },
        },
      ]),
    ]);

    const masterOrderMap = new Map(
      masterOrders.map((masterOrder) => [
        masterOrder._id.toString(),
        masterOrder,
      ]),
    );
    const latestPaymentMap = new Map(
      latestPayments.map((payment) => [payment._id.toString(), payment]),
    );

    orders.sort((firstOrder, secondOrder) => {
      const firstMasterOrderIndex =
        masterOrderPositionMap.get(firstOrder.masterOrder?.toString()) ?? 0;
      const secondMasterOrderIndex =
        masterOrderPositionMap.get(secondOrder.masterOrder?.toString()) ?? 0;

      if (firstMasterOrderIndex !== secondMasterOrderIndex) {
        return firstMasterOrderIndex - secondMasterOrderIndex;
      }

      return new Date(secondOrder.createdAt) - new Date(firstOrder.createdAt);
    });

    const enrichedOrders = orders.map((order) => {
      const masterOrderId = order.masterOrder?.toString();
      const masterOrder = masterOrderMap.get(masterOrderId);
      const latestPayment = latestPaymentMap.get(masterOrderId);

      return {
        ...order,
        payment: buildPaymentSummary(masterOrderId, masterOrder, latestPayment),
      };
    });

    res.status(200).json({
      message: "Order fetched successfully!",
      data: enrichedOrders,
      pagination: {
        total,
        page: currentPage,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Order fetch failed!", error: error.message });
  }
};

exports.getOrderbyId = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: "buyer products.product",
      select: "name email phone title image.url",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const userId = String(req.user.id);
    const isBuyer = userId === String(order.buyer._id);
    const isSeller = userId === String(order.seller);
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    return res
      .status(200)
      .json({ message: "Order fetched successfully", data: order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch the order", error: error.message });
  }
};
