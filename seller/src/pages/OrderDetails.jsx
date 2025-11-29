import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";

const statusColors = {
  pending: "bg-orange-500 text-white",
  confirmed: "bg-indigo-500 text-white",
  shipped: "bg-blue-500 text-white",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
};

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/seller/order/${id}`, {
        withCredentials: true,
      });
      setOrder(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  if (loading || !order) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-semibold">Order Details</h1>

      <Card className="p-6 space-y-4 shadow-sm border rounded-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order #{order._id}</h2>
          <Badge className={`${statusColors[order.orderStatus]} text-sm`}>
            {order.orderStatus.toUpperCase()}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Placed on: {new Date(order.createdAt).toDateString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Buyer: {order.buyer[0].name}
        </p>

        <hr className="my-4" />

        {/* Product List */}
        <h3 className="text-lg font-medium mb-2">Items</h3>
        <div className="space-y-3">
          {order.products.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl"
            >
              <img
                src={product.image?.url}
                alt="product"
                className="w-20 h-20 rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-base">{product.title}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {product.quantity}
                </p>
              </div>
              <p className="font-semibold">₹ {product.price}</p>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        {/* Price Summary */}
        <div className="space-y-2 text-right">
          <p className="text-lg font-semibold">Subtotal: ₹ {order.subTotal}</p>
          <p className="text-base">Shipping: ₹ {order.shippingFee}</p>
          <p className="text-xl font-bold">Total: ₹ {order.totalAmount}</p>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
