import { useState, useEffect, startTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  Truck,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  ArrowRight,
  Eye,
  XCircle,
  Clock,
} from "lucide-react";
import { useCart } from "../features/cart";
import { addToCart } from "../features/cart/store/cartSlice";
import { useDispatch } from "react-redux";
import apiClient from "../shared/services/apiClient";
import Loader from "../shared/components/feedback/Loader";
import { routePaths } from "../app/router/routePaths";
import { launchRazorpayPayment } from "../shared/utils/razorpayPayment";

// Native Date formatters
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const formatShortId = (value) =>
  value ? `${String(value).slice(0, 8)}...${String(value).slice(-4)}` : "N/A";

// Build payment status presentation styling
const getPaymentPresentation = (payment) => {
  if (!payment) {
    return {
      badgeClassName:
        "bg-surface-container border border-outline-variant/30 text-on-surface-variant/70",
      label: "Unavailable",
    };
  }

  if (payment.status === "paid") {
    return {
      badgeClassName:
        "bg-green-500/10 border border-green-500/20 text-green-600",
      label: "Paid",
    };
  }

  if (payment.status === "failed") {
    return {
      badgeClassName: "bg-red-500/10 border border-red-500/20 text-red-600",
      label: "Expired",
    };
  }

  if (payment.latestAttemptStatus === "authorized") {
    return {
      badgeClassName:
        "bg-amber-500/10 border border-amber-500/20 text-amber-600",
      label: "Processing",
    };
  }

  if (payment.canRetry) {
    return {
      badgeClassName:
        "bg-champagne/10 border border-champagne/20 text-champagne-dark font-semibold",
      label: "Retry Available",
    };
  }

  return {
    badgeClassName:
      "bg-surface-container border border-outline-variant/30 text-on-surface-variant/70",
    label: "Pending",
  };
};

// Build order status presentation styling
const getOrderStatusPresentation = (orderStatus) => {
  const status = String(orderStatus || "").toUpperCase();

  const statusMap = {
    CANCELLED: "bg-red-500/10 border border-red-500/20 text-red-600",
    CONFIRMED: "bg-green-500/10 border border-green-500/20 text-green-600",
    DELIVERED: "bg-green-500/10 border border-green-500/20 text-green-600",
    FAILED: "bg-red-500/10 border border-red-500/20 text-red-600",
    ON_HOLD: "bg-amber-500/10 border border-amber-500/20 text-amber-600",
    PENDING:
      "bg-surface-container border border-outline-variant/30 text-on-surface-variant/70",
    PROCESSING: "bg-purple-500/10 border border-purple-500/20 text-purple-600",
    REFUNDED: "bg-blue-500/10 border border-blue-500/20 text-blue-600",
    RETURNED: "bg-orange-500/10 border border-orange-500/20 text-orange-600",
    SHIPPED: "bg-blue-500/10 border border-blue-500/20 text-blue-600",
  };

  return (
    statusMap[status] ||
    "bg-surface-container border border-outline-variant/30 text-on-surface-variant/70"
  );
};

// Group backend flat orders into master orders
const buildOrderGroups = (orders) => {
  const groupMap = new Map();

  for (const order of orders) {
    const groupId = String(
      order.payment?.masterOrderId || order.masterOrder || order._id,
    );
    const existingGroup = groupMap.get(groupId);
    const itemCount = order.products.reduce(
      (runningTotal, item) => runningTotal + Number(item.quantity || 0),
      0,
    );

    if (existingGroup) {
      existingGroup.orders.push(order);
      existingGroup.totalItems += itemCount;

      if (!existingGroup.payment && order.payment) {
        existingGroup.payment = order.payment;
      }
      continue;
    }

    groupMap.set(groupId, {
      id: groupId,
      createdAt: order.createdAt,
      orders: [order],
      payment: order.payment,
      totalItems: itemCount,
    });
  }

  return Array.from(groupMap.values());
};

// Pagination controls component
function OrderPagination({ page, totalPages, onNext, onPrev }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-sm sm:flex-row">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 1}
        className="flex items-center gap-1 min-w-28 justify-center rounded-lg border border-outline-variant/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-charcoal"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Previous</span>
      </button>

      <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/60 font-label-caps">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages}
        className="flex items-center gap-1 min-w-28 justify-center rounded-lg border border-outline-variant/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-charcoal"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Single item row component
function OrderItemRow({ item }) {
  const dispatch = useDispatch();

  const handleBuyAgain = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.product) {
      dispatch(
        addToCart({
          _id: item.product._id || item.product,
          quantity: item.quantity || 1,
        }),
      );
      toast.success("Added back to bag!", {
        style: {
          borderRadius: "8px",
          background: "#1b1c1c",
          color: "#fff",
        },
      });
    }
  };

  const imageUrl = item.product?.image?.url || "/images/placeholder.png";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-all">
      <div className="flex min-w-0 items-center gap-4">
        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-outline-variant/10 bg-surface-container flex items-center justify-center">
          <img
            src={imageUrl}
            alt={item.product?.title || "Product"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-semibold text-charcoal">
            {item.product?.title || "Product details unavailable"}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant/65">
            Qty {item.quantity} • {formatCurrency(item.price)} each
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-outline-variant/8">
        <p className="text-sm font-bold text-charcoal">
          {formatCurrency((item.price || 0) * (item.quantity || 0))}
        </p>
        <button
          onClick={handleBuyAgain}
          disabled={!item.product}
          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-champagne border border-secondary/20 hover:border-champagne px-3 py-1.5 rounded-md hover:bg-champagne/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Buy Again</span>
        </button>
      </div>
    </div>
  );
}

// Sub-order section for each seller
function OrderSellerSection({ order }) {
  const sellerName =
    order.seller?.shopName || order.seller?.sellerName || "Partner Seller";
  const orderStatusClassName = getOrderStatusPresentation(order.orderStatus);

  return (
    <div className="border border-outline-variant/10 rounded-2xl bg-surface-container-lowest p-4 sm:p-5 shadow-sm space-y-4">
      {/* Seller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-outline-variant/8 pb-3">
        <div>
          <p className="text-xs font-bold text-charcoal uppercase tracking-wider">
            {sellerName}
          </p>
          <p className="text-[10px] text-on-surface-variant/50 font-semibold uppercase tracking-wider">
            {order.products.length} item{order.products.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${orderStatusClassName}`}
          >
            {order.orderStatus}
          </span>
          <span className="text-sm font-bold text-charcoal">
            {formatCurrency(order.subTotal)}
          </span>
        </div>
      </div>

      {/* Seller Items */}
      <div className="space-y-3">
        {order.products.map((item, idx) => (
          <OrderItemRow
            key={item.product?._id || item._id || idx}
            item={item}
          />
        ))}
      </div>
    </div>
  );
}

// Master Order Card
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
    ? formatDateTime(payment.reservationExpiresAt)
    : null;
  const paymentMethodLabel = payment?.method ? `via ${payment.method}` : "";
  const retryText =
    payment?.canRetry && reservationLabel
      ? `Complete checkout before ${reservationLabel}`
      : payment?.latestAttemptStatus === "authorized" && reservationLabel
        ? `Reservation active until ${reservationLabel}`
        : null;

  return (
    <article className="border border-outline-variant/10 rounded-3xl bg-surface-container/20 overflow-hidden hover:border-outline-variant/20 transition-all duration-300">
      {/* Header Info */}
      <div className="p-5 sm:p-6 bg-surface-container-lowest border-b border-outline-variant/10 flex flex-col md:flex-row justify-between gap-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-10 gap-y-4">
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block">
              Master Order
            </p>
            <p className="text-sm font-bold text-charcoal font-mono pt-1">
              #{formatShortId(group.id)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block">
              Placed On
            </p>
            <p className="text-sm font-semibold text-on-surface-variant/80 pt-1">
              {formatDate(group.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block">
              Items Curation
            </p>
            <p className="text-sm font-semibold text-on-surface-variant/80 pt-1">
              {group.totalItems} item{group.totalItems === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Price display block */}
        <div className="bg-surface-container-low border border-outline-variant/8 rounded-2xl px-5 py-3 md:min-w-50 flex justify-between md:flex-col items-center md:items-start gap-1">
          <div>
            <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
              Total Amount
            </p>
            <p className="text-xl font-black text-charcoal tracking-tight pt-0.5 tabular-nums">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <span className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-wider leading-none">
            {paymentMethodLabel}
          </span>
        </div>
      </div>

      {/* Payment details strip */}
      <div className="px-5 py-4 border-b border-outline-variant/10 bg-surface-container-lowest/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider w-fit border ${paymentPresentation.badgeClassName}`}
          >
            {paymentPresentation.label}
          </span>
          {retryText && (
            <p className="text-xs font-medium text-on-surface-variant/70 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-champagne" />
              <span>{retryText}</span>
            </p>
          )}
        </div>

        {payment?.canRetry && (
          <button
            onClick={() => onRetryPayment(group)}
            disabled={isRetrying}
            className="flex items-center gap-2 bg-charcoal text-surface-container-lowest font-label-caps text-xs px-6 py-2.5 hover:bg-champagne hover:text-charcoal transition-all active:scale-[0.98] rounded-xl cursor-pointer shadow-md font-bold uppercase disabled:opacity-50"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Opening Gateway...</span>
              </>
            ) : (
              <span>Complete Payment</span>
            )}
          </button>
        )}
      </div>

      {/* Sub-orders */}
      <div className="p-4 sm:p-6 space-y-4">
        {group.orders.map((order) => (
          <OrderSellerSection key={order._id} order={order} />
        ))}
      </div>
    </article>
  );
}

// Main Order Component
export default function Order() {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [retryingMasterOrderId, setRetryingMasterOrderId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Address sorting and filtering params
  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);
  const limit = Math.min(parseInt(searchParams.get("limit"), 10) || 6, 20);
  const currentPage = pagination?.page || page;

  const fetchOrders = async (signal, showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      const res = await apiClient.get("/api/users/orders", {
        params: { page, limit },
        signal,
      });

      startTransition(() => {
        setOrders(res?.data?.data ?? []);
        setPagination(res?.data?.pagination ?? null);
        setErrorMessage("");
      });
    } catch (error) {
      if (error?.code === "ERR_CANCELED") return;
      setErrorMessage(
        error?.response?.data?.message || "Failed to load your orders.",
      );
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [page, limit]);

  const orderGroups = buildOrderGroups(orders);

  const updatePage = (nextPage) => {
    startTransition(() => {
      setSearchParams({
        page: String(nextPage),
        limit: String(limit),
      });
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updatePage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      updatePage(currentPage + 1);
    }
  };

  const handleRetryPayment = async (group) => {
    const masterOrderId = group.payment?.masterOrderId;

    if (!masterOrderId || !group.payment?.canRetry) return;

    try {
      setRetryingMasterOrderId(masterOrderId);

      await launchRazorpayPayment({
        masterOrderId,
        onDismissed: async ({ hasFailedAttempt, message }) => {
          if (hasFailedAttempt) {
            toast.error(message);
          } else {
            toast(message, { icon: "ℹ️" });
          }
          await fetchOrders(undefined, false);
        },
        onVerificationComplete: () => {
          setRetryingMasterOrderId(null);
        },
        onVerificationError: async ({ message }) => {
          toast.error(message);
          await fetchOrders(undefined, false);
        },
        onVerificationStart: () => {
          setRetryingMasterOrderId(masterOrderId);
        },
        onVerified: async ({ message }) => {
          toast.success(message || "Payment verified successfully!");
          await fetchOrders(undefined, false);
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start payment retry.",
      );
    } finally {
      setRetryingMasterOrderId((current) =>
        current === masterOrderId ? null : current,
      );
    }
  };

  return (
    <div className="w-full bg-surface-container-low min-h-screen text-on-background">
      <main className="max-w-container-max mx-auto px-margin-edge py-10 md:py-14">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-label-caps text-on-surface-variant/40 select-none mb-8">
          <Link
            to={routePaths.HOME}
            className="hover:text-champagne transition-colors duration-300"
          >
            Home
          </Link>
          <span className="text-on-surface-variant/20">/</span>
          <span className="text-champagne font-bold">My Orders</span>
        </div>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight leading-snug">
              Acquisition History
            </h1>
            <p className="text-xs font-bold font-label-caps text-on-surface-variant/50 uppercase tracking-[0.15em] select-none">
              Review and manage your curated order groups
            </p>
          </div>

          {!isLoading && pagination?.total > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/8 px-4 py-2 rounded-xl text-center shadow-sm">
              <span className="text-base font-black text-charcoal tabular-nums">
                {pagination.total}
              </span>
              <span className="text-[9px] text-on-surface-variant/55 font-bold uppercase tracking-wider block">
                Total Orders
              </span>
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-3xl border border-outline-variant/10 bg-surface-container-lowest"
              />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="p-4 border border-red-500/10 bg-red-500/5 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        ) : orderGroups.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-surface-container/30 border border-outline-variant/10 rounded-3xl gap-6 max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-champagne/10 rounded-full flex items-center justify-center text-champagne border border-champagne/20">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-charcoal uppercase tracking-tight">
                No Orders Placed Yet
              </h3>
              <p className="text-on-surface-variant/75 text-sm max-w-sm mx-auto leading-relaxed">
                Add premium selections from our curated collections to place
                your first order.
              </p>
            </div>
            <Link
              to={routePaths.SHOP}
              className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-10 py-4 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-lg rounded-xl border border-charcoal hover:border-champagne font-bold uppercase"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Order groups List */
          <div className="space-y-8">
            <div className="space-y-6">
              {orderGroups.map((group) => (
                <OrderGroupCard
                  key={group.id}
                  group={group}
                  isRetrying={
                    retryingMasterOrderId === group.payment?.masterOrderId
                  }
                  onRetryPayment={handleRetryPayment}
                />
              ))}
            </div>

            <OrderPagination
              page={currentPage}
              totalPages={pagination?.totalPages || 0}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          </div>
        )}
      </main>
    </div>
  );
}
