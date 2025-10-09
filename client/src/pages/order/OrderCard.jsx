import dayjs from "dayjs";

const OrderCard = ({ order }) => {
  const formattedDate = dayjs(order.createdAt).format("MMM D, YYYY");
  return (
    <div className="border border-gray-300 rounded-lg p-4 mt-4 space-y-4">
      <div className="flex justify-between">
        <p className="font-medium">Order ID: {order._id}</p>
        <p className="font-medium">{formattedDate}</p>
      </div>

      <p className="text-sm text-gray-600">Status: {order.orderStatus}</p>

      <hr />

      <div className="space-y-2 ">
        {order.products.map((item) => (
          <div
            key={item._id}
            className="flex justify-between items-center border-b border-gray-100 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-20 sm:h-28 w-30 sm:w-28 overflow-hidden flex items-center justify-center">
                <img
                  src={item.product?.image?.url}
                  alt={item.product?.title}
                  className="object-contain max-h-full max-w-full"
                />
              </div>
              <div>
                <p className="text-sm sm:text-lg line-clamp-2 sm:line-clamp-1 pr-4">
                  {item.product?.title}
                </p>
                <p className="mt-2">Quantity: {item.quantity}</p>
              </div>
            </div>
            <p className="font-medium">
              ₹{(item.price || 0) * (item.quantity || 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="text-right font-medium mt-2">
        Subtotal: ₹{order.subTotal}
      </div>
    </div>
  );
};

export default OrderCard;
