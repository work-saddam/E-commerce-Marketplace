import toast from "react-hot-toast";
import { PackageX, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent navigating if a detail page is set up
    if (isOutOfStock) {
      return;
    }

    toast.success(`Added "${product.title}" to cart!`, {
      style: {
        borderRadius: "8px",
        background: "#1b1c1c",
        color: "#fff",
      },
    });
  };

  const formattedPrice = `₹${Number(product.price).toLocaleString()}`;
  const imageUrl = product.image?.url || "/images/placeholder.png";

  return (
    <Link
      to={`/product/${product.slug || product._id}`}
      className="product-card-hover group cursor-pointer relative overflow-hidden bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-champagne/35 flex flex-col justify-between h-full"
    >
      <div>
        <div className="relative aspect-square overflow-hidden bg-surface-container rounded-xl">
          <img
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            src={imageUrl}
            alt={product.title}
            loading="lazy"
          />
          {/* Overlay with Add to Bag button */}
          <div className="overlay absolute inset-0 bg-linear-to-t from-charcoal/80 via-charcoal/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isOutOfStock ? (
              <div className="w-full rounded-xl border border-white/10 bg-white/10 backdrop-blur-md px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-100 ring-1 ring-inset ring-red-400/20">
                    <PackageX className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-label-caps text-[9px] uppercase tracking-[0.24em] text-white/60 font-bold">
                      Unavailable
                    </p>
                    <p className="text-sm font-semibold text-white">
                      Sold out for now
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-charcoal text-surface-container-lowest font-label-caps text-xs py-3.5 w-full transform translate-y-4 group-hover:translate-y-0 transition-[transform,background-color,color] duration-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-champagne hover:text-charcoal cursor-pointer shadow-lg rounded-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
            )}
          </div>
          {/* Badges */}
          {isOutOfStock ? (
            <span className="absolute top-3 left-3 font-label-caps text-[9px] bg-red-600 px-2.5 py-1 text-white tracking-widest rounded font-bold shadow-md">
              OUT OF STOCK
            </span>
          ) : product.createdAt &&
            new Date(product.createdAt) > // less than 15 days old
              new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) ? (
            <span className="absolute top-3 left-3 font-label-caps text-[9px] bg-background px-2.5 py-1 text-charcoal tracking-widest rounded font-bold border border-charcoal/20 shadow-md">
              NEW
            </span>
          ) : null}
        </div>
        <div className="mt-5 space-y-2 px-1">
          <p className="text-label-caps text-[9px] text-on-surface-variant/40 uppercase tracking-[0.2em] font-bold">
            {product.category?.name || "TRUSTKART ESSENTIALS"}
          </p>
          <h3 className="font-semibold text-sm md:text-base text-charcoal line-clamp-2 leading-snug group-hover:text-champagne transition-colors duration-300">
            {product.title}
          </h3>
        </div>
      </div>
      <div className="mt-5 px-1 flex justify-between items-center">
        <p className="font-bold text-base md:text-lg text-charcoal">
          {formattedPrice}
        </p>
        {product.stock > 0 && product.stock <= 5 && (
          <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded">
            Only {product.stock} Left!
          </span>
        )}
      </div>
    </Link>
  );
}
