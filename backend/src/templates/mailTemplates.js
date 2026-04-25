const BRAND_NAME = "TrustKart";

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[char];
  });

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getShortId = (value) => String(value ?? "").slice(-8).toUpperCase();

const renderItemsHtml = (items) => {
  if (!items.length) {
    return "<p style=\"margin: 0; color: #4b5563;\">No items available.</p>";
  }

  return `
    <ul style="margin: 0; padding-left: 20px; color: #111827;">
      ${items
        .map(
          (item) => `
            <li style="margin-bottom: 12px;">
              <strong>${escapeHtml(item.title)}</strong><br />
              Qty: ${escapeHtml(item.quantity)} | Price: ${escapeHtml(formatCurrency(item.price))}
              ${item.sellerName ? `<br />Seller: ${escapeHtml(item.sellerName)}` : ""}
            </li>
          `,
        )
        .join("")}
    </ul>
  `;
};

const renderItemsText = (items) => {
  if (!items.length) {
    return "No items available.";
  }

  return items
    .map((item) => {
      const sellerText = item.sellerName ? ` | Seller: ${item.sellerName}` : "";
      return `- ${item.title} | Qty: ${item.quantity} | Price: ${formatCurrency(item.price)}${sellerText}`;
    })
    .join("\n");
};

const renderEmailShell = ({
  title,
  intro,
  detailsHtml,
  actionLabel,
  actionUrl,
  footerText,
}) => `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin: 0; padding: 24px; background-color: #f3f4f6; font-family: Arial, sans-serif; color: #111827;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="padding: 24px; background: linear-gradient(135deg, #111827, #1f2937); color: #ffffff;">
          <p style="margin: 0 0 8px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">${BRAND_NAME}</p>
          <h1 style="margin: 0; font-size: 28px; line-height: 1.2;">${escapeHtml(title)}</h1>
        </div>

        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #374151;">${escapeHtml(intro)}</p>
          <div style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #374151;">
            ${detailsHtml}
          </div>

          ${
            actionLabel && actionUrl
              ? `
                <a
                  href="${escapeHtml(actionUrl)}"
                  style="display: inline-block; padding: 12px 18px; background-color: #f59e0b; color: #111827; font-weight: 700; text-decoration: none; border-radius: 10px;"
                >
                  ${escapeHtml(actionLabel)}
                </a>
              `
              : ""
          }
        </div>

        <div style="padding: 20px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
            ${escapeHtml(footerText || `You are receiving this message because you have an account with ${BRAND_NAME}.`)}
          </p>
        </div>
      </div>
    </body>
  </html>
`;

const renderTextShell = ({
  title,
  intro,
  detailsText,
  actionLabel,
  actionUrl,
  footerText,
}) =>
  [
    `${BRAND_NAME}`,
    "",
    title,
    "",
    intro,
    "",
    detailsText,
    "",
    actionLabel && actionUrl ? `${actionLabel}: ${actionUrl}` : "",
    footerText || `You are receiving this message because you have an account with ${BRAND_NAME}.`,
  ]
    .filter(Boolean)
    .join("\n");

const buildSellerApprovedTemplate = ({ sellerName, shopName, loginUrl }) => {
  const subject = "Your seller account is approved";
  const intro = `Hi ${sellerName}, your seller account for ${shopName} has been approved.`;
  const detailsHtml = `
    <p style="margin: 0 0 12px;">You can now sign in to your seller workspace and start managing products and orders.</p>
    <p style="margin: 0;"><strong>Shop:</strong> ${escapeHtml(shopName)}</p>
  `;
  const detailsText = [
    "You can now sign in to your seller workspace and start managing products and orders.",
    `Shop: ${shopName}`,
  ].join("\n");

  return {
    subject,
    html: renderEmailShell({
      title: "Seller account approved",
      intro,
      detailsHtml,
      actionLabel: "Open seller dashboard",
      actionUrl: loginUrl,
      footerText: "If you were waiting for approval, you can now continue in the seller app.",
    }),
    text: renderTextShell({
      title: "Seller account approved",
      intro,
      detailsText,
      actionLabel: "Open seller dashboard",
      actionUrl: loginUrl,
      footerText: "If you were waiting for approval, you can now continue in the seller app.",
    }),
  };
};

const buildSellerRejectedTemplate = ({ sellerName, shopName, loginUrl }) => {
  const subject = "Your seller application status has been updated";
  const intro = `Hi ${sellerName}, we reviewed the seller application for ${shopName}.`;
  const detailsHtml = `
    <p style="margin: 0 0 12px;">At the moment, this seller account was not approved. Please review your details and contact the marketplace team if you need help.</p>
    <p style="margin: 0;"><strong>Shop:</strong> ${escapeHtml(shopName)}</p>
  `;
  const detailsText = [
    "At the moment, this seller account was not approved. Please review your details and contact the marketplace team if you need help.",
    `Shop: ${shopName}`,
  ].join("\n");

  return {
    subject,
    html: renderEmailShell({
      title: "Seller application update",
      intro,
      detailsHtml,
      actionLabel: "Open seller app",
      actionUrl: loginUrl,
      footerText: "You can use the seller app link above if you need to review your account details.",
    }),
    text: renderTextShell({
      title: "Seller application update",
      intro,
      detailsText,
      actionLabel: "Open seller app",
      actionUrl: loginUrl,
      footerText: "You can use the seller app link above if you need to review your account details.",
    }),
  };
};

const buildBuyerOrderConfirmedTemplate = ({
  buyerName,
  masterOrderId,
  totalAmount,
  paymentMethod,
  createdAt,
  orderUrl,
  items,
}) => {
  const subject = `Order confirmed: #${getShortId(masterOrderId)}`;
  const intro = `Hi ${buyerName}, your order has been confirmed successfully.`;
  const detailsHtml = `
    <p style="margin: 0 0 12px;"><strong>Order:</strong> #${escapeHtml(getShortId(masterOrderId))}</p>
    <p style="margin: 0 0 12px;"><strong>Placed on:</strong> ${escapeHtml(formatDate(createdAt))}</p>
    <p style="margin: 0 0 12px;"><strong>Payment method:</strong> ${escapeHtml(paymentMethod)}</p>
    <p style="margin: 0 0 20px;"><strong>Total amount:</strong> ${escapeHtml(formatCurrency(totalAmount))}</p>
    <div style="margin: 0 0 8px;"><strong>Items</strong></div>
    ${renderItemsHtml(items)}
  `;
  const detailsText = [
    `Order: #${getShortId(masterOrderId)}`,
    `Placed on: ${formatDate(createdAt)}`,
    `Payment method: ${paymentMethod}`,
    `Total amount: ${formatCurrency(totalAmount)}`,
    "",
    "Items",
    renderItemsText(items),
  ].join("\n");

  return {
    subject,
    html: renderEmailShell({
      title: "Your order is confirmed",
      intro,
      detailsHtml,
      actionLabel: "View your orders",
      actionUrl: orderUrl,
      footerText: "We will keep you posted as your items move through fulfillment.",
    }),
    text: renderTextShell({
      title: "Your order is confirmed",
      intro,
      detailsText,
      actionLabel: "View your orders",
      actionUrl: orderUrl,
      footerText: "We will keep you posted as your items move through fulfillment.",
    }),
  };
};

const ORDER_STATUS_COPY = {
  PROCESSING: {
    title: "Your order is being prepared",
    intro: "Your seller has started processing the order.",
  },
  SHIPPED: {
    title: "Your order has been shipped",
    intro: "Good news, your order is on the way.",
  },
  DELIVERED: {
    title: "Your order has been delivered",
    intro: "Your order was marked as delivered.",
  },
  CANCELLED: {
    title: "Your order has been cancelled",
    intro: "This order was marked as cancelled.",
  },
};

const buildBuyerOrderStatusUpdatedTemplate = ({
  buyerName,
  orderId,
  status,
  sellerName,
  updatedAt,
  orderUrl,
  items,
}) => {
  const statusCopy = ORDER_STATUS_COPY[status] || {
    title: "Your order has been updated",
    intro: "There is a new update on your order.",
  };
  const subject = `${statusCopy.title}: #${getShortId(orderId)}`;
  const intro = `Hi ${buyerName}, ${statusCopy.intro}`;
  const detailsHtml = `
    <p style="margin: 0 0 12px;"><strong>Order:</strong> #${escapeHtml(getShortId(orderId))}</p>
    <p style="margin: 0 0 12px;"><strong>Status:</strong> ${escapeHtml(status)}</p>
    <p style="margin: 0 0 12px;"><strong>Updated on:</strong> ${escapeHtml(formatDate(updatedAt))}</p>
    ${sellerName ? `<p style="margin: 0 0 20px;"><strong>Seller:</strong> ${escapeHtml(sellerName)}</p>` : ""}
    <div style="margin: 0 0 8px;"><strong>Items</strong></div>
    ${renderItemsHtml(items)}
  `;
  const detailsText = [
    `Order: #${getShortId(orderId)}`,
    `Status: ${status}`,
    `Updated on: ${formatDate(updatedAt)}`,
    sellerName ? `Seller: ${sellerName}` : "",
    "",
    "Items",
    renderItemsText(items),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html: renderEmailShell({
      title: statusCopy.title,
      intro,
      detailsHtml,
      actionLabel: "View your orders",
      actionUrl: orderUrl,
      footerText: "You can open your order history anytime to see the latest status.",
    }),
    text: renderTextShell({
      title: statusCopy.title,
      intro,
      detailsText,
      actionLabel: "View your orders",
      actionUrl: orderUrl,
      footerText: "You can open your order history anytime to see the latest status.",
    }),
  };
};

module.exports = {
  buildBuyerOrderConfirmedTemplate,
  buildBuyerOrderStatusUpdatedTemplate,
  buildSellerApprovedTemplate,
  buildSellerRejectedTemplate,
};
