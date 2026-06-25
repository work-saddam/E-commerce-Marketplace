import { useAuth } from "../../../features/auth";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Globe, Mail, Send } from "lucide-react";
import { routePaths } from "../../../app/router/routePaths";

export default function Footer() {
  const { user } = useAuth();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for joining our newsletter!", {
      icon: "✉️",
    });
  };

  return (
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
              <Link
                to={routePaths.HOME}
                className="hover:text-champagne transition-colors cursor-pointer text-left"
              >
                Home
              </Link>
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
  );
}
