import dayjs from "dayjs";

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatShortId = (value) =>
  value ? `${String(value).slice(0, 8)}...${String(value).slice(-4)}` : "N/A";

const getPaymentPresentation = (payment) => {
  if (!payment) {
    return {
      badgeClassName: "bg-slate-100 text-slate-600",
      label: "Unavailable",
    };
  }

  if (payment.status === "paid") {
    return {
      badgeClassName: "bg-emerald-100 text-emerald-700",
      label: "Paid",
    };
  }

  if (payment.status === "failed") {
    return {
      badgeClassName: "bg-rose-100 text-rose-700",
      label: "Expired",
    };
  }

  if (payment.latestAttemptStatus === "authorized") {
    return {
      badgeClassName: "bg-amber-100 text-amber-700",
      label: "Processing",
    };
  }

  if (payment.canRetry) {
    return {
      badgeClassName: "bg-sky-100 text-sky-700",
      label: "Retry Available",
    };
  }

  return {
    badgeClassName: "bg-slate-100 text-slate-700",
    label: "Pending",
  };
};

function OrderItemRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200/70 bg-white px-4 py-3 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.65)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-24">
          <img
            src={item.product?.image?.url}
            alt={item.product?.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-slate-900 sm:text-base">
            {item.product?.title}
          </p>
          <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
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

  return (
    <section className="rounded-[26px] border border-slate-200/80 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{sellerName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
            Seller fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
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
  const reservationText =
    payment?.canRetry && reservationLabel
      ? `Retry available until ${reservationLabel}`
      : payment?.latestAttemptStatus === "authorized" && reservationLabel
        ? `Reservation active until ${reservationLabel}`
        : null;
  const paymentValue = payment?.method
    ? `${paymentPresentation.label} via ${payment.method}`
    : paymentPresentation.label;

  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.38)]">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(140deg,#ffffff_0%,#f8fafc_52%,#fff8ec_100%)] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Master Order
                </p>
                <h4 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
                  #{formatShortId(group.id)}
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  Placed {dayjs(group.createdAt).format("MMM D, YYYY")}
                </span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  {group.orders.length} seller{" "}
                  {group.orders.length === 1 ? "order" : "orders"}
                </span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  {group.totalItems} item{group.totalItems === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentPresentation.badgeClassName}`}
              >
                {paymentPresentation.label}
              </span>
              {reservationText ? (
                <p className="max-w-60 text-right text-xs font-medium leading-5 text-slate-500">
                  {reservationText}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Total
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                {formatCurrency(totalAmount)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Combined total across this checkout group
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Payment
              </p>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {paymentValue}
              </p>
              {payment?.canRetry ? (
                <p className="mt-2 text-sm text-slate-500">
                  Keep this payment open until checkout completes.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-end">
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

      <div className="space-y-4 bg-slate-50/45 px-4 py-5 sm:px-6">
        {group.orders.map((order) => (
          <OrderSellerSection key={order._id} order={order} />
        ))}
      </div>
    </article>
  );
}

export default OrderGroupCard;
