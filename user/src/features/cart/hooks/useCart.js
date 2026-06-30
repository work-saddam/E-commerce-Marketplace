import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../store/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const addItem = useCallback(
    (product, quantity = 1) => {
      dispatch(addToCart({ ...product, quantity }));
    },
    [dispatch]
  );

  const removeItem = useCallback(
    (id) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  const changeQuantity = useCallback(
    (id, quantity) => {
      dispatch(updateQuantity({ id, quantity }));
    },
    [dispatch]
  );

  const resetCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return {
    items: cart?.items || [],
    totalQuantity: cart?.items?.length || 0,
    addItem,
    removeItem,
    changeQuantity,
    resetCart,
  };
};
