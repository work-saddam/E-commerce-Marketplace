import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Loader from "../../shared/components/feedback/Loader";
import EditContactModal from "./EditContactModal";

export default function ProfileInfoTab({ profile, loading, onSave, onContactSave, currentEmail }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  // Modal state: null | "email" | "phone"
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (profile) setName(profile.name || "");
  }, [profile]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (trimmed === profile.name) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch {
      // error handled in parent
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || "");
    setEditing(false);
  };

  const handleContactSave = async (field, value, currentPassword) => {
    // Delegate to parent (which handles the API call + Redux sync)
    await onContactSave(field, value, currentPassword);
    setActiveModal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-on-surface-variant/30" />
        <p className="text-sm text-on-surface-variant/60">
          Unable to load profile information.
        </p>
      </div>
    );
  }

  const initial = profile.name ? profile.name[0].toUpperCase() : "U";

  return (
    <div className="space-y-8">
      {/* Avatar & Name Hero */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-champagne text-charcoal flex items-center justify-center text-3xl sm:text-4xl font-black select-none shrink-0 shadow-lg border-4 border-surface-container-lowest">
          {initial}
        </div>
        <div className="flex-1 min-w-0 text-center sm:text-left">
          {!editing ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight">
                {profile.name}
              </h2>
              <p className="text-xs text-on-surface-variant/55 font-label-caps uppercase tracking-widest mt-1">
                Premium Member
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-champagne border border-secondary/20 hover:border-champagne px-4 py-2 rounded-lg hover:bg-champagne/5 transition-all cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit Name</span>
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <label
                htmlFor="profile-name"
                className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block"
              >
                Full Name
              </label>
              <input
                ref={inputRef}
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="w-full max-w-sm px-4 py-2.5 border border-outline-variant/20 rounded-xl bg-surface-container-lowest text-charcoal text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-champagne/30 focus:border-champagne transition-all"
                placeholder="Enter your name"
                disabled={saving}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-charcoal text-surface-container-lowest font-label-caps text-[10px] px-5 py-2 rounded-lg hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal border border-outline-variant/15 px-4 py-2 rounded-lg hover:bg-surface-container-low transition-all cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Details — editable */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email card */}
          <ContactCard
            icon={Mail}
            label="Email Address"
            value={profile.email}
            onEdit={() => setActiveModal("email")}
          />
          {/* Phone card */}
          <ContactCard
            icon={Phone}
            label="Phone Number"
            value={profile.phone}
            onEdit={() => setActiveModal("phone")}
          />
        </div>
      </div>

      {/* Edit Contact Modal */}
      {activeModal && (
        <EditContactModal
          type={activeModal}
          currentValue={activeModal === "email" ? profile.email : profile.phone}
          currentEmail={currentEmail || profile.email}
          onSave={handleContactSave}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

/* ── Reusable Contact Card ── */

function ContactCard({ icon: Icon, label, value, onEdit }) {
  return (
    <div className="group flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant/10 hover:border-champagne/20 rounded-xl transition-all">
      <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg shrink-0">
        <Icon className="w-4.5 h-4.5 text-on-surface-variant/50" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-on-surface-variant/35 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-semibold text-charcoal truncate mt-0.5">
          {value}
        </p>
      </div>
      <button
        onClick={onEdit}
        className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-secondary hover:text-champagne border border-secondary/15 hover:border-champagne px-2.5 py-1.5 rounded-md hover:bg-champagne/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
        title={`Edit ${label}`}
      >
        <Pencil className="w-2.5 h-2.5" />
        <span>Edit</span>
      </button>
    </div>
  );
}
