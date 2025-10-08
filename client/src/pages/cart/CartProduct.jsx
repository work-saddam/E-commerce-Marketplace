import { useDispatch } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "../../store/cartSlice";
import { Link } from "react-router-dom";

const CartProduct = ({ pro }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex gap-6 py-4  ">
      <Link to={`/product/${pro.slug}`}>
        <div className="h-30 sm:h-38 w-30 sm:w-38 overflow-hidden flex items-center justify-center">
          <img
            className="object-contain max-h-full max-w-full"
            src={pro.image?.url}
            alt={pro.title}
          />
        </div>
      </Link>

      <div>
        <Link to={`/product/${pro.slug}`}>
          <h3 className=" sm:text-lg font-medium text-gray-800 line-clamp-2 sm:line-clamp-1">
            {pro.title}
          </h3>
        </Link>
        <p
          className={`sm:mt-2  ${
            (pro.stock ?? 0) > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {(pro.stock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
        </p>
        <p className="mt-1 sm:text-xl font-medium text-gray-900">
          ₹{pro.price ?? 0}
        </p>

        <div className="mt-3 flex  items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <button
              onClick={() => dispatch(decreaseQuantity({ _id: pro._id }))}
              className="px-2 sm:px-3 py-1  font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span className="px-2 sm:px-4 py-1 text-gray-800 ">
              {pro.quantity}
            </span>
            <button
              onClick={() => dispatch(addToCart({ _id: pro._id }))}
              className="px-2 sm:px-3 py-1  font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={() => {
              dispatch(removeFromCart({ _id: pro._id }));
            }}
            className="sm:text-lg font-medium text-gray-500 hover:text-red-600 "
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
