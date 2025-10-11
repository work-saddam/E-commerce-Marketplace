import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decreaseQuantity } from "../store/cartSlice";

const ProductCard = ({ pro }) => {
  const { _id, title, slug, image, price } = pro;
  const dispatch = useDispatch();
  const cart = useSelector((store) => store.cart);

  const itemInCart = cart.find((item) => item._id === pro._id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  return (
    <div className="rounded-lg border bg-white shadow hover:shadow-lg overflow-hidden">
      <Link to={`/product/${slug}`}>
        <div className="h-60 flex items-center justify-center">
          <img
            className="max-h-full max-w-full object-contain pt-4"
            src={image?.url}
            alt={title}
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-base font-medium line-clamp-1">{title}</h3>

        <div className="mt-3 flex justify-between items-center">
          <p className=" text-lg font-bold text-gray-800">₹{price}</p>

          {quantity === 0 ? (
            <button
              onClick={() => {
                dispatch(addToCart({ _id }));
              }}
              className="px-4 py-2 bg-yellow-400 rounded-lg font-medium hover:bg-yellow-500 transition-colors cursor-pointer"
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <button
                onClick={() => dispatch(decreaseQuantity({ _id }))}
                className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="px-4 py-1 text-lg text-gray-800 ">
                {quantity}
              </span>
              <button
                onClick={() => dispatch(addToCart({ _id }))}
                className="px-3 py-1 text-lg font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
