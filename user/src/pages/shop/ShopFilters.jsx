import { useState } from "react";
import { X, Check } from "lucide-react";

export default function ShopFilters({
  categories = [],
  selectedCategory = "",
  onCategoryChange = () => {},
  maxPrice = 100000,
  onPriceChange = () => {},
  selectedMaterials = [],
  onMaterialChange = () => {},
  selectedColors = [],
  onColorChange = () => {},
  categoryCounts = {},
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const materialsList = ["Premium Leather", "Reclaimed Oak", "Brushed Steel"];

  const colorsList = [
    { name: "Charcoal", hex: "#1b1c1c", class: "bg-charcoal" },
    { name: "Champagne Gold", hex: "#e9c349", class: "bg-champagne" },
    { name: "Silver", hex: "#c4c7c7", class: "bg-outline-variant" },
    { name: "Olive", hex: "#3C3D37", class: "bg-[#3C3D37]" },
  ];

  const handleMaterialClick = (material) => {
    if (selectedMaterials.includes(material)) {
      onMaterialChange(selectedMaterials.filter((m) => m !== material));
    } else {
      onMaterialChange([...selectedMaterials, material]);
    }
  };

  const handleColorClick = (colorHex) => {
    if (selectedColors.includes(colorHex)) {
      onColorChange(selectedColors.filter((c) => c !== colorHex));
    } else {
      onColorChange([...selectedColors, colorHex]);
    }
  };

  const renderFiltersContent = () => (
    <div className="space-y-10">
      {/* Category Section */}
      <div>
        <h4 className="text-label-caps text-charcoal mb-5 border-b border-outline-variant/10 pb-2 uppercase tracking-[0.15em] font-bold">
          Category
        </h4>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => {
                onCategoryChange("");
                setIsMobileOpen(false);
              }}
              className={`w-full text-left text-body-md text-sm transition-all duration-300 flex justify-between items-center hover:text-champagne cursor-pointer select-none py-1 ${
                selectedCategory === ""
                  ? "text-champagne font-bold pl-2 border-l-2 border-champagne"
                  : "text-on-surface-variant/80 hover:pl-1"
              }`}
            >
              <span>All Products</span>
              <span className="text-[10px] font-bold bg-surface-container px-2.5 py-0.5 rounded-full text-charcoal/50">
                {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
              </span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => {
                  onCategoryChange(cat);
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left text-body-md text-sm transition-all duration-300 flex justify-between items-center hover:text-champagne cursor-pointer select-none py-1 ${
                  selectedCategory === cat
                    ? "text-champagne font-bold pl-2 border-l-2 border-champagne"
                    : "text-on-surface-variant/80 hover:pl-1"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] font-bold bg-surface-container px-2.5 py-0.5 rounded-full text-charcoal/50">
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Section */}
      <div>
        <h4 className="text-label-caps text-charcoal mb-5 border-b border-outline-variant/10 pb-2 uppercase tracking-[0.15em] font-bold">
          Price Range
        </h4>
        <div className="px-1 space-y-4">
          <input
            className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-champagne outline-none transition-all duration-300 focus:ring-1 focus:ring-champagne/30"
            max="100000"
            min="0"
            step="500"
            type="range"
            value={maxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
          />
          <div className="flex justify-between items-center font-label-caps text-[10px] text-on-surface-variant/60 tracking-wider">
            <span>₹0</span>
            <span className="font-bold text-champagne text-xs bg-champagne-light/35 px-2 py-0.5 rounded">
              UP TO ₹{maxPrice.toLocaleString()}
            </span>
            <span>₹100,000+</span>
          </div>
        </div>
      </div>

      {/* Material Section */}
      <div>
        <h4 className="text-label-caps text-charcoal mb-5 border-b border-outline-variant/10 pb-2 uppercase tracking-[0.15em] font-bold">
          Material
        </h4>
        <ul className="space-y-3.5">
          {materialsList.map((material) => (
            <li key={material} className="flex items-center gap-3">
              <input
                className="w-4.5 h-4.5 border-charcoal/20 text-champagne focus:ring-0 rounded-md cursor-pointer accent-champagne transition-all duration-300"
                id={`mat-${material}`}
                type="checkbox"
                checked={selectedMaterials.includes(material)}
                onChange={() => handleMaterialClick(material)}
              />
              <label
                className="text-body-md text-sm text-on-surface-variant/80 cursor-pointer select-none hover:text-charcoal transition-colors duration-300"
                htmlFor={`mat-${material}`}
              >
                {material}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Color Section */}
      <div>
        <h4 className="text-label-caps text-charcoal mb-5 border-b border-outline-variant/10 pb-2 uppercase tracking-[0.15em] font-bold">
          Color
        </h4>
        <div className="flex flex-wrap gap-3">
          {colorsList.map((color) => {
            const isSelected = selectedColors.includes(color.hex);
            return (
              <button
                key={color.name}
                onClick={() => handleColorClick(color.hex)}
                className={`w-7.5 h-7.5 rounded-full border border-outline-variant/20 flex items-center justify-center transition-all duration-300 cursor-pointer ring-offset-2 hover:scale-110 active:scale-95 ${color.class} ${
                  isSelected
                    ? "ring-2 ring-champagne scale-105"
                    : "hover:ring-1 hover:ring-charcoal/40"
                }`}
                title={color.name}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 font-extrabold ${
                      color.name === "Champagne Gold" || color.name === "Silver"
                        ? "text-charcoal"
                        : "text-surface-container-lowest"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-surface-container-lowest/40 border border-outline-variant/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
          {renderFiltersContent()}
        </div>
      </aside>

      {/* Mobile Filters Floating FAB Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 lg:hidden bg-charcoal text-surface-container-lowest border border-champagne/30 px-8 py-4 font-label-caps text-xs tracking-widest shadow-2xl flex items-center gap-3 active:scale-95 hover:bg-black transition-all cursor-pointer rounded-full select-none"
      >
        <span className="w-2 h-2 rounded-full bg-champagne animate-pulse"></span>
        <span>FILTERS</span>
        {(selectedCategory ||
          selectedMaterials.length > 0 ||
          selectedColors.length > 0) && (
          <span className="bg-champagne text-charcoal text-[9px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
            !
          </span>
        )}
      </button>

      {/* Mobile Drawer Overlay & Content */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Sliding Content Container */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-surface-container-lowest shadow-2xl flex flex-col z-50 animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/10">
              <h3 className="text-label-caps text-sm text-charcoal tracking-widest font-bold">
                FILTERS
              </h3>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container rounded-full text-on-surface-variant transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 hide-scrollbar">
              {renderFiltersContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
