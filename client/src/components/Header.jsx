import { useState } from "react";
import logo from "../assets/logo2.png";
import cartImage from "../assets/cart.svg";
import storeImage from "../assets/store.svg";
import { Link } from "react-router-dom";

const Header = () => {
  const [search, setSearch] = useState("");
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

        <div className="flex items-center gap-4 sm:6">
          <Link to={"/login"}>
            <button className="bg-yellow-500 text-white px-5 py-2 rounded-xl transition hover:bg-yellow-600">
              Login
            </button>
          </Link>
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={cartImage} alt="cart-image" className="w-6 shrink-0" />
            {/* <span className="font-medium hidden lg:block">Cart</span> */}
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={storeImage} alt="store-image" className="w-6 shrink-0" />
            {/* <span className="font-medium hidden lg:block">Become a seller</span> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
