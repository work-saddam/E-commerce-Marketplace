import { useSelector } from "react-redux";
import { BASE_URL } from "../../utils/constants";
import axios from "axios";
import { useEffect, useState } from "react";
import empytCart from "../../assets/empty-cart.png";
import { useNavigate } from "react-router-dom";
import CartProduct from "./CartProduct";

const Cart = () => {
  const navigate = useNavigate();
  const cart = useSelector((store) => store.cart);
  const [cartProducts, setCartProducts] = useState([]);

  const fetchCartProducts = async () => {
    if (cart.length === 0) {
      setCartProducts([]);
      return;
    }

    try {
      const ids = cart.map((item) => item._id);
      const res = await axios.post(
        `${BASE_URL}/api/products/bulk`,
        { ids },
        { withCredentials: true }
      );

      const products = res?.data?.data;

      const merged = products.map((product) => {
        const found = cart.find((item) => item._id === product._id);
        return { ...product, quantity: found?.quantity || 1 };
      });

      setCartProducts(merged);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCartProducts();
  }, [cart]);

  const totalPrice = cartProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-8">
      {cartProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-16 bg-white pb-8 rounded-xl">
          <img
            className="max-w-xs sm:max-w-sm mb-6"
            src={empytCart}
            alt="empty-cart"
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
            Your cart is empty!
          </h2>
          <p className="text-gray-500">
            Looks like you haven’t added anything yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-8 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT SIDE - CART ITEMS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              Your Cart
            </h2>

            <div className="divide-y divide-gray-200">
              {cartProducts.map((pro) => (
                <CartProduct key={pro._id} pro={pro} />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="bg-white rounded-2xl shadow p-6 h-fit sticky top-24">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Order Summary
            </h3>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Delivery Charges</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>

            <button className="mt-6 w-full rounded-lg bg-yellow-500 text-white font-medium py-3 text-lg hover:bg-yellow-600 transition-all shadow-md active:scale-95">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
