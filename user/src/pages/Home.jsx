import { useState, useEffect } from "react";
import { useAuth } from "../features/auth";
import Button from "../shared/components/ui/Button";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  Headset,
  Lock,
  Heart,
  ShoppingBag,
  Star,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  Send,
} from "lucide-react";
import { routePaths } from "../app/router/routePaths";

export default function Home() {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Generate dynamic promo dates: today to 7 days from today
  const formatDate = (date) => {
    const day = date.getDate();
    const monthNames = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7);
  const promoDateRange = `${formatDate(today)} TO ${formatDate(futureDate)}`;

  const slides = [
    {
      subtitle: "Beats Solo",
      title: "Wireless",
      titleHighlight: "Headphones",
      ghostText: "AUDIO",
      buttonText: "Shop By Category",
      description:
        "Experience high-fidelity audio engineering with active noise cancellation and 40-hour battery life.",
      image: "/images/hero-headphones.png",
      bgColor: "bg-surface-container-low",
      textColor: "text-charcoal",
    },
    {
      subtitle: "Elevate Your Ritual",
      title: "Phlox",
      titleHighlight: "Beauté",
      ghostText: "BEAUTY",
      buttonText: "Discover Collection",
      description:
        "Organic ingredients crafted into luxurious skincare blends for high-performance daily rituals.",
      image: "/images/hero-beauty.png",
      bgColor: "bg-warm-white",
      textColor: "text-charcoal",
    },
    {
      subtitle: "Modern Essentials",
      title: "AURA",
      titleHighlight: "Fashion",
      ghostText: "STYLE",
      buttonText: "Shop Apparel",
      description:
        "Premium cotton basics and raw designer denim tailored for a refined, modern wardrobe silhouette.",
      image: "/images/hero-fashion.png",
      bgColor: "bg-surface-container-high",
      textColor: "text-charcoal",
    },
    {
      subtitle: "Elevate Your Motion",
      title: "Stride",
      titleHighlight: "Labs",
      ghostText: "SPORTS",
      buttonText: "Browse Sneakers",
      description:
        "High-contrast athletic sneakers designed for ergonomic comfort and premium performance.",
      image: "/images/hero-sneakers.png",
      bgColor: "bg-cool-gray-light",
      textColor: "text-charcoal",
    },
    {
      subtitle: "Timeless Elegance",
      title: "Watch",
      titleHighlight: "Accessories",
      ghostText: "WATCH",
      buttonText: "Shop Watches",
      description:
        "Luxury designer chronographs featuring premium leather bands and Swiss mechanical movements.",
      image: "/images/hero-watch.png",
      bgColor: "bg-surface-container",
      textColor: "text-charcoal",
    },
  ];

  const categories = [
    {
      tag: "New",
      title: "Luxury\nWATCHES",
      buttonText: "BROWSE",
      image: "/images/category-watches.png",
      bgColor: "bg-charcoal",
      tagColor: "text-champagne/80",
      titleColor: "text-surface-container-lowest",
      hoverBorder: "hover:border-champagne",
      imageClass: "md:grayscale brightness-125 md:group-hover:grayscale-0",
    },
    {
      tag: "New",
      title: "Stride\nFOOTWEAR",
      buttonText: "BROWSE",
      image: "/images/category-footwear.png",
      bgColor: "bg-champagne",
      tagColor: "text-charcoal/90",
      titleColor: "text-charcoal",
      hoverBorder: "hover:border-charcoal",
      imageClass: "md:grayscale md:group-hover:grayscale-0",
    },
    {
      tag: "Modern Style",
      title: "FASHION",
      buttonText: "BROWSE",
      image: "/images/category-fashion.png",
      bgColor: "bg-surface-container-high",
      tagColor: "text-secondary",
      titleColor: "text-charcoal",
      hoverBorder: "hover:border-champagne",
      imageClass: "md:grayscale md:group-hover:grayscale-0 object-cover",
      colSpan: "lg:col-span-2",
    },
    {
      tag: "Elevate Your Ritual",
      title: "BEAUTY",
      buttonText: "BROWSE",
      image: "/images/category-beauty.png",
      bgColor: "bg-surface-container",
      tagColor: "text-secondary",
      titleColor: "text-charcoal",
      hoverBorder: "hover:border-champagne",
      imageClass: "group-hover:scale-105",
      colSpan: "lg:col-span-2",
    },
    {
      tag: "Play & Learn",
      title: "TOYS",
      buttonText: "BROWSE",
      image: "/images/category-toys.png",
      bgColor: "bg-warm-gray-light",
      tagColor: "text-secondary",
      titleColor: "text-charcoal",
      hoverBorder: "hover:border-champagne",
      imageClass: "md:grayscale md:group-hover:grayscale-0 object-cover",
    },
    {
      tag: "Premium Tech",
      title: "ELECTRONICS",
      buttonText: "BROWSE",
      image: "/images/category-electronics.png",
      bgColor: "bg-charcoal",
      tagColor: "text-champagne/80",
      titleColor: "text-surface-container-lowest",
      hoverBorder: "hover:border-champagne",
      imageClass:
        "md:grayscale brightness-110 md:group-hover:grayscale-0 object-cover",
    },
  ];

  const bestSellers = [
    {
      name: "Beats Solo Wireless",
      price: "₹999",
      image: "/images/hero-headphones.png",
      rating: 5,
      tag: "Best Seller",
    },
    {
      name: "Rocky Mountain Boots",
      price: "₹2499",
      image: "/images/product-rocky-mountain.png",
      rating: 4,
      tag: "New",
    },
    {
      name: "Smartwatch",
      price: "₹1200",
      image: "/images/product-smartwatch.png",
      rating: 5,
      tag: "Trending",
    },
    {
      name: "Phlox Organic Skincare Set",
      price: "₹3500",
      image: "/images/product-skincare.png",
      rating: 5,
      tag: "Luxury",
    },
  ];

  // Carousel Autoplay Logic
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoplay, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAddToCart = (productName) => {
    toast.success(`Added ${productName} to cart!`, {
      style: {
        borderRadius: "8px",
        background: "#1b1c1c",
        color: "#fff",
      },
    });
  };

  const handleAddToWishlist = (productName) => {
    toast(`Added ${productName} to Wishlist!`, {
      icon: "❤️",
      style: {
        borderRadius: "8px",
        background: "#1b1c1c",
        color: "#fff",
      },
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for joining our newsletter!", {
      icon: "✉️",
    });
  };

  return (
    <div className="w-full bg-surface-container-low font-body-md text-on-surface overflow-x-hidden">
      {/* 1. Hero Carousel Section */}
      <section
        className="relative overflow-hidden group min-h-128 md:min-h-160 flex items-center border-b border-outline-variant/10"
        onMouseEnter={() => setIsAutoplay(false)}
        onMouseLeave={() => setIsAutoplay(true)}
      >
        {/* Carousel slides container */}
        <div
          className="flex transition-transform duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)] w-full h-full"
          style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`w-full shrink-0 ${slide.bgColor} ${slide.textColor} flex items-center py-16 md:py-24`}
            >
              <div className="max-w-container-max mx-auto px-margin-edge w-full flex flex-col md:flex-row items-center justify-between gap-10">
                {/* Typography info (Left column) */}
                <div className="z-10 text-center md:text-left md:w-1/2 relative space-y-4">
                  <h3 className="font-headline-md text-headline-sm text-secondary tracking-widest uppercase mb-1">
                    {slide.subtitle}
                  </h3>

                  <div className="relative">
                    {/* Ghost Background Typography */}
                    <span className="absolute -left-12 -top-16 font-display-bg-ghost text-display-bg-ghost text-charcoal/5 select-none pointer-events-none hidden lg:block tracking-tight">
                      {slide.ghostText}
                    </span>
                    <h1 className="font-display-xl text-4xl sm:text-6xl lg:text-7xl uppercase leading-none font-black tracking-tighter text-charcoal">
                      {slide.title} <br />
                      <span className="text-secondary">
                        {slide.titleHighlight}
                      </span>
                    </h1>
                  </div>

                  <p className="font-body-lg text-body-md text-secondary/95 max-w-sm md:max-w-md leading-relaxed pt-2">
                    {slide.description}
                  </p>

                  <div className="pt-6">
                    <Button
                      variant="primary"
                      onClick={() =>
                        toast(`Exploring ${slide.titleHighlight} collection...`)
                      }
                      className="px-8 py-4 cursor-pointer hover:bg-champagne hover:text-charcoal hover:border-champagne"
                    >
                      {slide.buttonText}
                    </Button>
                  </div>
                </div>

                {/* Product image (Right column) */}
                <div className="relative w-full md:w-1/2 flex justify-center items-center h-64 sm:h-96 md:h-112">
                  <div className="absolute inset-0 bg-radial from-champagne/10 to-transparent rounded-full filter blur-2xl"></div>
                  <img
                    className="relative z-10 w-auto h-full max-h-72 sm:max-h-96 md:max-h-112 object-contain drop-shadow-2xl transition-all duration-700 hover:scale-105"
                    src={slide.image}
                    alt={slide.subtitle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel arrows (Hover only) */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 hover:bg-champagne hover:text-charcoal text-charcoal w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer border border-outline-variant/20 z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-surface-container-lowest/80 hover:bg-champagne hover:text-charcoal text-charcoal w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer border border-outline-variant/20 z-20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                index === currentSlide
                  ? "w-8 bg-champagne"
                  : "w-2.5 bg-secondary/30 hover:bg-secondary/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. Category Bento Grid Section */}
      <section className="py-20 md:py-28 max-w-container-max mx-auto px-margin-edge space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="font-label-caps text-xs text-secondary tracking-[0.2em] uppercase block">
              Curated Collections
            </span>
            <h2 className="font-display-xl text-3xl sm:text-4xl text-charcoal font-black uppercase tracking-tight">
              Browse By Category
            </h2>
            <div className="w-20 h-1 bg-champagne"></div>
          </div>
          <p className="font-body-md text-secondary max-w-md leading-relaxed">
            Discover premium craft items specifically optimized for performance,
            style, and status.
          </p>
        </div>

        {/* The Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden flex flex-col justify-end p-8 border border-outline-variant/10 min-h-80 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-champagne ${cat.bgColor} ${cat.colSpan || ""}`}
            >
              {/* Foreground content */}
              <div className="relative z-10 space-y-3">
                <span
                  className={`font-label-caps text-[10px] font-bold tracking-widest uppercase ${cat.tagColor}`}
                >
                  {cat.tag}
                </span>
                <h3
                  className={`font-display-xl text-xl sm:text-2xl font-black leading-tight whitespace-pre-line ${cat.titleColor}`}
                >
                  {cat.title}
                </h3>
                <button
                  onClick={() =>
                    toast(`Browsing ${cat.title.replace("\n", " ")}...`)
                  }
                  className="bg-surface-container-lowest/15 text-surface-container-lowest hover:bg-champagne hover:text-charcoal border border-surface-container-lowest/10 font-bold px-6 py-2 text-[10px] tracking-widest uppercase transition-all duration-300 font-label-caps cursor-pointer mt-2"
                >
                  {cat.buttonText}
                </button>
              </div>

              {/* Graphic Asset image */}
              <img
                className={`absolute top-0 right-0 w-3/4 h-full object-contain pointer-events-none translate-x-4 transition-transform duration-700 group-hover:scale-105 group-hover:translate-x-2 ${cat.imageClass}`}
                src={cat.image}
                alt={cat.title}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 3. Features Bar Section */}
      <section className="bg-surface-container-lowest py-16 border-y border-outline-variant/20">
        <div className="max-w-container-max mx-auto px-margin-edge grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-champagne-light text-secondary flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-label-caps text-xs font-bold text-charcoal uppercase tracking-wider">
                Free Shipping
              </h4>
              <p className="text-[11px] text-secondary mt-0.5">
                Complimentary shipping on all premium items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-champagne-light text-secondary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-label-caps text-xs font-bold text-charcoal uppercase tracking-wider">
                Authentic Guarantee
              </h4>
              <p className="text-[11px] text-secondary mt-0.5">
                100% verified authentic designer goods
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-champagne-light text-secondary flex items-center justify-center shrink-0">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-label-caps text-xs font-bold text-charcoal uppercase tracking-wider">
                Concierge Support
              </h4>
              <p className="text-[11px] text-secondary mt-0.5">
                24/7 client relations assistance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-champagne-light text-secondary flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-label-caps text-xs font-bold text-charcoal uppercase tracking-wider">
                Secure Escrow
              </h4>
              <p className="text-[11px] text-secondary mt-0.5">
                Fully encrypted payments & escrow terms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sale Banner Section */}
      <section className="py-20 md:py-28 max-w-container-max mx-auto px-margin-edge">
        <div className="bg-charcoal text-surface-container-lowest rounded-none relative overflow-hidden flex flex-col md:grid md:grid-cols-12 items-center p-10 md:p-0 min-h-112 border-l-8 border-champagne shadow-2xl">
          {/* Left Block: The Offer */}
          <div className="z-10 md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left md:pl-16 py-6 space-y-4">
            <p className="text-champagne text-sm font-bold font-label-caps tracking-[0.2em] uppercase">
              Exclusive Season Offer
            </p>
            <h2 className="font-display-xl text-4xl sm:text-5xl uppercase leading-none font-black tracking-tighter text-surface-container-lowest">
              FINE
              <br />
              SMILE
            </h2>
            <p className="text-champagne/80 font-label-caps text-[11px] tracking-[0.35em] uppercase font-bold">
              {promoDateRange}
            </p>
          </div>

          {/* Center Block: Product Showcase */}
          <div className="md:col-span-4 relative h-full flex items-center justify-center py-10 md:py-0">
            <div className="absolute w-72 h-72 bg-champagne/5 rounded-full filter blur-2xl pointer-events-none"></div>
            <img
              className="relative z-10 h-64 md:h-80 object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
              src="/images/hero-headphones.png"
              alt="Beats Solo Sale Showcase"
            />
          </div>

          {/* Right Block: Details & CTA */}
          <div className="z-10 md:col-span-4 flex flex-col justify-center items-center md:items-end text-center md:text-right md:pr-16 py-6 space-y-4">
            <p className="text-champagne font-bold font-label-caps uppercase text-[11px] tracking-[0.2em]">
              Beats Solo Air Edition
            </p>
            <h2 className="font-display-xl text-2xl sm:text-3xl text-surface-container-lowest font-black">
              Summer Sale
            </h2>
            <p className="text-surface-container-high/70 max-w-xs text-xs sm:text-sm leading-relaxed">
              Experience the absolute pinnacle of audio luxury with our
              exclusive seasonal collection. Designed for the modern
              connoisseur.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleAddToCart("Beats Solo Air (Promo)")}
                className="border-2 border-champagne text-champagne hover:bg-champagne hover:text-charcoal font-bold px-10 py-3 rounded-none transition-all duration-300 font-label-caps tracking-widest text-xs cursor-pointer"
              >
                SHOP THE SALE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Seller Products Section */}
      <section className="pb-28 max-w-container-max mx-auto px-margin-edge space-y-16">
        <div className="text-center space-y-3">
          <span className="font-label-caps text-xs text-secondary tracking-[0.2em] uppercase block">
            Most Wanted
          </span>
          <h2 className="font-display-xl text-3xl sm:text-4xl text-charcoal font-black uppercase tracking-tight">
            Best Seller Products
          </h2>
          <div className="w-20 h-1 bg-champagne mx-auto"></div>
          <p className="font-body-md text-secondary max-w-md mx-auto leading-relaxed pt-1">
            Curated items showing exceptional demand from global design
            communities.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((item, idx) => (
            <div key={idx} className="group flex flex-col justify-between">
              {/* Product Card Box */}
              <div className="bg-surface-container-lowest border border-outline-variant/15 p-8 mb-4 overflow-hidden relative transition-all duration-300 hover:border-champagne hover:shadow-lg flex flex-col justify-center items-center min-h-72">
                {/* Product Tag */}
                <span className="absolute top-4 left-4 bg-charcoal text-champagne text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest font-label-caps">
                  {item.tag}
                </span>

                {/* Wishlist Button */}
                <button
                  onClick={() => handleAddToWishlist(item.name)}
                  className="absolute top-4 right-4 text-secondary/40 hover:text-red-500 hover:scale-115 transition-all duration-300 cursor-pointer p-1 z-15"
                  aria-label="Add to Wishlist"
                >
                  <Heart className="w-4.5 h-4.5" />
                </button>

                <img
                  className="w-full h-44 object-contain transition-transform duration-500 group-hover:scale-110"
                  src={item.image}
                  alt={item.name}
                />

                <button
                  onClick={() => handleAddToCart(item.name)}
                  className="absolute bottom-0 inset-x-0 w-full bg-champagne text-charcoal py-3 text-xs font-bold font-label-caps tracking-widest uppercase transition-all duration-300 translate-y-0 lg:translate-y-full lg:group-hover:translate-y-0 flex items-center justify-center gap-2 cursor-pointer z-10"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add To Cart
                </button>
              </div>

              {/* Product Metadata Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-champagne text-champagne"
                    />
                  ))}
                </div>
                <h4 className="font-label-caps text-sm font-bold text-charcoal uppercase tracking-tight group-hover:text-champagne transition-colors duration-300">
                  {item.name}
                </h4>
                <p className="text-secondary font-bold text-sm tracking-wide font-label-caps">
                  {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-charcoal text-surface-container-lowest border-t border-champagne/20">
        <div className="max-w-container-max mx-auto px-margin-edge py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Info Column */}
          <div className="md:col-span-5 space-y-6">
            <Link
              to={routePaths.HOME}
              className="font-display-xl text-2xl tracking-tighter text-champagne font-black uppercase hover:text-surface-container-lowest transition-colors duration-300 block select-none"
            >
              Trustkart
            </Link>
            <p className="text-surface-container-high/60 font-body-md text-sm leading-relaxed max-w-sm">
              Defining the intersection of hardware craft and high fashion.
              Premium tech and lifestyle products curated for those who demand
              excellence in every detail.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Opening Social Link...");
                }}
                className="w-10 h-10 bg-surface-container-low/10 border border-surface-container-lowest/10 flex items-center justify-center hover:bg-champagne hover:text-charcoal transition-all shadow-sm rounded"
              >
                <Globe className="w-4.5 h-4.5" />
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast("Opening Social Link...");
                }}
                className="w-10 h-10 bg-surface-container-low/10 border border-surface-container-lowest/10 flex items-center justify-center hover:bg-champagne hover:text-charcoal transition-all shadow-sm rounded"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-3 space-y-6">
            <h6 className="font-bold text-champagne uppercase font-label-caps text-xs tracking-widest border-b border-outline-variant/10 pb-2">
              Company
            </h6>
            <ul className="space-y-3.5 text-surface-container-high/70 text-sm">
              <li>
                <button
                  onClick={() => toast("Home page already active")}
                  className="hover:text-champagne transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => toast("About Us coming soon")}
                  className="hover:text-champagne transition-colors cursor-pointer text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => toast("Contact Page coming soon")}
                  className="hover:text-champagne transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => toast("Blog section coming soon")}
                  className="hover:text-champagne transition-colors cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-6">
            <h6 className="font-bold text-champagne uppercase font-label-caps text-xs tracking-widest border-b border-outline-variant/10 pb-2">
              Newsletter
            </h6>
            <p className="text-surface-container-high/60 font-body-md text-xs sm:text-sm leading-relaxed">
              Subscribe to get alerts about new arrivals and exclusive member
              promotions.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex border border-surface-container-lowest/20 rounded-lg overflow-hidden focus-within:border-champagne transition-colors"
            >
              <input
                className="bg-transparent border-none px-4 py-3 text-xs w-full text-surface-container-lowest placeholder:text-surface-container-high/30 outline-none"
                placeholder="ENTER EMAIL ADDRESS"
                type="email"
                required
              />
              <button
                type="submit"
                className="bg-champagne text-charcoal px-6 py-3 text-xs font-bold hover:bg-surface-container-lowest transition-all duration-300 font-label-caps flex items-center justify-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="border-t border-surface-container-lowest/5 py-8 max-w-container-max mx-auto px-margin-edge flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-surface-container-high/30 text-[10px] uppercase tracking-[0.2em] font-label-caps">
            © 2026 Trustkart. Where Luxury Meets Trust.
          </p>
          {user && (
            <p className="text-surface-container-high/20 text-[10px] uppercase tracking-wider font-label-caps">
              Signed in as {user.name}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
