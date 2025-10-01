import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

const Main = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/products`, {
        withCredentials: true,
      });
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
        <ProductCard key={pro._id} pro={pro} />
      ))}
    </div>
  );
};

export default Main;
