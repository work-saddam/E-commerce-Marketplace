import dayjs from "dayjs";

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatShortId = (value) =>
  value ? `${String(value).slice(0, 8)}...${String(value).slice(-4)}` : "N/A";

const getPaymentPresentation = (payment) => {
  if (!payment) {
    return {
      badgeClassName: "bg-slate-100 text-slate-600 ring-slate-200/80",
      label: "Unavailable",
    };
  }

  if (payment.status === "paid") {
    return {
      badgeClassName: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
      label: "Paid",
    };
  }

  if (payment.status === "failed") {
    return {
      badgeClassName: "bg-rose-100 text-rose-700 ring-rose-200/80",
      label: "Expired",
    };
  }

  if (payment.latestAttemptStatus === "authorized") {
    return {
      badgeClassName: "bg-amber-100 text-amber-700 ring-amber-200/80",
      label: "Processing",
    };
  }

  if (payment.canRetry) {
    return {
      badgeClassName: "bg-sky-100 text-sky-700 ring-sky-200/80",
      label: "Retry Available",
    };
  }

  return {
    badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200/80",
    label: "Pending",
  };
};

const getOrderStatusPresentation = (orderStatus) => {
  const normalizedStatus = String(orderStatus || "").toUpperCase();

  const statusMap = {
    CANCELLED: "bg-rose-100 text-rose-700 ring-rose-200/80",
    CONFIRMED: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
    DELIVERED: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
    FAILED: "bg-rose-100 text-rose-700 ring-rose-200/80",
    ON_HOLD: "bg-amber-100 text-amber-700 ring-amber-200/80",
    PENDING: "bg-slate-100 text-slate-700 ring-slate-200/80",
    PROCESSING: "bg-violet-100 text-violet-700 ring-violet-200/80",
    REFUNDED: "bg-slate-100 text-slate-700 ring-slate-200/80",
    RETURNED: "bg-orange-100 text-orange-700 ring-orange-200/80",
    SHIPPED: "bg-sky-100 text-sky-700 ring-sky-200/80",
  };

  return (
    statusMap[normalizedStatus] ||
    "bg-slate-100 text-slate-700 ring-slate-200/80"
  );
};

function OrderItemRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-slate-200/70 bg-slate-50/75 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-20 sm:w-20">
          <img
            src={item.product?.image?.url}
            alt={item.product?.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-6 text-slate-900 sm:text-base">
            {item.product?.title}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Qty {item.quantity} / {formatCurrency(item.price)} each
          </p>
        </div>
      </div>

      <p className="shrink-0 text-sm font-semibold text-slate-900 sm:text-base">
        {formatCurrency((item.price || 0) * (item.quantity || 0))}
      </p>
    </div>
  );
}

function OrderSellerSection({ order }) {
  const sellerName =
    order.seller?.shopName || order.seller?.sellerName || "Seller order";
  const orderStatusClassName = getOrderStatusPresentation(order.orderStatus);

  return (
    <section className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_40px_-38px_rgba(15,23,42,0.75)]">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{sellerName}</p>
          <p className="mt-1 text-xs text-slate-500">
            {order.products.length} item{order.products.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${orderStatusClassName}`}
          >
            {order.orderStatus}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(order.subTotal)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {order.products.map((item) => (
          <OrderItemRow
            key={`${order._id}-${item.product?._id || item._id || item.product}`}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}

function OrderGroupCard({ group, isRetrying, onRetryPayment }) {
  const payment = group.payment;
  const paymentPresentation = getPaymentPresentation(payment);
  const totalAmount =
    payment?.totalAmount ??
    group.orders.reduce(
      (runningTotal, order) => runningTotal + Number(order.subTotal || 0),
      0,
    );
  const reservationLabel = payment?.reservationExpiresAt
    ? dayjs(payment.reservationExpiresAt).format("MMM D, YYYY h:mm A")
    : null;
  const paymentMethodLabel = payment?.method ? `via ${payment.method}` : null;
  const retryText =
    payment?.canRetry && reservationLabel
      ? `Retry before ${reservationLabel}`
      : payment?.latestAttemptStatus === "authorized" && reservationLabel
        ? `Reservation active until ${reservationLabel}`
        : null;
  const sellerOrderCount = group.orders.length;

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_22px_62px_-44px_rgba(15,23,42,0.38)]">
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Master Order
                </p>
                <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  #{formatShortId(group.id)}
                </h4>
                <p className="mt-2 text-sm text-slate-500">
                  Placed {dayjs(group.createdAt).format("MMM D, YYYY")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {group.totalItems} item{group.totalItems === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {sellerOrderCount} seller order
                  {sellerOrderCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="min-w-full rounded-[22px] border border-slate-200/80 bg-slate-50/80 px-4 py-4 sm:min-w-[240px] lg:max-w-[280px]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {formatCurrency(totalAmount)}
              </p>
              {paymentMethodLabel ? (
                <p className="mt-2 text-sm text-slate-500">{paymentMethodLabel}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[22px] border border-slate-200/80 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span
                className={`w-fit rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${paymentPresentation.badgeClassName}`}
              >
                {paymentPresentation.label}
              </span>
              {retryText ? (
                <p className="text-sm text-slate-500">{retryText}</p>
              ) : null}
            </div>

            {payment?.canRetry ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onRetryPayment?.(group)}
                disabled={isRetrying}
              >
                {isRetrying ? "Opening payment..." : "Retry payment"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-200/80 bg-slate-50/60 px-4 py-5 sm:px-6">
        {group.orders.map((order) => (
          <OrderSellerSection key={order._id} order={order} />
        ))}
      </div>
    </article>
  );
}

export default OrderGroupCard;
