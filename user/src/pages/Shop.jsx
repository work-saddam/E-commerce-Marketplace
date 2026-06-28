import { useState, useEffect } from "react";
import ShopHeader from "./shop/ShopHeader";
import ShopFilters from "./shop/ShopFilters";
import ProductCard from "./shop/ProductCard";
import Pagination from "./shop/Pagination";
import apiClient from "../shared/services/apiClient";
import Loader from "../shared/components/feedback/Loader";
import { Sparkles } from "lucide-react";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Sorting & Filter states
  const [sort, setSort] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          `/api/products?sort=${sort}&page=${currentPage}&limit=${limit}`,
        );
        setProducts(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.total || 0);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          "Unable to load products. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [sort, currentPage, limit, retryTrigger]);

  // Reset page and scroll to top when any filter changes
  useEffect(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, maxPrice, selectedMaterials, selectedColors]);

  // Derived filter categories list dynamically from loaded products
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean)),
  );

  // Derived category counts
  const categoryCounts = products.reduce((acc, p) => {
    if (p.category?.name) {
      acc[p.category.name] = (acc[p.category.name] || 0) + 1;
    }
    return acc;
  }, {});

  // Apply filters on the retrieved products for high-performance responsive UI
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    if (selectedCategory && product.category?.name !== selectedCategory) {
      return false;
    }
    // 2. Price Filter
    if (Number(product.price) > maxPrice) {
      return false;
    }
    // 3. Material Filter
    if (selectedMaterials.length > 0) {
      const descLower = product.description?.toLowerCase() || "";
      const titleLower = product.title?.toLowerCase() || "";
      const matches = selectedMaterials.some((material) => {
        const matWord = material.split(" ").pop().toLowerCase();
        return descLower.includes(matWord) || titleLower.includes(matWord);
      });
      if (!matches) return false;
    }
    // 4. Color Filter
    if (selectedColors.length > 0) {
      const descLower = product.description?.toLowerCase() || "";
      const titleLower = product.title?.toLowerCase() || "";
      const hexToNames = {
        "#1b1c1c": ["black", "charcoal", "dark", "titanium"],
        "#e9c349": ["gold", "champagne", "yellow"],
        "#c4c7c7": ["silver", "grey", "gray", "metal"],
        "#3C3D37": ["olive", "green", "khaki"],
      };
      const matches = selectedColors.some((colorHex) => {
        const keywords = hexToNames[colorHex] || [];
        return keywords.some(
          (kw) => descLower.includes(kw) || titleLower.includes(kw),
        );
      });
      if (!matches) return false;
    }
    return true;
  });

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1); // Reset page on sort change
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-surface-container-low min-h-screen text-on-background selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Aligned using design system edge margins */}
      <main className="max-w-container-max mx-auto px-margin-edge py-8 md:py-10 lg:py-14">
        {/* Header */}
        <ShopHeader
          totalCount={filteredProducts.length}
          currentSort={sort}
          onSortChange={handleSortChange}
        />

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mt-12 md:mt-16">
          {/* Sidebar Filters */}
          <ShopFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
            selectedMaterials={selectedMaterials}
            onMaterialChange={setSelectedMaterials}
            selectedColors={selectedColors}
            onColorChange={setSelectedColors}
            categoryCounts={categoryCounts}
          />

          {/* Product Grid and States */}
          <section className="grow">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4">
                <Loader size="lg" color="primary" />
                <p className="text-label-caps text-xs text-on-surface-variant/40 tracking-[0.2em] animate-pulse">
                  Loading Curated Collection...
                </p>
              </div>
            ) : error ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm gap-4">
                <p className="text-red-500 font-semibold">{error}</p>
                <button
                  onClick={() => setRetryTrigger((prev) => prev + 1)}
                  className="bg-charcoal text-surface-container-lowest font-label-caps text-xs px-6 py-3 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-md rounded cursor-pointer"
                >
                  Retry Load
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm gap-4">
                <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center text-champagne mb-2">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-charcoal">
                  No Products Found
                </h3>
                <p className="text-on-surface-variant/80 text-sm max-w-sm">
                  We couldn't find any products matching your current filters.
                  Try resetting the filters or checking back later.
                </p>
                {(selectedCategory ||
                  selectedMaterials.length > 0 ||
                  selectedColors.length > 0 ||
                  maxPrice < 100000) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedMaterials([]);
                      setSelectedColors([]);
                      setMaxPrice(100000);
                    }}
                    className="mt-2 bg-charcoal text-surface-container-lowest font-label-caps text-xs px-6 py-3 tracking-widest hover:bg-champagne hover:text-charcoal transition-all shadow-md rounded-lg cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* 2-columns on small screens, 3-columns on large screens for a balanced look */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
