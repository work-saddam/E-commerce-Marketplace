import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Star,
  ArrowRight,
  Package,
  Cpu,
  Feather,
} from "lucide-react";
import apiClient from "../shared/services/apiClient";
import Loader from "../shared/components/feedback/Loader";
import { routePaths } from "../app/router/routePaths";
import ProductCard from "./shop/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const id = slug && slug.includes("-") ? slug.split("-").pop() : slug;
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product detail and similar products
  useEffect(() => {
    const fetchPDPData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch main product details
        const detailRes = await apiClient.get(`/api/products/${id}`);
        const productData = detailRes.data.data;
        setProduct(productData);

        // 2. Fetch similar products for recommendations
        const listRes = await apiClient.get(`/api/products?limit=15`);
        const allProducts = listRes.data.data || [];

        // Filter out current product and limit to 4 items
        const filtered = allProducts.filter((p) => p._id !== id).slice(0, 4);
        setSimilarProducts(filtered);
      } catch (err) {
        console.error("PDP Fetch Error:", err);
        setError("Unable to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPDPData();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    toast.success(`Added "${product.title}" to cart!`, {
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
        border: "1px solid rgba(233, 195, 73, 0.2)",
      },
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from wishlist" : "Added to wishlist", {
      style: {
        borderRadius: "12px",
        background: "#1b1c1c",
        color: "#fff",
        border: "1px solid rgba(233, 195, 73, 0.2)",
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center gap-4">
        <Loader size="lg" color="primary" />
        <p className="text-label-caps text-xs text-on-surface-variant/40 tracking-[0.2em] animate-pulse font-bold">
          LOADING TRUSTKART STUDIO...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center text-center p-8 gap-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 border border-red-500/20">
          <Package className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-charcoal uppercase tracking-tight">
          Product Not Found
        </h3>
        <p className="text-on-surface-variant/80 text-sm max-w-sm">
          {error ||
            "The product you are looking for does not exist or has been removed."}
        </p>
        <Link
          to={routePaths.SHOP}
          className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-10 py-5 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-lg rounded-2xl border border-charcoal hover:border-champagne font-bold uppercase active:scale-[0.98]"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const formattedPrice = `₹${Number(product.price).toLocaleString()}`;
  const imageUrl = product.image?.url || "/images/placeholder.png";

  const isWatch = product.category?.name?.toLowerCase().includes("watch");
  const isMobile =
    product.category?.name?.toLowerCase().includes("mobile") ||
    product.category?.name?.toLowerCase().includes("phone");

  const categoryLabel = product.category?.name || "TRUSTKART CURATED";

  // Custom Specs adapted dynamically to backend data
  const specTitle = isWatch
    ? "Mastery In Motion"
    : isMobile
      ? "Core Engine"
      : "Artisanal Integrity";
  const specText = isWatch
    ? "The Horizon collection features our proprietary digital core, encased in aerospace grade housing. Every component is hand-inspected to ensure the seamless merger of traditional horology and cutting-edge silicon."
    : isMobile
      ? "Powered by flagship silicon processing and premium hardware display panels, our digital pieces are encased in light, reinforced alloy frames built to endure."
      : "A beautiful intersection of quiet confidence and utility. Poised, sophisticated, and designed for those who demand excellence in every detail.";

  const specsList = isWatch
    ? [
        {
          title: "PRECISION HOUSING",
          desc: "Matte casing with scratch-resistant, anti-reflective sapphire crystal cover.",
          icon: ShieldCheck,
        },
        {
          title: "ENDURANCE POWER",
          desc: "Up to 7 days of active reserve power with our low-energy state core technology.",
          icon: Cpu,
        },
        {
          title: "ARTISANAL CONNECTIVITY",
          desc: "High-grade low-latency syncing engineered by master technicians.",
          icon: Feather,
        },
      ]
    : isMobile
      ? [
          {
            title: "ULTRA DISPLAY",
            desc: "Dynamic high-refresh rate screen providing crisp details and smooth motion.",
            icon: ShieldCheck,
          },
          {
            title: "ELITE PERFORMANCE",
            desc: "Flagship silicon processor for high-speed multitasking and durability.",
            icon: Cpu,
          },
          {
            title: "TITANIUM CHASSIS",
            desc: "Lightweight, aerospace-grade titanium frame built for drop protection.",
            icon: Feather,
          },
        ]
      : [
          {
            title: "PREMIUM FINISH",
            desc: "Hand-inspected materials crafted with focus on aesthetics and utility.",
            icon: ShieldCheck,
          },
          {
            title: "INTENTIONAL CRAFT",
            desc: "Poised, sophisticated design profile tailored for everyday confidence.",
            icon: Cpu,
          },
          {
            title: "LIFETIME SERVICE",
            desc: "Includes complimentary shipping, active warranty protection, and support.",
            icon: Feather,
          },
        ];

  return (
    <div className="w-full bg-surface-container-low min-h-screen text-on-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* 1. Main PDP Section */}
      <section className="max-w-container-max mx-auto px-margin-edge py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-label-caps text-on-surface-variant/40 select-none">
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
            <span className="text-champagne font-bold truncate max-w-50">
              {product.title}
            </span>
          </div>

          {/* Main Photo Card with gold accent & glow */}
          <div className="relative aspect-square md:aspect-4/5 bg-surface-container-lowest border border-outline-variant/10 rounded-3xl overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.02)] transition-all duration-700 hover:shadow-[0_30px_60px_rgba(233,195,73,0.04)]">
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-champagne/5 via-transparent to-transparent pointer-events-none z-10 opacity-70" />
            <img
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              src={imageUrl}
              alt={product.title}
            />
            {isOutOfStock ? (
              <span className="absolute top-6 left-6 bg-red-600/90 text-white backdrop-blur-md font-label-caps text-[10px] px-4 py-2 tracking-widest uppercase rounded-lg shadow-lg border border-red-500/20 font-bold z-20">
                Unavailable
              </span>
            ) : product.stock <= 5 ? (
              <span className="absolute top-6 left-6 bg-champagne text-charcoal backdrop-blur-md font-label-caps text-[10px] px-4 py-2 tracking-widest uppercase rounded-lg font-bold shadow-lg border border-champagne/20 z-20">
                Only {product.stock} Left
              </span>
            ) : (
              <span className="absolute top-6 left-6 bg-charcoal/95 text-surface-container-lowest backdrop-blur-md font-label-caps text-[10px] px-4 py-2 tracking-widest uppercase rounded-lg font-bold shadow-lg border border-white/5 z-20">
                Premium Studio
              </span>
            )}
          </div>

          {/* Visual Gallery Thumbnails in Glassmorphic styling */}
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square bg-surface-container-lowest rounded-2xl cursor-pointer border-2 border-champagne p-1.5 shadow-[0_8px_20px_rgba(233,195,73,0.08)]">
              <img
                className="w-full h-full object-cover rounded-xl"
                src={imageUrl}
                alt="Thumbnail 1"
              />
            </div>
            <div className="aspect-square bg-surface-container-lowest/40 rounded-2xl cursor-pointer border border-outline-variant/10 p-1.5 shadow-sm opacity-50 hover:opacity-100 transition-all duration-300 hover:border-champagne/40">
              <img
                className="w-full h-full object-cover rounded-xl filter grayscale"
                src={imageUrl}
                alt="Thumbnail 2"
              />
            </div>
            <div className="aspect-square bg-surface-container-lowest/40 rounded-2xl cursor-pointer border border-outline-variant/10 p-1.5 shadow-sm opacity-50 hover:opacity-100 transition-all duration-300 hover:border-champagne/40">
              <img
                className="w-full h-full object-cover rounded-xl filter sepia brightness-[0.95]"
                src={imageUrl}
                alt="Thumbnail 3"
              />
            </div>
            <div className="aspect-square bg-surface-container-lowest/30 rounded-2xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-on-surface-variant/30 shadow-inner select-none">
              <span className="font-label-caps text-[9px] uppercase tracking-widest font-black">
                STUDIO
              </span>
              <span className="text-[7px] tracking-widest font-bold opacity-60">
                ZOOM
              </span>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col justify-center pt-4 lg:pt-12 space-y-5">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-champagne uppercase tracking-[0.25em] bg-champagne/10 border border-champagne/15 px-3.5 py-1.5 rounded-full w-fit block shadow-sm select-none">
              {categoryLabel}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Ratings badge capsule */}
          <div className="flex items-center gap-3 bg-surface-container/60 border border-outline-variant/10 px-4 py-2 rounded-full w-fit backdrop-blur-sm shadow-sm select-none">
            <div className="flex text-champagne">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <div className="w-px h-3 bg-outline-variant/20" />
            <span className="text-[9px] font-black text-charcoal/60 tracking-[0.15em] uppercase">
              42 REVIEWS
            </span>
          </div>

          {/* Price Callout */}
          <div className="bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-5 space-y-1.5 shadow-sm">
            <div className="text-2xl md:text-3xl font-black text-charcoal tracking-tight flex items-baseline gap-1">
              {formattedPrice}
            </div>
            <p className="text-[10px] font-extrabold text-on-surface-variant/40 tracking-[0.15em] uppercase leading-none">
              Inclusive of all taxes & complimentary priority shipping
            </p>
          </div>

          {/* Description */}
          <p className="text-body-md text-on-surface-variant/80 text-sm md:text-base leading-relaxed font-medium">
            {product.description}
          </p>

          {/* Actions & Buttons */}
          <div className="flex items-center gap-3 pt-5 border-t border-outline-variant/10">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`grow font-label-caps text-xs py-4 px-8 uppercase tracking-[0.2em] font-black flex items-center justify-center gap-3 transition-all duration-500 rounded-xl shadow-[0_10px_35px_rgba(27,28,28,0.15)] cursor-pointer active:scale-[0.98] animate-shimmer-btn ${
                isOutOfStock
                  ? "bg-charcoal/10 text-charcoal/30 cursor-not-allowed shadow-none border border-charcoal/5"
                  : "bg-charcoal text-surface-container-lowest hover:bg-champagne hover:text-charcoal hover:shadow-[0_15px_40px_rgba(233,195,73,0.25)] border border-charcoal hover:border-champagne"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center border border-outline-variant/35 rounded-xl w-14 h-14 transition-all duration-300 group cursor-pointer hover:border-champagne/45 bg-surface-container-lowest shadow-md active:scale-95 ${
                isFavorite
                  ? "text-red-500 border-red-500 bg-red-50/20"
                  : "text-charcoal"
              }`}
              title="Add to Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isFavorite ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Shipping and warranty policies */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center border-t border-outline-variant/10 pt-5 text-[9px] font-label-caps tracking-[0.18em] text-on-surface-variant/50">
            <div className="flex items-center gap-2 font-bold">
              <Truck className="w-4 h-4 text-champagne shrink-0" />
              <span>COMPLIMENTARY SHIPPING</span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-champagne shrink-0" />
              <span>SECURE TRANSACTION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Craftsmanship Section ("Bento Grid Layout") */}
      <section className="bg-charcoal text-surface-container-lowest py-24 overflow-hidden relative">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-champagne/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="max-w-container-max mx-auto px-margin-edge space-y-16 relative">
          {/* Header */}
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-black text-champagne uppercase tracking-[0.25em] block">
              Architectural Detail
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-champagne leading-none uppercase">
              {specTitle}
            </h2>
            <p className="text-body-md text-surface-container-high/70 text-sm md:text-base leading-relaxed">
              {specText}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column Bento Specs */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Feature Cards */}
              {specsList.map((spec, index) => {
                const IconComponent = spec.icon;
                return (
                  <div
                    key={index}
                    className={`bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4 hover:border-champagne/30 transition-all duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] ${
                      index === 0
                        ? "sm:col-span-2 bg-linear-to-br from-white/10 to-white/5"
                        : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-champagne/10 border border-champagne/20 flex items-center justify-center text-champagne shadow-inner">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-label-caps text-sm text-surface-container-lowest uppercase tracking-wider font-black">
                        {spec.title}
                      </h4>
                      <p className="text-xs text-surface-container-high/60 leading-relaxed">
                        {spec.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column Bento Image Showcase */}
            <div className="lg:col-span-6 relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-87.5 lg:min-h-full">
              <div className="absolute inset-0 bg-linear-to-t from-charcoal via-transparent to-transparent opacity-65 z-10 transition-opacity duration-500 group-hover:opacity-40" />
              <img
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] transition-transform duration-1000 group-hover:scale-105"
                src={imageUrl}
                alt={product.title}
              />

              {/* Bottom text overlays */}
              <div className="absolute bottom-8 left-8 right-8 z-20 space-y-2">
                <span className="text-[9px] font-black text-champagne uppercase tracking-[0.2em]">
                  EDITORIAL PORTFOLIO
                </span>
                <h3 className="text-2xl font-black text-surface-container-lowest uppercase tracking-tight">
                  {product.title}
                </h3>
              </div>

              {/* Watermark hollow typography floating */}
              <div className="absolute -top-6 -right-6 font-display-xl text-[110px] leading-none text-stroke opacity-[0.03] uppercase select-none pointer-events-none z-0 tracking-tighter">
                {isWatch ? "HORO" : isMobile ? "CELL" : "CRAFT"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recommended Items Section */}
      {similarProducts.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-edge py-20 md:py-24 relative">
          <div className="flex justify-between items-end mb-16 border-b border-outline-variant/10 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-champagne uppercase tracking-[0.2em] bg-champagne/10 border border-champagne/15 px-3 py-1 rounded-full w-fit block select-none">
                CURATED COLLECTIONS
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-charcoal uppercase tracking-tight leading-none">
                Complete The Look
              </h2>
            </div>
            <Link
              to={routePaths.SHOP}
              className="text-label-caps text-xs text-charcoal hover:text-champagne transition-all flex items-center gap-2 font-bold group select-none border-b border-charcoal/30 pb-0.5"
            >
              <span>VIEW SHOP</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((simProduct) => (
              <ProductCard key={simProduct._id} product={simProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
