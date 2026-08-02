import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Pencil,
  Save,
  X,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Loader from "../../shared/components/feedback/Loader";

export default function ProfileInfoTab({ profile, loading, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

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

      {/* Account Details */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
          Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
            <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg shrink-0">
              <Mail className="w-4.5 h-4.5 text-on-surface-variant/50" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-on-surface-variant/35 uppercase tracking-widest flex items-center gap-1">
                Email Address
                <Lock className="w-2.5 h-2.5" />
              </p>
              <p className="text-sm font-semibold text-charcoal truncate mt-0.5">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
            <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded-lg shrink-0">
              <Phone className="w-4.5 h-4.5 text-on-surface-variant/50" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold text-on-surface-variant/35 uppercase tracking-widest flex items-center gap-1">
                Phone Number
                <Lock className="w-2.5 h-2.5" />
              </p>
              <p className="text-sm font-semibold text-charcoal truncate mt-0.5">
                {profile.phone}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Note */}
      <div className="flex items-start gap-3 p-4 bg-champagne/5 border border-champagne/10 rounded-xl">
        <Lock className="w-4 h-4 text-champagne shrink-0 mt-0.5" />
        <p className="text-xs text-on-surface-variant/65 leading-relaxed">
          Email and phone number are linked to your account and cannot be
          changed from here. Contact support for assistance.
        </p>
      </div>
    </div>
  );
}
