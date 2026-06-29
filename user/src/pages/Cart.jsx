import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  Lock,
  ArrowRight,
  Truck,
  PackageOpen,
  CalendarDays,
} from "lucide-react";
import { useCart } from "../features/cart";
import apiClient from "../shared/services/apiClient";
import Loader from "../shared/components/feedback/Loader";
import { routePaths } from "../app/router/routePaths";

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, changeQuantity } = useCart();
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const cartIds = items.map((item) => item._id).join(",");

  // Hydrate cart items from the server when cart item IDs change
  useEffect(() => {
    if (items.length === 0) {
      setFetchedProducts([]);
      return;
    }

    const fetchCartDetails = async () => {
      setLoading(true);
      try {
        const ids = items.map((item) => item._id);
        const response = await apiClient.post("/api/products/bulk", { ids });
        setFetchedProducts(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch cart details:", err);
        toast.error("Failed to load some item details.", {
          style: {
            borderRadius: "12px",
            background: "#1b1c1c",
            color: "#fff",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [cartIds]);

  // Combine Redux quantity with fetched product details
  const hydratedItems = items
    .map((item) => {
      const product = fetchedProducts.find((p) => p._id === item._id);
      if (!product) return null;
      return {
        ...item,
        title: product.title,
        price: product.price,
        imageUrl: product.image?.url || "/images/placeholder.png",
        stock: product.stock !== undefined ? product.stock : 0,
        slug: product.slug || "",
      };
    })
    .filter(Boolean);

  // Totals calculations
  const subtotal = hydratedItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const totalAmount = subtotal;

  const handleQuantityChange = (id, currentQty, newQty, stock) => {
    if (newQty <= 0) {
      removeItem(id);
      toast.success("Item removed from bag", {
        style: {
          borderRadius: "12px",
          background: "#1b1c1c",
          color: "#fff",
        },
      });
      return;
    }

    if (newQty > stock) {
      toast.error(`We're sorry, this quantity is no longer available.`, {
        style: {
          borderRadius: "12px",
          background: "#1b1c1c",
          color: "#fff",
        },
      });
      return;
    }

    changeQuantity(id, newQty);
  };

  const handleRemove = (id) => {
    removeItem(id);
    toast.success("Item removed from bag", {
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
      },
    });
  };

  const handleMoveToWishlist = (item) => {
    removeItem(item._id);
    toast.success(`"${item.title}" moved to wishlist!`, {
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
        border: "1px solid rgba(233, 195, 73, 0.2)",
      },
    });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    toast("Promo code feature is coming soon!", {
      icon: "✨",
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
        border: "1px solid rgba(233, 195, 73, 0.2)",
      },
    });
  };

  const handleCheckout = () => {
    toast.success("Atelier checkout process initiated!", {
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
        border: "1px solid rgba(233, 195, 73, 0.2)",
      },
    });
  };

  if (loading && hydratedItems.length === 0) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center gap-4">
        <Loader size="lg" color="primary" />
        <p className="text-label-caps text-xs text-on-surface-variant/40 tracking-[0.2em] animate-pulse font-bold">
          HYDRATING YOUR BAG...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-low min-h-screen text-on-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <main className="max-w-container-max mx-auto px-margin-edge py-10 md:py-14 min-h-[80vh]">
        {/* Header section */}
        <header className="mb-12 border-b border-outline-variant/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-champagne uppercase tracking-[0.2em] bg-champagne/10 border border-champagne/15 px-3 py-1 rounded-full w-fit block select-none">
              ATELIER SHOPPING
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-charcoal tracking-tight leading-none uppercase">
              Your Bag
            </h1>
          </div>
          <p className="text-xs font-bold font-label-caps text-on-surface-variant/50 uppercase tracking-[0.15em] select-none">
            {items.length === 0
              ? "Your bag is empty"
              : `${items.length} Premium ${
                  items.length === 1 ? "Item" : "Items"
                } Selected`}
          </p>
        </header>

        {items.length === 0 ? (
          /* Empty state view */
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-surface-container/30 border border-outline-variant/10 rounded-3xl gap-6 max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-champagne/10 rounded-full flex items-center justify-center text-champagne border border-champagne/20">
              <PackageOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-charcoal uppercase tracking-tight">
                Your Bag is Empty
              </h3>
              <p className="text-on-surface-variant/75 text-sm max-w-sm mx-auto leading-relaxed">
                Add premium selections from our curated digital watches and cell
                phone collections to fill your atelier inventory.
              </p>
            </div>
            <Link
              to={routePaths.SHOP}
              className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-10 py-5 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-lg rounded-2xl border border-charcoal hover:border-champagne font-bold uppercase active:scale-[0.98]"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 space-y-10">
              <div className="flex flex-col">
                {hydratedItems.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex flex-col md:flex-row gap-8 pb-10 group transition-all duration-500 ${
                      index > 0
                        ? "pt-10 border-t border-outline-variant/10"
                        : ""
                    }`}
                  >
                    {/* Item Image */}
                    <Link
                      to={`/product/${item.slug || item._id}`}
                      className="w-full md:w-44 aspect-square md:aspect-3/4 overflow-hidden bg-surface-container-lowest border border-outline-variant/10 rounded-2xl group-hover:shadow-md transition-all duration-500 relative shrink-0"
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-champagne/5 via-transparent to-transparent pointer-events-none z-10 opacity-70" />
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        src={item.imageUrl}
                        alt={item.title}
                      />
                    </Link>

                    {/* Item Information */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="space-y-1.5">
                          <Link
                            to={`/product/${item.slug || item._id}`}
                            className="font-bold text-lg text-charcoal hover:text-champagne transition-colors duration-300 line-clamp-2 leading-snug"
                          >
                            {item.title}
                          </Link>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest font-label-caps">
                              Premium Selection
                            </span>
                            <span className="text-outline-variant/30 text-[10px] font-black">
                              |
                            </span>
                            {item.stock > 0 ? (
                              <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-600 font-label-caps text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-600 font-label-caps text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 pt-3 text-[11px] font-bold">
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="text-secondary hover:text-champagne underline decoration-outline-variant/40 hover:decoration-champagne transition-all py-0.5 cursor-pointer uppercase tracking-wider"
                            >
                              Move to Wishlist
                            </button>
                            <span className="text-outline-variant/30">|</span>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="text-red-600 hover:text-red-500 underline decoration-red-100 hover:decoration-red-400 transition-all py-0.5 cursor-pointer uppercase tracking-wider"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Item Price */}
                        <span className="font-bold text-lg text-charcoal shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="mt-8 md:mt-0 flex items-center gap-4 select-none">
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest font-label-caps">
                          Quantity
                        </span>
                        <div className="flex items-center border border-outline-variant/30 rounded-xl bg-surface-container-lowest/80 p-1">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity,
                                item.quantity - 1,
                                item.stock,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer text-secondary font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                item.quantity,
                                item.quantity + 1,
                                item.stock,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer text-secondary font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Disclaimer Message */}
              <div className="p-6 bg-surface-container/40 border border-outline-variant/10 rounded-2xl flex items-start gap-4">
                <Truck className="w-6 h-6 text-champagne shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-charcoal">
                    Complimentary Atelier Delivery
                  </p>
                  <p className="text-xs text-on-surface-variant/75 leading-relaxed">
                    Your order qualifies for signature priority shipping,
                    premium box packing, and complimentary hassle-free returns.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 flex flex-col gap-8">
                {/* Summary Box */}
                <div className="bg-surface-container/60 border border-outline-variant/15 rounded-3xl p-6 sm:p-8 space-y-8 backdrop-blur-sm shadow-[0_15px_45px_rgba(0,0,0,0.015)]">
                  <h2 className="font-black text-sm text-charcoal uppercase tracking-[0.2em] border-b border-outline-variant/15 pb-4 select-none">
                    Order Summary
                  </h2>

                  {/* Pricing Breakdown */}
                  <div className="space-y-4 text-sm font-medium">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/75">
                        Subtotal
                      </span>
                      <span className="font-bold text-charcoal">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant/75">
                        Shipping
                      </span>
                      <span className="font-bold text-champagne">
                        Complimentary
                      </span>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest font-label-caps block">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-transparent border-b border-outline-variant focus:border-champagne focus:outline-none py-2 text-xs font-bold uppercase tracking-wider text-charcoal transition-all placeholder:text-on-surface-variant/30"
                      />
                      <button
                        type="submit"
                        className="text-xs font-bold uppercase tracking-wider text-secondary hover:text-champagne border-b border-secondary hover:border-champagne transition-colors cursor-pointer py-1.5"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  {/* Grand Total */}
                  <div className="flex justify-between items-end border-t border-outline-variant/20 pt-6">
                    <span className="font-black text-sm text-charcoal uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-2xl font-black text-charcoal tracking-tight">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* CTA Action Buttons */}
                  <div className="space-y-4">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-charcoal text-surface-container-lowest py-5 font-button text-xs uppercase tracking-[0.2em] font-black hover:bg-champagne hover:text-charcoal transition-all active:scale-[0.98] rounded-xl cursor-pointer shadow-[0_10px_35px_rgba(27,28,28,0.12)]"
                    >
                      Proceed to Checkout
                    </button>
                    <div className="flex items-center justify-center gap-2 opacity-50 select-none">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold font-label-caps uppercase tracking-widest">
                        Secure Checkout Guaranteed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Atelier Concierge Details Card */}
                <div className="p-6 border border-outline-variant/15 rounded-2xl bg-surface-container/20 space-y-4">
                  <h4 className="text-[10px] font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-champagne" />
                    Private Atelier Service
                  </h4>
                  <p className="text-xs text-on-surface-variant/70 leading-relaxed">
                    Every purchase at Trustkart includes a dedicated style
                    consultant for life. Reach out via your dashboard for
                    personalized adjustments or styling advice.
                  </p>
                  <Link
                    to={routePaths.SHOP}
                    className="text-xs font-bold underline decoration-secondary text-secondary hover:text-champagne transition-colors inline-block"
                  >
                    Continue shopping collections
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
