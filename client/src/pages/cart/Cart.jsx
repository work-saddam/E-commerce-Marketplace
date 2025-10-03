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

  const fetchProduct = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products/${id}`, {
        withCredentials: true,
      });
      // console.log(res?.data?.data);
      return res?.data?.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCartProducts = async () => {
      const promise = cart.map(async (item) => {
        const product = await fetchProduct(item._id);
        return product ? { ...product, quantity: item.quantity } : null;
      });

      const productWithQty = await Promise.all(promise);
      setCartProducts(productWithQty.filter(Boolean));
    };

    if (cart.length > 0) {
      fetchCartProducts();
    } else {
      setCartProducts([]);
    }
  }, [cart]);

  const totalPrice = cartProducts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4 bg-gray-100 h-screen">
      {cartProducts.length === 0 ? (
        <div className="bg-white p-4 flex flex-col items-center">
          <img className="max-w-84" src={empytCart} alt="empty-cart" />
          <p className="text-gray-500 text-lg">Your cart was empty!</p>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="m-4 px-6 py-2 bg-blue-600 rounded-lg text-white cursor-pointer"
          >
            Shop now
          </button>
        </div>
      ) : (
        <div className="bg-white p-4 ">
          <h2 className="font-medium text-2xl mb-6">Your Cart</h2>
          {cartProducts.map((pro) => {
            return <CartProduct key={pro._id} pro={pro} />;
          })}
          <div className="flex justify-between pt-6 border-t-1 border-gray-300">
            <p className="font-medium text-xl">Total: ₹{totalPrice}</p>
            <button className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600 cursor-pointer">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
