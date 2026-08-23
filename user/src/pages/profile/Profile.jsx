import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../../features/auth";
import apiClient from "../../shared/services/apiClient";
import { routePaths } from "../../app/router/routePaths";
import { TABS, QUICK_LINKS } from "./profileConstants";
import ProfileInfoTab from "./ProfileInfoTab";
import ManageAddressesTab from "./ManageAddressesTab";

/**
 * Profile page shell — handles layout, sidebar, tab routing.
 *
 * To add a new tab:
 *  1. Add an entry in profileConstants.js → TABS
 *  2. Create a new <TabName>Tab.jsx component
 *  3. Import and register it in the TAB_COMPONENTS map below
 */

const TAB_COMPONENTS = {
  profile: ProfileInfoTab,
  addresses: ManageAddressesTab,
};

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabId = searchParams.get("tab") || "profile";
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user.user);

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await apiClient.get("/api/users/profile");
        setProfile(res?.data?.data || null);
      } catch {
        toast.error("Failed to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleProfileSave = async (newName) => {
    try {
      const res = await apiClient.put("/api/users/profile", { name: newName });
      const updatedData = res?.data?.data || null;
      setProfile(updatedData);

      // Sync Redux auth state so Header dropdown reflects the new name
      if (updatedData && reduxUser) {
        dispatch(addUser({ ...reduxUser, name: updatedData.name }));
      }
      toast.success("Profile updated successfully!", {
        style: {
          borderRadius: "8px",
          background: "#1b1c1c",
          color: "#fff",
        },
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile.",
      );
      throw err;
    }
  };

  const handleContactSave = async (field, value, otp) => {
    try {
      const res = await apiClient.put("/api/users/profile/contact/verify", {
        field,
        value,
        otp,
      });
      const updatedData = res?.data?.data || null;
      setProfile(updatedData);

      // Sync Redux so Header dropdown stays current
      if (updatedData && reduxUser) {
        dispatch(addUser({ ...reduxUser, email: updatedData.email, phone: updatedData.phone }));
      }

      const fieldLabel = field === "email" ? "Email" : "Phone number";
      toast.success(`${fieldLabel} updated successfully!`, {
        style: { borderRadius: "8px", background: "#1b1c1c", color: "#fff" },
      });
    } catch (err) {
      // Re-throw so EditContactModal can surface it inline on the OTP step
      throw err;
    }
  };

  const currentTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  return (
    <div className="w-full bg-surface-container-low min-h-screen text-on-background">
      <main className="max-w-container-max mx-auto px-margin-edge py-10 md:py-14">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-label-caps text-on-surface-variant/40 select-none mb-8">
          <Link
            to={routePaths.HOME}
            className="hover:text-champagne transition-colors duration-300"
          >
            Home
          </Link>
          <span className="text-on-surface-variant/20">/</span>
          <span className="text-champagne font-bold">My Account</span>
        </div>

        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal tracking-tight leading-snug">
            Account Settings
          </h1>
          <p className="text-xs font-bold font-label-caps text-on-surface-variant/50 uppercase tracking-[0.15em] select-none mt-1">
            Manage your profile, addresses, and preferences
          </p>
        </header>

        {/* Layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar (desktop) / Tabs (mobile) ── */}
          <aside className="lg:w-65 shrink-0">
            {/* Mobile: horizontal scrollable tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab.id === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      isActive
                        ? "bg-charcoal text-surface-container-lowest border-charcoal shadow-md"
                        : "bg-surface-container-lowest text-on-surface-variant/60 border-outline-variant/10 hover:border-outline-variant/20"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical sidebar nav */}
            <div className="hidden lg:block sticky top-28 space-y-6">
              <nav className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3 space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab.id === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isActive
                          ? "bg-charcoal text-surface-container-lowest shadow-md"
                          : "text-on-surface-variant/60 hover:bg-surface-container-low hover:text-charcoal"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Links */}
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3 space-y-1">
                <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest px-4 pt-2 pb-2">
                  Quick Links
                </p>
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant/55 hover:bg-surface-container-low hover:text-charcoal transition-all group"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <section className="flex-1 min-w-0">
            <div className="bg-surface-container/20 border border-outline-variant/8 rounded-3xl p-5 sm:p-8">
              {/* Tab Header */}
              <div className="flex items-center gap-3 mb-8 pb-5 border-b border-outline-variant/8">
                {(() => {
                  const Icon = currentTab.icon;
                  return (
                    <div className="w-9 h-9 bg-champagne/10 rounded-lg flex items-center justify-center border border-champagne/15">
                      <Icon className="w-4.5 h-4.5 text-champagne" />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                    {currentTab.label}
                  </h2>
                  <p className="text-[10px] text-on-surface-variant/45 font-medium mt-0.5">
                    {currentTab.description}
                  </p>
                </div>
              </div>

              {/* Tab Content — renders the component mapped to the active tab */}
              {currentTab.id === "profile" && (
                <ProfileInfoTab
                  profile={profile}
                  loading={profileLoading}
                  onSave={handleProfileSave}
                  onContactSave={handleContactSave}
                  currentEmail={profile?.email}
                />
              )}
              {currentTab.id === "addresses" && <ManageAddressesTab />}
            </div>

            {/* Mobile Quick Links */}
            <div className="lg:hidden mt-6 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 space-y-1">
              <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest px-3 pt-1 pb-2">
                Quick Links
              </p>
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold text-on-surface-variant/55 hover:bg-surface-container-low hover:text-charcoal transition-all group"
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <span className="block">{link.label}</span>
                      <span className="text-[9px] text-on-surface-variant/35 font-normal">
                        {link.description}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
