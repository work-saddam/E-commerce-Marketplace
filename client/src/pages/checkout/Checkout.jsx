import axios from "axios";
import { BASE_URL } from "../../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../store/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { launchRazorpayPayment } from "../../utils/razorpayPayment";

const Checkout = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);
  const cart = useSelector((store) => store.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchAddresses = async (signal) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/address`, {
        signal,
        withCredentials: true,
      });

      const all = res?.data?.data || [];
      const defaultAdd = all.find((a) => a.isDefault) || all[0] || null;

      setAddresses(all);
      setSelectedAddress(defaultAdd?._id || null);
    } catch (error) {
      if (error?.code === "ERR_CANCELED") {
        return;
      }

      toast.error(
        error?.response?.data?.message || "Failed to fetch addresses",
      );
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAddresses(controller.signal);

    return () => controller.abort();
  }, []);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart was empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    let masterOrderId = null;

    try {
      setLoading(true);
      const orderRes = await axios.post(
        `${BASE_URL}/api/users/checkout`,
        { cart, addressId: selectedAddress, paymentMethod },
        { withCredentials: true },
      );
      if (paymentMethod === "COD") {
        toast.success("Order placed");
        navigate("/account/orders");
        dispatch(clearCart());
      } else if (paymentMethod === "Razorpay") {
        masterOrderId = orderRes?.data?.masterOrderId;
        if (!masterOrderId) {
          throw new Error("Order created but payment could not be initialized");
        }

        await launchRazorpayPayment({
          masterOrderId,
          onDismissed: async ({ hasFailedAttempt, message }) => {
            if (hasFailedAttempt) {
              toast.error(message);
            } else {
              toast(message);
            }

            navigate("/account/orders");
          },
          onVerificationComplete: () => {
            setLoading(false);
          },
          onVerificationError: async ({ message }) => {
            toast.error(message);
            navigate("/account/orders");
          },
          onVerificationStart: () => {
            setLoading(true);
          },
          onVerified: async ({ message }) => {
            toast.success(message || "Payment verified successfully");
            navigate("/account/orders");
            dispatch(clearCart());
          },
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
          error?.message ||
          "Failed to place order";

      if (masterOrderId) {
        toast.error(errorMessage);
        navigate("/account/orders");
        dispatch(clearCart());
        return;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedAddressData = addresses.find((a) => a._id === selectedAddress);

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="bg-white p-4">
        <h3 className="font-semibold text-2xl">Delivery Address</h3>
        {!selectedAddressData ? (
          <div className="mt-6 h-28 border border-gray-500 rounded-lg flex justify-center items-center ">
            <Link to={"/account/addresses"}>
              {" "}
              <p className="text-blue-500">+ Add Delivery address</p>{" "}
            </Link>
          </div>
        ) : (
          <div className=" mt-2">
            <p className="font-medium">{selectedAddressData?.name} </p>
            <p className="text-sm text-gray-700">
              {selectedAddressData?.phone}
            </p>
            <p className="text-sm text-gray-700">
              {selectedAddressData?.street}, {selectedAddressData?.city},{" "}
              {selectedAddressData?.state}, {selectedAddressData?.pincode},{" "}
              {selectedAddressData?.country}
            </p>
            <button
              className="text-blue-500 mt-2 cursor-pointer"
              onClick={() => setShowAllAddress(true)}
            >
              Change delivery address
            </button>
          </div>
        )}

        {showAllAddresses && (
          <div className="mt-4">
            <h4 className="text-xl font-semibold">Select delivery address</h4>
            <div>
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`border rounded-lg p-4 mt-4 cursor-pointer ${
                    selectedAddress === addr._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedAddress(addr._id);
                    setShowAllAddress(false);
                  }}
                >
                  <p className="font-medium">{addr?.name} </p>
                  <p className="text-sm text-gray-700">{addr?.phone}</p>
                  <p className="text-sm text-gray-700">
                    {addr?.street}, {addr?.city}, {addr?.state}, {addr?.pincode}
                    , {addr?.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="bg-white p-4 mt-4">
        <h3 className="font-semibold text-2xl">Select payment methods</h3>
        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="Razorpay"
              checked={paymentMethod === "Razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Razorpay
          </label>
        </div>
      </div>

      <div className=" mt-4">
        <button
          className="px-6 py-3 bg-yellow-500 rounded-lg text-white font-medium hover:bg-yellow-600 disabled:opacity-60"
          disabled={loading}
          onClick={handlePlaceOrder}
        >
          {loading ? "Placing order..." : "Place order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
