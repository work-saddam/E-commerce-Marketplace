import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";

const Main = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/products?&sort=${sort}&page=${page}&limit=${limit}`,
        {
          withCredentials: true,
        }
      );
      setProducts(res?.data?.data || []);
      setPagination(res?.data?.pagination || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sort, page, limit]);

  const handlePrev = () => {
    if (page > 1) {
      setSearchParams({ sort: sort, page: page - 1, limit });
    }
  };

  const handleNext = () => {
    if (pagination && page < pagination.totalPages)
      setSearchParams({ sort, page: page + 1, limit });
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10 text-lg text-gray-600">
        Loading products...
      </div>
    );

  if (!products.length)
    return (
      <div className="p-6 text-center text-gray-500 text-xl">
        No products found
      </div>
    );

  return (
    <div className="p-6">
      <div className="flex sm:flex-row justify-between items-center mb-6">
        <select
          value={sort}
          onChange={(e) =>
            setSearchParams({ page: 1, limit, sort: e.target.value })
          }
          className="border border-gray-300 rounded-md p-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low → High</option>
          <option value="price_high">Price: High → Low</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((pro) => (
          <ProductCard key={pro._id} pro={pro} />
        ))}
      </div>

      {pagination && (
        <div className="flex justify-center items-center mt-10 gap-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg border transition-all ${
              page === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            ← Prev
          </button>

          <span className="text-gray-700 font-medium">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={page === pagination.totalPages}
            className={`px-4 py-2 rounded-lg border transition-all ${
              page === pagination.totalPages
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Main;
