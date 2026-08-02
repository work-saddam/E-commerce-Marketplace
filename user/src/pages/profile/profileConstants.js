import { User, MapPin, Package, ShoppingBag, Store } from "lucide-react";
import { routePaths } from "../../app/router/routePaths";

/**
 * Tab definitions for the profile page.
 * To add a new section, append an entry here and create the corresponding tab component.
 */
export const TABS = [
  { id: "profile", label: "Profile Info", icon: User, description: "View and manage your personal information" },
  { id: "addresses", label: "Addresses", icon: MapPin, description: "Manage your delivery addresses" },
];

/**
 * Quick-link shortcuts displayed in the sidebar / mobile footer.
 */
export const QUICK_LINKS = [
  {
    label: "My Orders",
    description: "Track and manage your orders",
    icon: Package,
    to: routePaths.ORDERS,
  },
  {
    label: "Shopping Bag",
    description: "Review items in your cart",
    icon: ShoppingBag,
    to: routePaths.CART,
  },
  {
    label: "Explore Collections",
    description: "Browse curated collections",
    icon: Store,
    to: routePaths.SHOP,
  },
];

/**
 * Empty address template for the add-address form.
 */
export const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};
