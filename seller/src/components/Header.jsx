import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo2.png";
import { useDispatch, useSelector } from "react-redux";
import { removeUser } from "@/store/userSlice";
import axios from "axios";
import { BASE_URL } from "@/utils/constant";
import { persistor } from "@/store/appStore";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.user);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUser());
      await persistor.purge();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/">
          <img
            src={logo}
            alt="logo"
            className="w-36 sm:w-44 md:w-52 object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="hover:text-primary">
            Dashboard
          </Link>
          <Link to="/orders" className="hover:text-primary">
            Orders
          </Link>
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
          <Link to="/analytics" className="hover:text-primary">
            Analytics
          </Link>
          {user ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t shadow-md flex flex-col space-y-2 p-4">
          <Link
            to="/dashboard"
            className="hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/orders"
            className="hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Orders
          </Link>
          <Link
            to="/products"
            className="hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/analytics"
            className="hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Analytics
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
