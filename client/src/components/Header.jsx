import { useState } from "react";
import logo from "../assets/logo2.png";
import cartImage from "../assets/cart.svg";
import storeImage from "../assets/store.svg";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../store/userSlice";
import axios from "axios";
import arrow from "../assets/down_arrow.svg";

const Header = () => {
  const { user } = useSelector((store) => store.user);
  const cart = useSelector((store) => store.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUser());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className="w-full shadow-sm bg-white">
      <div className="container mx-auto flex gap-4 justify-between px-4 py-2">
        <div className=" flex items-center gap-6 w-full max-w-3xl">
          <Link to={"/"}>
            <img
              src={logo}
              alt="Logo"
              className="w-36 sm:w-44 md:w-52 object-contain"
            />
          </Link>
          <div className="flex-1 hidden sm:block">
            <input
              type="text"
              placeholder="Search for product"
              className="w-full px-4 py-2 bg-blue-100 rounded-lg outline-none "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-9 sm:6">
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button className="flex items-center px-3 py-2 rounded-xl bg-gray-100 cursor-pointer hover:bg-gray-200">
                <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] font-medium">
                  {user?.name}
                </span>
                {
                  <img
                    className={`hidden sm:inline-block ml-2 w-3 h-3 flex-shrink-0 transition-transform duration-200 ${
                      menuOpen ? "rotate-180" : "rotate-0"
                    }`}
                    src={arrow}
                    alt="drop-down-arrow"
                  />
                }
              </button>
              {menuOpen && (
                <ul className="absolute z-10 flex flex-col left-0 w-40 bg-white rounded-lg shadow-md">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to={"/profile"}> Profile </Link>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to={"/orders"}> Orders </Link>
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link to={"/login"}>
              <button className="text-white px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-md transition-colors cursor-pointer">
                Login
              </button>
            </Link>
          )}

          <Link to={"/cart"}>
            <div className="relative flex items-center gap-2 cursor-pointer">
              <img src={cartImage} alt="cart-image" className="w-6 shrink-0" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                  {cart.length}
                </span>
              )}
              <span className="font-medium hidden lg:block">Cart</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 cursor-pointer">
            <img src={storeImage} alt="store-image" className="w-6 shrink-0" />
            <span className="font-medium hidden lg:block">Seller</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
