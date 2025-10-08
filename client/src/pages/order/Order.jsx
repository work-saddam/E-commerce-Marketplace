import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/constants";
import axios from "axios";
import OrderCard from "./OrderCard";

const Order = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/orders`, {
        withCredentials: true,
      });
      console.log(res?.data?.data);
      setOrders(res?.data?.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className=" p-4">
      <h3 className="text-3xl font-semibold mb-4">Your Orders</h3>
      {orders.length === 0 ? (
        <div>
          <p>No orders found.</p>{" "}
        </div>
      ) : (
        orders.map((order) => <OrderCard key={order._id} order={order} />)
      )}
    </div>
  );
};

export default Order;
