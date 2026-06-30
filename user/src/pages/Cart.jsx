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
  ShieldCheck,
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
    if (!cartIds) {
      return;
    }

    const requestCartIds = cartIds;
    // Slower response for an older cart can win the race and replace newer data, so we use a flag to ensure we only update state if the component is still mounted and the request is relevant.
    let isActive = true; // Flag to prevent state updates if the component unmounts

    const fetchCartDetails = async () => {
      setLoading(true);
      try {
        const ids = requestCartIds.split(",");
        const response = await apiClient.post("/api/products/bulk", { ids });
        if (!isActive) return;
        setFetchedProducts(response.data.data || []);
      } catch (err) {
        if (!isActive) return;
        console.error("Failed to fetch cart details:", err);
        toast.error("Failed to load some item details.", {
          style: {
            borderRadius: "12px",
            background: "#1b1c1c",
            color: "#fff",
          },
        });
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchCartDetails();
    return () => {
      isActive = false;
    };
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
    toast("Wishlist support is coming soon.", {
      icon: "✨",
      style: {
        borderRadius: "8px",
        background: "#1b1c1c",
        color: "#fff",
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
            to={routePaths.SHOP}
            className="hover:text-champagne transition-colors duration-300"
          >
            Shop
          </Link>
          <span className="text-on-surface-variant/20">/</span>
          <span className="text-champagne font-bold">Shopping Bag</span>
        </div>

        {/* Header section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight leading-snug">
              Your Shopping Bag
            </h1>
            <p className="text-xs font-bold font-label-caps text-on-surface-variant/50 uppercase tracking-[0.15em] select-none">
              {items.length === 0
                ? "Your bag is empty"
                : `${items.length} ${items.length === 1 ? "item" : "items"} in your bag`}
            </p>
          </div>
          {items.length > 0 && (
            <Link
              to={routePaths.SHOP}
              className="text-xs font-bold text-secondary hover:text-champagne transition-colors uppercase tracking-wider flex items-center gap-1.5 group"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          )}
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
                Explore our curated collections and add premium selections to
                your bag.
              </p>
            </div>
            <Link
              to={routePaths.SHOP}
              className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-10 py-4 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-lg rounded-xl border border-charcoal hover:border-champagne font-bold uppercase active:scale-[0.98]"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Main Cart Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 space-y-5">
              {hydratedItems.map((item) => {
                const isOutOfStock = item.stock === 0;
                const lineTotal = item.price * item.quantity;

                return (
                  <div
                    key={item._id}
                    className={`bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 sm:p-5 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:border-outline-variant/20 ${isOutOfStock ? "opacity-75" : ""}`}
                  >
                    <div className="flex gap-4 sm:gap-5">
                      {/* Product Image */}
                      <Link
                        to={`/product/${item.slug || item._id}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 overflow-hidden bg-surface-container rounded-xl shrink-0 relative group"
                      >
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={item.imageUrl}
                          alt={item.title}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-charcoal/50 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white uppercase tracking-wider">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: Title + Price */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/product/${item.slug || item._id}`}
                              className="font-semibold text-sm sm:text-base text-charcoal hover:text-champagne transition-colors duration-300 line-clamp-2 leading-snug"
                            >
                              {item.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {isOutOfStock ? (
                                <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                  In Stock
                                </span>
                              )}
                              <span className="text-[9px] text-on-surface-variant/30">
                                •
                              </span>
                              <span className="text-[10px] text-on-surface-variant/40 font-medium">
                                ₹{item.price.toLocaleString()} each
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-sm sm:text-lg text-charcoal shrink-0 tabular-nums">
                            ₹{lineTotal.toLocaleString()}
                          </p>
                        </div>

                        {/* Bottom row: Quantity + Actions */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/8">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-surface-container-low border border-outline-variant/15 rounded-lg">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity,
                                    item.quantity - 1,
                                    item.stock,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-l-lg transition-colors cursor-pointer text-on-surface-variant/60 hover:text-charcoal"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-9 text-center text-xs font-bold text-charcoal border-x border-outline-variant/10 leading-8">
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
                                disabled={isOutOfStock}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-r-lg transition-colors cursor-pointer text-on-surface-variant/60 hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveToWishlist(item)}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 hover:text-champagne transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-champagne/5 uppercase tracking-wider"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Wishlist</span>
                            </button>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/50 hover:text-red-500 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-50 uppercase tracking-wider"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Shipping Info Strip */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-champagne/5 border border-champagne/10 rounded-xl">
                <Truck className="w-4 h-4 text-champagne shrink-0" />
                <p className="text-xs text-on-surface-variant/70 font-medium">
                  <span className="font-bold text-charcoal">Free shipping</span>{" "}
                  on all orders — priority delivery with premium packaging.
                </p>
              </div>
            </div>

            {/* Right Column: Sticky Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-5">
                {/* Summary Box */}
                <div className="bg-surface-container-lowest border border-outline-variant/12 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="font-bold text-sm text-charcoal uppercase tracking-wider pb-4 mb-5 border-b border-outline-variant/12">
                    Order Summary
                  </h2>

                  {/* Line Items */}
                  <div className="space-y-3 text-sm mb-5">
                    {hydratedItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between text-on-surface-variant/70"
                      >
                        <span className="line-clamp-1 max-w-[60%] text-xs">
                          {item.title}{" "}
                          <span className="text-on-surface-variant/40">
                            × {item.quantity}
                          </span>
                        </span>
                        <span className="text-xs font-semibold text-charcoal tabular-nums">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 text-sm border-t border-outline-variant/10 pt-4 mb-5">
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

                  {/* Promo Code Input */}
                  <form
                    onSubmit={handleApplyPromo}
                    className="mb-5 border-t border-outline-variant/10 pt-4"
                  >
                    <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider block mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-surface-container-low border border-outline-variant/15 focus:border-champagne focus:outline-none px-3 py-2 text-xs font-medium text-charcoal transition-all placeholder:text-on-surface-variant/30 rounded-lg"
                      />
                      <button
                        type="submit"
                        className="text-[10px] font-bold uppercase tracking-wider bg-charcoal text-surface-container-lowest hover:bg-champagne hover:text-charcoal px-4 py-2 rounded-lg transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center border-t border-charcoal/10 pt-4 mb-5">
                    <span className="font-bold text-sm text-charcoal uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xl font-black text-charcoal tracking-tight tabular-nums">
                      ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* CTA Action Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-charcoal text-surface-container-lowest py-4 font-label-caps text-xs uppercase tracking-[0.2em] font-bold hover:bg-champagne hover:text-charcoal transition-all active:scale-[0.98] rounded-xl cursor-pointer shadow-[0_8px_25px_rgba(27,28,28,0.1)] border border-charcoal hover:border-champagne"
                  >
                    Proceed to Checkout
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-3 select-none">
                    <Lock className="w-3 h-3 text-on-surface-variant/30" />
                    <span className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest">
                      Secure Checkout
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
                    <Truck className="w-4 h-4 text-champagne shrink-0" />
                    <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wider leading-tight">
                      Free Shipping
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-champagne shrink-0" />
                    <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wider leading-tight">
                      Secure Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
