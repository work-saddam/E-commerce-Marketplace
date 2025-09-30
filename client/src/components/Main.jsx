import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Main = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`, {
        withCredentials: true,
      });
      // console.log(res?.data?.data);
      setProducts(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return products.length === 0 ? (
    <div className="p-6 text-2xl text-gray-500">Products not available</div>
  ) : (
    <div className="p-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((pro) => (
        <Link to={`/product/${pro.slug}`} key={pro._id}>
          <div className="rounded-lg border bg-white shadow hover:shadow-lg overflow-hidden">
            <div className="h-60 flex items-center justify-center">
              <img
                className="max-h-full max-w-full object-contain"
                src={pro.image.url}
                alt={pro.title}
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-medium line-clamp-1">
                {pro.title}
              </h3>

              <div className="mt-3 flex justify-between items-center">
                <p className=" text-lg font-bold text-gray-800">₹{pro.price}</p>

                <button className="px-4 py-2 bg-yellow-400 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Main;
