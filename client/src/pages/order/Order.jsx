import { startTransition, useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants";
import axios from "axios";
import toast from "react-hot-toast";
import OrderGroupCard from "./OrderGroupCard";
import { launchRazorpayPayment } from "../../utils/razorpayPayment";
import { useSearchParams } from "react-router-dom";

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

function OrderPagination({ page, totalPages, onNext, onPrev }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 1}
        className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
          page === 1
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        Prev
      </button>

      <p className="text-sm font-medium text-slate-600">
        Page {page} of {totalPages}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages}
        className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
          page === totalPages
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
        }`}
      >
        Next
      </button>
    </div>
  );
}

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [retryingMasterOrderId, setRetryingMasterOrderId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);
  const limit = Math.min(parseInt(searchParams.get("limit"), 10) || 6, 20);
  const currentPage = pagination?.page || page;

  const fetchOrders = async (signal, showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      const res = await axios.get(`${BASE_URL}/api/users/orders`, {
        params: { page, limit },
        signal,
        withCredentials: true,
      });

      startTransition(() => {
        setOrders(res?.data?.data ?? []);
        setPagination(res?.data?.pagination ?? null);
        setErrorMessage("");
      });
    } catch (error) {
      if (error?.code === "ERR_CANCELED") {
        return;
      }

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

    if (!masterOrderId || !group.payment?.canRetry) {
      return;
    }

    try {
      setRetryingMasterOrderId(masterOrderId);

      await launchRazorpayPayment({
        masterOrderId,
        onDismissed: async ({ hasFailedAttempt, message }) => {
          if (hasFailedAttempt) {
            toast.error(message);
          } else {
            toast(message);
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
          toast.success(message || "Payment verified successfully");
          await fetchOrders(undefined, false);
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to start payment retry",
      );
    } finally {
      setRetryingMasterOrderId((currentMasterOrderId) =>
        currentMasterOrderId === masterOrderId ? null : currentMasterOrderId,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[32px] border border-slate-200/80 bg-white/90 px-5 py-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Orders
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Your order groups
              </h3>
            </div>

            <div className="self-start rounded-[24px] border border-slate-200/80 bg-white px-5 py-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.6)]">
              <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                {pagination?.total ?? orderGroups.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                master order
                {Number(pagination?.total ?? orderGroups.length) === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {!isLoading && !errorMessage && orderGroups.length > 0 ? (
            <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 sm:text-base">
                Showing {orderGroups.length} group
                {orderGroups.length === 1 ? "" : "s"} on this page
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Page {currentPage} of {pagination?.totalPages || 1}
              </p>
            </div>
          ) : null}
        </section>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-[28px] border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {!isLoading && !errorMessage && orderGroups.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <h4 className="text-xl font-semibold text-slate-900">
              No orders found
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              When you place an order, it will show up here as a grouped master
              order with seller-level details inside.
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && orderGroups.length > 0 ? (
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

            <OrderPagination
              page={currentPage}
              totalPages={pagination?.totalPages || 0}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Order;
