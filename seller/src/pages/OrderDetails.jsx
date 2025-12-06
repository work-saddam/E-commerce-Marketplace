import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

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
  const [status, setStatus] = useState("");

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/seller/order/${id}`, {
        withCredentials: true,
      });
      setOrder(res.data.data);
      setStatus(res.data.data.orderStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/seller/order/${id}/${status}`,
        {},
        { withCredentials: true }
      );
      fetchOrderDetails();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  if (loading || !order) return <p className="p-10">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-semibold">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* =================== LEFT COLUMN =================== */}
        <div className="lg:col-span-3 space-y-8">
          <Card>
            <CardHeader className="flex flex-row flex-wrap justify-between items-start gap-4">
              <div>
                <CardTitle className="text-xl">Order #{order._id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.createdAt).toDateString()}
                </CardDescription>
              </div>
              <Badge
                className={`${
                  statusColors[order.orderStatus]
                } px-4 py-1 text-sm rounded-lg`}
              >
                {order.orderStatus.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20 px-2"></TableHead>
                    <TableHead className="px-2">Product</TableHead>
                    <TableHead className="w-16 text-center px-2">Qty</TableHead>
                    <TableHead className="w-24 text-right px-2">
                      Price
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.products.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="px-2 align-middle">
                        <img
                          src={p.product.image?.url}
                          alt="product"
                          className="w-16 h-16 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium px-2 align-middle">
                        <div className="line-clamp-2">{p.product.title}</div>
                      </TableCell>
                      <TableCell className="text-center px-2 align-middle">
                        x{p.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium px-2 align-middle">
                        ₹ {p.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end bg-muted/40 p-6">
              <div className="text-right text-lg">
                <p className="font-semibold text-muted-foreground">
                  Subtotal:{" "}
                  <span className="font-bold text-xl text-foreground">
                    ₹ {order.subTotal}
                  </span>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* =================== RIGHT COLUMN =================== */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Order</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Update Status
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full py-5 text-base rounded-lg"
                onClick={updateOrderStatus}
              >
                Update Status
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer & Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Buyer</h4>
                <p className="text-sm text-muted-foreground">
                  {order.buyer.name}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Shipping Address</h4>
                <div className="leading-relaxed text-sm text-muted-foreground">
                  <p>{order.shippingAddress.name}</p>
                  <p>
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    , {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="font-medium mt-1 text-foreground">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
