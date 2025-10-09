import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";

const ProductDetails = () => {
  const cart = useSelector((store) => store.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState({});
  const params = useParams();
  const id = params.slug.split("-").at(-1);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/products/${id}`);
      setProduct(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const itemInCart = cart.find((item) => item._id === product._id);

  return loading ? (
    <div className="p-6 text-2xl text-gray-500">Loading...</div>
  ) : !product._id ? (
    <div className="p-6 text-2xl text-gray-500">Product not found!</div>
  ) : (
    <div className="p-4 sm:p-8 lg:p-12 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg">
            <img
              className="w-full max-h-[500px] object-contain rounded-xl transition-transform duration-300 hover:scale-105"
              src={product?.image?.url}
              alt={product?.title}
            />
          </div>
        </div>

        <div className="flex flex-col ">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-snug">
            {product.title}
          </h2>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-bold text-yellow-600">
              ₹{product.price}
            </span>
            <span className="text-gray-500 text-lg">Incl. all taxes</span>
          </div>

          <p
            className={`mt-3 font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <button
            className="mt-6 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md text-white transition-colors w-fit cursor-pointer"
            disabled={product.stock <= 0}
            onClick={() => {
              itemInCart
                ? navigate("/cart")
                : dispatch(
                    addToCart({
                      _id: product._id,
                    })
                  );
            }}
          >
            {itemInCart
              ? "Go to cart"
              : product.stock > 0
              ? "Add to cart"
              : "Out of Stock"}
          </button>

          <hr className="my-8 border-gray-300" />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Product Details
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
