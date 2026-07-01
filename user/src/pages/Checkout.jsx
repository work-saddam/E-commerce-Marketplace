import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  Lock,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  MapPin,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../features/cart";
import { clearCart } from "../features/cart/store/cartSlice";
import apiClient from "../shared/services/apiClient";
import Loader from "../shared/components/feedback/Loader";
import { routePaths } from "../app/router/routePaths";
import { launchRazorpayPayment } from "../shared/utils/razorpayPayment";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useCart();

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [loading, setLoading] = useState(false);

  // Cart Hydration State
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // 1. Hydrate Cart Details
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      navigate(routePaths.CART || "/cart");
      return;
    }

    const fetchCartDetails = async () => {
      setProductsLoading(true);
      try {
        const ids = items.map((item) => item._id);
        const response = await apiClient.post("/api/products/bulk", { ids });
        setFetchedProducts(response.data.data || []);
      } catch (err) {
        console.error("Failed to load products details:", err);
      } finally {
        setProductsLoading(false);
      }
    };

    if (items.length > 0) {
      fetchCartDetails();
    }
  }, [items]);

  // 2. Fetch Addresses
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await apiClient.get("/api/users/address");
      const allAddresses = response?.data?.data || [];
      setAddresses(allAddresses);
      const defaultAdd =
        allAddresses.find((a) => a.isDefault) || allAddresses[0] || null;
      if (defaultAdd) {
        setSelectedAddress(defaultAdd._id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      toast.error("Failed to load addresses.");
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Combine details
  const hydratedItems = items
    .map((item) => {
      const product = fetchedProducts.find((p) => p._id === item._id);
      if (!product) return null;
      return {
        ...item,
        title: product.title,
        price: product.price,
        imageUrl: product.image?.url || "/images/placeholder.png",
      };
    })
    .filter(Boolean);

  const subtotal = hydratedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const totalAmount = subtotal;

  // 3. Handle Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();

    // Basic Validations
    if (
      !newAddress.name.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.street.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim() ||
      !newAddress.country.trim()
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    setFormSubmitting(true);
    try {
      const response = await apiClient.post("/api/users/address", newAddress);
      toast.success("Address added successfully!");
      const addedAddress = response.data.data;
      setAddresses((prev) => [addedAddress, ...prev]);
      setSelectedAddress(addedAddress._id);
      setShowAddressForm(false);
      setNewAddress({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
    } catch (error) {
      console.error("Failed to add address:", error);
      toast.error(error?.response?.data?.message || "Failed to add address.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // 4. Handle Delete Address
  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/api/users/address/${id}`);
      toast.success("Address deleted.");
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (selectedAddress === id) {
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
      toast.error("Failed to delete address.");
    }
  };

  // 5. Place Order
  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    setLoading(true);
    let masterOrderId = null;

    try {
      const response = await apiClient.post("/api/users/checkout", {
        cart: items,
        addressId: selectedAddress,
        paymentMethod,
      });

      if (paymentMethod === "COD") {
        toast.success("Order placed successfully!");
        setPlacedOrderDetails({
          orderId: response?.data?.masterOrderId || response?.data?.data?._id || "N/A",
          amount: totalAmount,
          address: addresses.find((a) => a._id === selectedAddress),
          items: hydratedItems,
        });
        setIsSuccess(true);
        dispatch(clearCart());
      } else if (paymentMethod === "Razorpay") {
        masterOrderId = response?.data?.masterOrderId;
        if (!masterOrderId) {
          throw new Error("Order created but payment could not be initialized");
        }

        await launchRazorpayPayment({
          masterOrderId,
          onDismissed: async ({ message }) => {
            toast(message, { icon: "ℹ️" });
            setLoading(false);
          },
          onVerificationComplete: () => {
            setLoading(false);
          },
          onVerificationError: async ({ message }) => {
            toast.error(message);
          },
          onVerificationStart: () => {
            setLoading(true);
          },
          onVerified: async ({ message }) => {
            toast.success(message || "Payment verified successfully!");
            setPlacedOrderDetails({
              orderId: masterOrderId,
              amount: totalAmount,
              address: addresses.find((a) => a._id === selectedAddress),
              items: hydratedItems,
            });
            setIsSuccess(true);
            dispatch(clearCart());
          },
        });
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to place order.");
    } finally {
      if (paymentMethod === "COD") {
        setLoading(false);
      }
    }
  };

  const selectedAddressData = addresses.find((a) => a._id === selectedAddress);

  // Render Success Page
  if (isSuccess && placedOrderDetails) {
    return (
      <div className="w-full bg-surface-container-low min-h-screen text-on-background py-16 px-margin-edge">
        <div className="max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-8 sm:p-12 text-center shadow-lg space-y-8">
          <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black text-champagne uppercase tracking-[0.2em] bg-champagne/10 border border-champagne/15 px-3 py-1 rounded-full w-fit mx-auto block select-none">
              Order Confirmed
            </span>
            <h1 className="text-3xl font-bold text-charcoal tracking-tight leading-snug">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-on-surface-variant/70 max-w-md mx-auto">
              Your signature purchase has been confirmed. A concierge support representative will verify your delivery details shortly.
            </p>
          </div>

          {/* Order Details box */}
          <div className="border border-outline-variant/10 rounded-2xl bg-surface-container/20 p-6 text-left space-y-4">
            <div className="flex justify-between border-b border-outline-variant/10 pb-3">
              <span className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-wider">Order Reference</span>
              <span className="text-xs font-bold text-charcoal tabular-nums">{placedOrderDetails.orderId}</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-wider block">Shipment Destination</span>
              <p className="text-xs font-semibold text-charcoal">{placedOrderDetails.address?.name}</p>
              <p className="text-xs text-on-surface-variant/70">
                {placedOrderDetails.address?.street}, {placedOrderDetails.address?.city},{" "}
                {placedOrderDetails.address?.state} - {placedOrderDetails.address?.pincode}
              </p>
              <p className="text-xs text-on-surface-variant/70">{placedOrderDetails.address?.phone}</p>
            </div>

            <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-center">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Total Amount</span>
              <span className="text-base font-black text-charcoal">₹{placedOrderDetails.amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={routePaths.SHOP}
              className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-10 py-4 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-md rounded-xl border border-charcoal hover:border-champagne font-bold uppercase"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <Link
            to={routePaths.CART}
            className="hover:text-champagne transition-colors duration-300"
          >
            Cart
          </Link>
          <span className="text-on-surface-variant/20">/</span>
          <span className="text-champagne font-bold">Checkout</span>
        </div>

        <header className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight leading-snug">
            Secure Checkout
          </h1>
          <p className="text-xs font-bold font-label-caps text-on-surface-variant/50 uppercase tracking-[0.15em] select-none mt-1">
            Complete your curated order
          </p>
        </header>

        {productsLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader size="lg" color="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Delivery details & Payments */}
            <div className="lg:col-span-8 space-y-8">
              {/* Shipping Address Section */}
              <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest block">
                      01 Delivery Address
                    </span>
                    <h2 className="text-lg font-bold text-charcoal">
                      Where should we deliver?
                    </h2>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-champagne transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {addressesLoading ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader size="sm" color="primary" />
                  </div>
                ) : showAddressForm ? (
                  /* Add address form */
                  <form onSubmit={handleAddAddress} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          Recipient Name
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          placeholder="e.g. Julian Thorne"
                          value={newAddress.name}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="tel"
                          required
                          placeholder="e.g. +91 9876543210"
                          value={newAddress.phone}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          Street Address
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          placeholder="e.g. Apartment, suite, unit, building, street"
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, street: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          City
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          placeholder="San Francisco"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          State
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          placeholder="CA"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, state: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          Pincode
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          placeholder="e.g. 94105"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              pincode: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider mb-2">
                          Country
                        </label>
                        <input
                          className="bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-4 py-2.5 text-sm font-semibold rounded-lg"
                          type="text"
                          required
                          value={newAddress.country}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="bg-charcoal text-surface-container-lowest px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-champagne hover:text-charcoal transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {formSubmitting && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        Save Address
                      </button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  /* No addresses view */
                  <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-outline-variant/20 rounded-xl gap-4">
                    <div className="w-12 h-12 bg-champagne/10 rounded-full flex items-center justify-center text-champagne border border-champagne/20">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal">
                        No Addresses Saved
                      </p>
                      <p className="text-xs text-on-surface-variant/60">
                        Please add a delivery address to complete your checkout.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-charcoal text-surface-container-lowest font-label-caps text-[10px] px-5 py-2.5 tracking-wider hover:bg-champagne hover:text-charcoal transition-all rounded-lg border border-charcoal hover:border-champagne font-bold uppercase cursor-pointer"
                    >
                      + Add Address
                    </button>
                  </div>
                ) : (
                  /* Saved addresses list grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddress === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => setSelectedAddress(addr._id)}
                          className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                            isSelected
                              ? "border-champagne bg-champagne/5"
                              : "border-outline-variant/12 hover:border-outline-variant/30 bg-surface-container-lowest"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-charcoal">
                                {addr.name}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[8px] font-bold bg-champagne/10 border border-champagne/15 text-charcoal px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/70">
                              <Phone className="w-3 h-3" />
                              <span>{addr.phone}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant/70 pt-1 leading-relaxed line-clamp-2">
                              {addr.street}, {addr.city}, {addr.state} -{" "}
                              {addr.pincode}, {addr.country}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-3 mt-3 border-t border-outline-variant/8">
                            <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
                              Select delivery
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(addr._id, e)}
                              className="text-on-surface-variant/40 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Settlement Section */}
              <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 sm:p-6 space-y-6">
                <div className="border-b border-outline-variant/10 pb-4">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest block">
                    02 Settlement Method
                  </span>
                  <h2 className="text-lg font-bold text-charcoal">
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Razorpay Option */}
                  <div
                    onClick={() => setPaymentMethod("Razorpay")}
                    className={`payment-tab p-5 rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[120px] border ${
                      paymentMethod === "Razorpay"
                        ? "border-champagne bg-champagne/5"
                        : "border-outline-variant/12 hover:border-outline-variant/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <CreditCard
                        className={`w-5 h-5 ${
                          paymentMethod === "Razorpay"
                            ? "text-champagne"
                            : "text-on-surface-variant/50"
                        }`}
                      />
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          paymentMethod === "Razorpay"
                            ? "border-champagne bg-champagne text-charcoal"
                            : "border-outline-variant/30"
                        }`}
                      >
                        {paymentMethod === "Razorpay" && (
                          <div className="w-2 h-2 bg-charcoal rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-charcoal">
                        Razorpay
                      </h3>
                      <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-tight">
                        UPI, Netbanking, Cards & Wallets
                      </p>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`payment-tab p-5 rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[120px] border ${
                      paymentMethod === "COD"
                        ? "border-champagne bg-champagne/5"
                        : "border-outline-variant/12 hover:border-outline-variant/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <ShieldCheck
                        className={`w-5 h-5 ${
                          paymentMethod === "COD"
                            ? "text-champagne"
                            : "text-on-surface-variant/50"
                        }`}
                      />
                      <div
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                          paymentMethod === "COD"
                            ? "border-champagne bg-champagne text-charcoal"
                            : "border-outline-variant/30"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-2 h-2 bg-charcoal rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-charcoal">
                        Cash on Delivery
                      </h3>
                      <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-tight">
                        Pay when your order is delivered
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div className="lg:col-span-4 sticky top-28 space-y-5">
              <div className="bg-surface-container-lowest border border-outline-variant/12 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
                <h2 className="font-bold text-sm text-charcoal uppercase tracking-wider pb-4 border-b border-outline-variant/12">
                  Order Summary
                </h2>

                {/* Items Summary list */}
                <div className="divide-y divide-outline-variant/5 max-h-72 overflow-y-auto pr-1">
                  {hydratedItems.map((item) => (
                    <div key={item._id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-12 h-12 bg-surface-container border border-outline-variant/5 rounded-lg overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          src={item.imageUrl}
                          alt={item.title}
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                        <p className="text-xs font-semibold text-charcoal truncate">
                          {item.title}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-on-surface-variant/60 mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-bold text-charcoal tabular-nums">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-3 text-sm border-t border-outline-variant/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant/60 text-xs">
                      Subtotal
                    </span>
                    <span className="font-semibold text-charcoal text-xs tabular-nums">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant/60 text-xs">
                      Shipping
                    </span>
                    <span className="font-semibold text-green-600 text-xs">
                      Free
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center border-t border-charcoal/10 pt-4">
                  <span className="font-bold text-xs text-charcoal uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-lg font-black text-charcoal tracking-tight tabular-nums">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                  className="w-full bg-charcoal text-surface-container-lowest py-4 font-label-caps text-xs uppercase tracking-[0.2em] font-bold hover:bg-champagne hover:text-charcoal transition-all active:scale-[0.98] rounded-xl cursor-pointer shadow-[0_8px_25px_rgba(27,28,28,0.1)] border border-charcoal hover:border-champagne disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Complete Purchase</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 select-none opacity-50">
                  <Lock className="w-3 h-3 text-on-surface-variant/30" />
                  <span className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest">
                    Secure Encrypted Transaction
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
