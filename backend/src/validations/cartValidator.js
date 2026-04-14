exports.validateCart = (cart) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    return "Cart must be a non-empty array";
  }

  for (const item of cart) {
    if (!item._id) return "Product ID is required";
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      return `Invalid quantity for product ${item._id}`;
    }
  }

  return null;
};
