import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../store/cartSlice";

const ProductCart = ({ pro }) => {
  const dispatch = useDispatch();
  const cart = useSelector((store) => store.cart);

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

          <button
            onClick={(e) => {
              dispatch(addToCart({ _id: pro._id }));
            }}
            className="px-4 py-2 bg-yellow-400 rounded-lg font-medium hover:bg-yellow-500 transition-colors cursor-pointer"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
