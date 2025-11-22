import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";

const statusColors = {
  pending: "bg-yellow-500 text-white",
  confirm: "bg-pink-500 text-white",
  shipped: "bg-blue-500 text-white",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/seller/orders/get?page=${page}&limit=10&status=${statusFilter}&search=${searchQuery}`,
        { withCredentials: true }
      );
      setOrders(res?.data?.data || []);
      setTotalPages(res?.data?.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 py-6 px-10 space-y-6">
        <h1 className="text-3xl font-semibold">Orders</h1>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search order ID or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              onClick={() => {
                setPage(1);
                fetchOrders();
              }}
            >
              Apply
            </Button>
          </div>
        </Card>

        {/* Orders */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <Card key={order._id} className="shadow-sm py-4 px-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left */}
                  <div className="space-y-2 w-full md:w-2/3">
                    <h2 className="text-lg font-semibold">
                      Order #{order._id}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {new Date(order.createdAt).toDateString()} •
                      Buyer: {order.buyer[0].name}
                    </p>

                    <div className="space-y-3 mt-3">
                      {order.products.map((product) => (
                        <div
                          key={product?._id}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={product.image?.url}
                            alt="product"
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div>
                            <p className="text-base line-clamp-1">
                              {product?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {product?.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="md:w-1/3 space-y-3 text-right">
                    <p className="text-lg font-semibold">₹ {order.subTotal}</p>
                    <Badge
                      className={`${statusColors[order.orderStatus]} text-sm`}
                    >
                      {order.orderStatus.toUpperCase()}
                    </Badge>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline">View</Button>
                      <Button>Update Status</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <span className="text-lg font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
