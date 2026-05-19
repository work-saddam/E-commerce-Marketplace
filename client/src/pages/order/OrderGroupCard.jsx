import dayjs from "dayjs";

const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

const formatShortId = (value) =>
  value ? `${String(value).slice(0, 8)}...${String(value).slice(-4)}` : "N/A";

const getPaymentPresentation = (payment) => {
  if (!payment) {
    return {
      badgeClassName: "bg-slate-100 text-slate-600 ring-slate-200/80",
      helperClassName: "text-slate-500",
      helperText: "Payment details unavailable",
      label: "Unavailable",
    };
  }

  if (payment.status === "paid") {
    return {
      badgeClassName: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
      helperClassName: "text-emerald-700",
      helperText: "Payment completed successfully",
      label: "Paid",
    };
  }

  if (payment.status === "failed") {
    return {
      badgeClassName: "bg-rose-100 text-rose-700 ring-rose-200/80",
      helperClassName: "text-rose-700",
      helperText: "Reservation expired before payment finished",
      label: "Expired",
    };
  }

  if (payment.latestAttemptStatus === "authorized") {
    return {
      badgeClassName: "bg-amber-100 text-amber-700 ring-amber-200/80",
      helperClassName: "text-amber-700",
      helperText: "Gateway is confirming your payment",
      label: "Processing",
    };
  }

  if (payment.canRetry) {
    return {
      badgeClassName: "bg-sky-100 text-sky-700 ring-sky-200/80",
      helperClassName: "text-sky-700",
      helperText: "Payment is pending and can be retried",
      label: "Retry Available",
    };
  }

  return {
    badgeClassName: "bg-slate-100 text-slate-700 ring-slate-200/80",
    helperClassName: "text-slate-600",
    helperText: "Payment is still being processed",
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

  return statusMap[normalizedStatus] || "bg-slate-100 text-slate-700 ring-slate-200/80";
};

function OrderItemRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200/70 bg-white px-4 py-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.7)]">
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
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              Qty {item.quantity}
            </span>
            <span>{formatCurrency(item.price)} each</span>
          </div>
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
    <section className="rounded-[26px] border border-slate-200/80 bg-white/75 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{sellerName}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
            Seller order
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${orderStatusClassName}`}
          >
            {order.orderStatus}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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

function SummaryTile({ eyebrow, value, detail }) {
  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/88 px-4 py-4 shadow-[0_14px_36px_-34px_rgba(15,23,42,0.8)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {eyebrow}
      </p>
      <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
      ) : null}
    </div>
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
      ? `Retry before ${reservationLabel}`
      : payment?.latestAttemptStatus === "authorized" && reservationLabel
        ? `Reservation active until ${reservationLabel}`
        : paymentPresentation.helperText;
  const paymentValue = payment?.method
    ? `${paymentPresentation.label} via ${payment.method}`
    : paymentPresentation.label;

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.42)]">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(145deg,#ffffff_0%,#f8fbff_48%,#fff6e8_100%)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                  Master Order
                </p>
                <h4 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  #{formatShortId(group.id)}
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  Placed {dayjs(group.createdAt).format("MMM D, YYYY")}
                </span>
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  {group.orders.length} seller{" "}
                  {group.orders.length === 1 ? "order" : "orders"}
                </span>
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
                  {group.totalItems} item{group.totalItems === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ${paymentPresentation.badgeClassName}`}
              >
                {paymentPresentation.label}
              </span>
              <p
                className={`max-w-72 text-sm leading-6 lg:text-right ${paymentPresentation.helperClassName}`}
              >
                {reservationText}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <SummaryTile
              eyebrow="Total"
              value={formatCurrency(totalAmount)}
              detail="Combined total for this checkout group"
            />
            <SummaryTile
              eyebrow="Payment"
              value={paymentValue}
              detail={
                payment?.canRetry
                  ? "One retry action covers the full group"
                  : "Shared payment state across seller orders"
              }
            />
          </div>
        </div>

        {payment?.canRetry ? (
          <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-sky-200/90 bg-sky-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Payment still needs your confirmation
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Reopen checkout for this full order group without starting over.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onRetryPayment?.(group)}
              disabled={isRetrying}
            >
              {isRetrying ? "Opening payment..." : "Retry payment"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 bg-slate-50/55 px-4 py-5 sm:px-6">
        {group.orders.map((order) => (
          <OrderSellerSection key={order._id} order={order} />
        ))}
      </div>
    </article>
  );
}

export default OrderGroupCard;
