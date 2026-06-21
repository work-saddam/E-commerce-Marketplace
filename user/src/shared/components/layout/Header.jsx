import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth";
import { routePaths } from "../../../app/router/routePaths";
import toast from "react-hot-toast";
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    toast.success(`Searching for "${searchQuery}"...`);
    // Navigate or filter products
    navigate(`${routePaths.HOME}?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleFeaturePlaceholder = (featureName) => {
    toast(`${featureName} is coming soon!`, {
      icon: "✨",
      style: {
        borderRadius: "8px",
        background: "#1b1c1c",
        color: "#fff",
      },
    });
  };

  const navLinks = [
    { label: "Home", path: routePaths.HOME },
    { label: "Shop", path: routePaths.HOME, isPlaceholder: true },
    { label: "About Us", path: routePaths.HOME, isPlaceholder: true },
    { label: "Blog", path: routePaths.HOME, isPlaceholder: true },
    { label: "Contact Us", path: routePaths.HOME, isPlaceholder: true },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-container-lowest/95 backdrop-blur-md shadow-lg border-b-0"
          : "bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20"
      }`}
    >
      <nav className="max-w-container-max mx-auto px-margin-edge py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo & Desktop Links */}
        <div className="flex items-center gap-10">
          <Link
            to={routePaths.HOME}
            className="font-display-xl text-xl sm:text-2xl tracking-tighter text-charcoal font-black uppercase hover:text-champagne transition-colors duration-300 select-none"
          >
            Trustkart
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, index) => {
              const isActive =
                location.pathname === link.path && !link.isPlaceholder;
              return link.isPlaceholder ? (
                <button
                  key={index}
                  onClick={() => handleFeaturePlaceholder(link.label)}
                  className="font-label-caps text-xs text-secondary hover:text-champagne transition-all duration-300 font-bold uppercase tracking-wider cursor-pointer py-1 text-left"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={index}
                  to={link.path}
                  className={`font-label-caps text-xs hover:text-champagne transition-all duration-300 font-bold uppercase tracking-wider py-1 ${
                    isActive
                      ? "text-charcoal border-b-2 border-champagne"
                      : "text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center Section: Search Bar (Desktop only) */}
        <div className="hidden md:block flex-1 max-w-sm lg:max-w-md">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-charcoal placeholder:text-secondary/60 text-xs sm:text-sm px-5 py-2.5 pr-12 rounded-full border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-champagne/40 focus:border-champagne/40 focus:bg-surface-container-lowest transition-all"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-champagne transition-colors duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Wishlist Icon */}
          <button
            onClick={() => handleFeaturePlaceholder("Wishlist")}
            className="text-secondary hover:text-champagne transition-all duration-300 hover:scale-115 cursor-pointer relative p-1"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => handleFeaturePlaceholder("Cart")}
            className="text-secondary hover:text-champagne transition-all duration-300 hover:scale-115 cursor-pointer relative p-1"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-champagne text-charcoal text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm border border-surface-container-lowest">
              0
            </span>
          </button>

          {/* Seller Link (Hidden on mobile) */}
          <a
            href="https://seller.trustkart.saddamcodes.online"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-secondary hover:text-champagne font-bold font-label-caps uppercase tracking-wider transition-colors duration-300"
          >
            <Store className="w-4 h-4" />
            <span className="hidden xl:inline">Seller</span>
          </a>

          {/* Divider */}
          <span className="w-px h-5 bg-outline-variant/30 hidden lg:block"></span>

          {/* Auth Button or User Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-low transition-all duration-300 cursor-pointer border border-outline-variant/10 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-champagne text-charcoal flex items-center justify-center font-black text-sm select-none">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="font-bold text-xs text-charcoal max-w-22.5 truncate hidden md:inline-block pr-1 font-label-caps">
                  {user.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-secondary transition-transform duration-300 hidden md:block ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2.5 w-60 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3.5 border-b border-outline-variant/10 mb-2">
                    <p className="text-[10px] text-secondary font-bold font-label-caps tracking-widest uppercase mb-1">
                      Premium Member
                    </p>
                    <p className="text-sm font-black text-charcoal truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-secondary truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFeaturePlaceholder("Profile")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-secondary hover:text-charcoal hover:bg-surface-container-low rounded-xl transition-all cursor-pointer font-label-caps uppercase tracking-wider text-left"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer font-label-caps uppercase tracking-wider text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={routePaths.LOGIN}
              className="text-charcoal hover:text-champagne font-bold text-xs font-label-caps tracking-wider uppercase transition-colors duration-300"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-secondary hover:text-champagne transition-colors p-1 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/20 py-6 px-margin-edge flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 shadow-lg">
          {/* Search (Mobile) */}
          <form onSubmit={handleSearch} className="relative w-full md:hidden">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-charcoal placeholder:text-secondary/60 text-xs px-5 py-2.5 pr-12 rounded-full border border-outline-variant/10 focus:outline-none focus:ring-1 focus:ring-champagne/40"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-secondary font-bold font-label-caps tracking-wider uppercase border-b border-outline-variant/10 pb-1">
              Menu Links
            </p>
            {navLinks.map((link, index) => {
              const isActive =
                location.pathname === link.path && !link.isPlaceholder;
              return link.isPlaceholder ? (
                <button
                  key={index}
                  onClick={() => {
                    handleFeaturePlaceholder(link.label);
                    setMobileMenuOpen(false);
                  }}
                  className="font-label-caps text-xs text-secondary hover:text-champagne transition-all duration-300 font-bold uppercase tracking-wider text-left py-1 cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={index}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-label-caps text-xs hover:text-champagne transition-all duration-300 font-bold uppercase tracking-wider py-1 ${
                    isActive ? "text-charcoal font-black" : "text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Mobile external seller link */}
            <a
              href="https://seller.trustkart.saddamcodes.online"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-label-caps text-xs text-secondary hover:text-champagne font-bold uppercase tracking-wider py-1"
            >
              <Store className="w-4 h-4" />
              Seller Dashboard
            </a>
          </div>

          {/* Profile Action (Mobile dropdown equivalent) */}
          {isAuthenticated && user && (
            <div className="flex flex-col gap-4 border-t border-outline-variant/10 pt-4">
              <p className="text-[10px] text-secondary font-bold font-label-caps tracking-wider uppercase">
                Account Settings
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-champagne text-charcoal flex items-center justify-center font-black text-sm select-none">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-xs font-black text-charcoal leading-none">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-secondary mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => {
                    handleFeaturePlaceholder("Profile");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-secondary border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-all font-label-caps uppercase tracking-wider cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-600 border border-red-100 rounded-xl hover:bg-red-50 transition-all font-label-caps uppercase tracking-wider cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
