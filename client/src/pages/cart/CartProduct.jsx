import { useDispatch } from "react-redux";
import {
  addToCart,
  decreaseQuantity,
  removeFromCart,
} from "../../store/cartSlice";

const CartProduct = ({ pro }) => {
  const dispatch = useDispatch();
  return (
    <div className="flex gap-6 py-4 border-t-1 border-gray-300">
      <div>
        <img className="w-55" src={pro.image.url} alt={pro.title} />
      </div>

      <div>
        <h3 className=" sm:text-xl line-clamp-1">{pro.title}</h3>
        <p
          className={`sm:mt-2  ${
            pro.stock > 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {pro.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>
        <p>₹{pro.price}</p>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => dispatch(decreaseQuantity({ _id: pro._id }))}
            className="px-3 sm:py-1 bg-gray-200 rounded"
          >
            -
          </button>
          <span>{pro.quantity}</span>
          <button
            onClick={() => dispatch(addToCart({ _id: pro._id }))}
            className="px-3 sm:py-1 bg-gray-200 rounded"
          >
            +
          </button>

          <button
            onClick={() => {
              dispatch(removeFromCart({ _id: pro._id }));
            }}
            className="ml-2 font-medium hover:text-red-500 cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
