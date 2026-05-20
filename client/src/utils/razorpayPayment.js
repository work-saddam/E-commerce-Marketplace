import axios from "axios";
import { BASE_URL } from "./constants";

const DEFAULT_PENDING_MESSAGE =
  "Payment is still pending. Retry it from your orders before the reservation expires.";
const DEFAULT_FAILURE_MESSAGE =
  "Payment attempt failed. Retry it from your orders before the reservation expires.";

const verifyRazorpayPayment = (response) =>
  axios.post(
    `${BASE_URL}/api/payment/verify`,
    {
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_signature: response.razorpay_signature,
    },
    { withCredentials: true },
  );

export const launchRazorpayPayment = async ({
  masterOrderId,
  onDismissed,
  onVerificationComplete,
  onVerificationError,
  onVerificationStart,
  onVerified,
}) => {
  const paymentResponse = await axios.post(
    `${BASE_URL}/api/payment/create`,
    { masterOrderId },
    { withCredentials: true },
  );

  const { keyId, order, user } = paymentResponse?.data || {};

  if (!order?.id || !keyId) {
    throw new Error(
      paymentResponse?.data?.message || "Unable to initialize payment",
    );
  }

  if (typeof window === "undefined" || !window.Razorpay) {
    throw new Error("Payment gateway is unavailable right now.");
  }

  let hasResolved = false;
  let dismissMessage = DEFAULT_PENDING_MESSAGE;
  let hasFailedAttempt = false;

  const razorpay = new window.Razorpay({
    key: keyId,
    amount: order.amount,
    currency: order.currency,
    name: "TrustKart Store",
    description: "Order Transaction",
    order_id: order.id,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || "",
    },
    theme: {
      color: "#F37254",
    },
    modal: {
      ondismiss: async () => {
        if (hasResolved) {
          return;
        }

        await onDismissed?.({
          masterOrderId,
          message: dismissMessage,
          hasFailedAttempt,
        });
      },
    },
    handler: async (response) => {
      onVerificationStart?.();

      try {
        const verificationResponse = await verifyRazorpayPayment(response);
        if (!verificationResponse?.data?.success) {
          throw new Error(
            verificationResponse?.data?.message || "Payment verification failed",
          );
        }

        hasResolved = true;
        await onVerified?.({
          masterOrderId,
          message:
            verificationResponse?.data?.message ||
            "Payment verified successfully",
          response: verificationResponse,
        });
      } catch (error) {
        hasResolved = true;
        await onVerificationError?.({
          masterOrderId,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to verify payment",
          error,
        });
      } finally {
        onVerificationComplete?.();
      }
    },
  });

  razorpay.on("payment.failed", (event) => {
    hasFailedAttempt = true;
    dismissMessage = event?.error?.description || DEFAULT_FAILURE_MESSAGE;
  });

  razorpay.open();

  return paymentResponse?.data;
};
