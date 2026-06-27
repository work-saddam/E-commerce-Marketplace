import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { routePaths } from "../../app/router/routePaths";

export default function ShopHeader({
  totalCount = 0,
  currentSort = "newest",
  onSortChange = () => {},
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
  ];

  const activeOption =
    sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];

  const handleSelect = (val) => {
    onSortChange(val);
    setIsOpen(false);
  };

  return (
    <section className="mb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-label-caps text-on-surface-variant/40 mb-6 select-none">
        <Link
          to={routePaths.HOME}
          className="hover:text-champagne transition-colors duration-300"
        >
          Home
        </Link>
        <span className="text-on-surface-variant/20">/</span>
        <span className="text-champagne font-bold">Shop</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
        <div className="space-y-4">
          <span className="text-label-caps text-champagne uppercase tracking-[0.2em] block">
            Curated Collection
          </span>
          <h2 className="text-display-lg-mobile md:text-headline-md lg:text-display-lg text-charcoal font-black tracking-tight leading-none uppercase">
            Shop All Essentials
          </h2>
          <p className="text-body-md text-on-surface-variant/70 max-w-xl text-sm md:text-base leading-relaxed">
            Explore our signature range of artisanal products, where timeless
            craft meets modern luxury. Every piece is selected for its quiet
            confidence and premium quality.
          </p>
        </div>

        {/* Results and Sort Dropdown */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0">
          <span className="text-label-caps text-[10px] text-on-surface-variant/50 tracking-[0.15em] uppercase font-bold shrink-0">
            {totalCount} {totalCount === 1 ? "Result" : "Results"}
          </span>

          <div className="relative shrink-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-4 text-button font-bold border border-charcoal/10 bg-surface-container-lowest px-5 py-3.5 rounded-lg hover:border-champagne/45 hover:bg-charcoal hover:text-surface-container-lowest transition-all duration-300 tracking-wider focus:outline-none min-w-55 justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer select-none"
            >
              <span>SORT BY: {activeOption.label.toUpperCase()}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <>
                {/* Backdrop to close dropdown on click outside */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                />
                <ul className="absolute right-0 mt-2.5 w-full bg-surface-container-lowest border border-outline-variant/15 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-20 overflow-hidden transition-all duration-300">
                  {sortOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        onClick={() => handleSelect(option.value)}
                        className={`w-full text-left px-5 py-3 text-xs font-bold tracking-wider transition-colors hover:bg-champagne/5 hover:text-champagne cursor-pointer block select-none ${
                          option.value === currentSort
                            ? "bg-surface-container-low/30 text-champagne font-extrabold border-l-4 border-champagne"
                            : "text-on-surface-variant/80"
                        }`}
                      >
                        {option.label.toUpperCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
