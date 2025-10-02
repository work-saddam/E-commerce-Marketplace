import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, decreaseQuantity } from "../store/cartSlice";

const ProductCard = ({ pro }) => {
  const dispatch = useDispatch();
  const cart = useSelector((store) => store.cart);

  const itemInCart = cart.find((item) => item._id === pro._id);
  const quantity = itemInCart ? itemInCart.quantity : 0;

  return (
    <div className="rounded-lg border bg-white shadow hover:shadow-lg overflow-hidden">
      <Link to={`/product/${pro.slug}`}>
        <div className="h-60 flex items-center justify-center">
          <img
            className="max-h-full max-w-full object-contain"
            src={pro.image.url}
            alt={pro.title}
          />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-base font-medium line-clamp-1">{pro.title}</h3>

        <div className="mt-3 flex justify-between items-center">
          <p className=" text-lg font-bold text-gray-800">₹{pro.price}</p>

          {quantity === 0 ? (
            <button
              onClick={() => {
                dispatch(addToCart({ _id: pro._id }));
              }}
              className="px-4 py-2 bg-yellow-400 rounded-lg font-medium hover:bg-yellow-500 transition-colors cursor-pointer"
            >
              Add to cart
            </button>
          ) : (
            <div className="flex items-center gap-2 ">
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                onClick={() => dispatch(decreaseQuantity({ _id: pro._id }))}
              >
                -
              </button>
              <span className="font-medium">{quantity}</span>
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
                onClick={() => dispatch(addToCart({ _id: pro._id }))}
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
