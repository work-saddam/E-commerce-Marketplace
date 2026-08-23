import { useState, useEffect, useRef } from "react";
import {
  X,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import apiClient from "../../shared/services/apiClient";

/**
 * EditContactModal — 2-step OTP flow.
 *
 * Step 1: User enters new email/phone → we validate + send OTP to current email.
 * Step 2: User enters the 6-digit OTP → we verify + apply the update.
 *
 * Props:
 *  - type: "email" | "phone"
 *  - currentValue: string
 *  - currentEmail: string  (always the account email, needed for the OTP hint)
 *  - onSave: async (field, value, otp) => void
 *  - onClose: () => void
 */

const CONFIG = {
  email: {
    label: "Email Address",
    icon: Mail,
    inputType: "email",
    placeholder: "you@example.com",
    hint: "Enter a valid email address",
    validate: (v) => {
      if (!v.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
        return "Enter a valid email address";
      return null;
    },
  },
  phone: {
    label: "Phone Number",
    icon: Phone,
    inputType: "tel",
    placeholder: "10-digit mobile number",
    hint: "Enter a 10-digit mobile number",
    validate: (v) => {
      if (!v.trim()) return "Phone number is required";
      if (!/^[0-9]{10}$/.test(v.trim()))
        return "Phone must be exactly 10 digits";
      return null;
    },
  },
};

export default function EditContactModal({ type, currentValue, currentEmail, onSave, onClose }) {
  // Step 1 state
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);

  // Step 2 state
  const [step, setStep] = useState(1); // 1 | 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const valueRef = useRef(null);
  const otpRefs = useRef([]);

  const config = CONFIG[type];
  const Icon = config.icon;

  // Auto-focus on open
  useEffect(() => {
    setTimeout(() => valueRef.current?.focus(), 80);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────

  const handleValueChange = (e) => {
    setValue(e.target.value);
    if (valueError) setValueError("");
  };

  const handleSendOtp = async () => {
    const err = config.validate(value);
    if (err) { setValueError(err); return; }
    if (value.trim() === currentValue) {
      setValueError(`This is already your current ${type}`);
      return;
    }

    setSendingOtp(true);
    setValueError("");
    try {
      await apiClient.post("/api/users/profile/contact/send-otp", {
        field: type,
        value: value.trim(),
      });
      setStep(2);
      setResendCooldown(60);
      // Focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setValueError(err?.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Step 2: OTP input ─────────────────────────────────────────────────────

  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return; // digits only
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    setOtpError("");
    // Auto-advance
    if (val && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setOtpError("Please enter the complete 6-digit OTP"); return; }

    setVerifying(true);
    setOtpError("");
    try {
      await onSave(type, value.trim(), code);
      // onSave closes the modal on success
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setSendingOtp(true);
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);
    try {
      await apiClient.post("/api/users/profile/contact/send-otp", {
        field: type,
        value: value.trim(),
      });
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Mask email for display (e.g. s***@gmail.com)
  const maskedEmail = currentEmail
    ? currentEmail.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) =>
        first + "*".repeat(Math.min(middle.length, 4)) + domain,
      )
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-outline-variant/8">
          {step === 2 && (
            <button
              onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
              disabled={verifying}
              className="text-on-surface-variant/40 hover:text-charcoal transition-colors cursor-pointer mr-1 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 bg-champagne/10 border border-champagne/15 rounded-lg flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-champagne" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-charcoal">
              Update {config.label}
            </h3>
            <p className="text-[10px] text-on-surface-variant/45 mt-0.5">
              {step === 1
                ? <>Current: <span className="font-semibold text-on-surface-variant/70">{currentValue}</span></>
                : <>Step 2 of 2 — Enter the OTP</>}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={sendingOtp || verifying}
            className="ml-auto text-on-surface-variant/30 hover:text-charcoal transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step 1: Enter new value ── */}
        {step === 1 && (
          <div className="px-6 py-6 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="contact-value"
                className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest block"
              >
                New {config.label}
              </label>
              <input
                ref={valueRef}
                id="contact-value"
                type={config.inputType}
                value={value}
                onChange={handleValueChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                placeholder={config.placeholder}
                disabled={sendingOtp}
                className={`w-full px-4 py-2.5 border rounded-xl bg-surface-container-lowest text-charcoal text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/25 ${
                  valueError
                    ? "border-red-400/50 focus:ring-red-300/30 focus:border-red-400"
                    : "border-outline-variant/15 focus:ring-champagne/30 focus:border-champagne"
                }`}
              />
              {valueError ? (
                <p className="text-[10px] text-red-500 font-semibold mt-1">
                  ⚠ {valueError}
                </p>
              ) : (
                <p className="text-[10px] text-on-surface-variant/35 mt-1">
                  {config.hint}
                </p>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 bg-champagne/5 border border-champagne/10 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-champagne shrink-0 mt-0.5" />
              <p className="text-[10px] text-on-surface-variant/55 leading-relaxed">
                An OTP will be sent to your current registered email to verify this change.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sendingOtp}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal border border-outline-variant/15 px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-charcoal text-surface-container-lowest text-[10px] px-4 py-2.5 rounded-xl hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase shadow-sm disabled:opacity-50"
              >
                {sendingOtp ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Mail className="w-3 h-3" />
                )}
                <span>{sendingOtp ? "Sending OTP..." : "Send OTP"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Enter OTP ── */}
        {step === 2 && (
          <div className="px-6 py-6 space-y-6">
            {/* Instruction */}
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-champagne/10 border border-champagne/15 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-champagne" />
                </div>
              </div>
              <p className="text-xs font-semibold text-charcoal">
                OTP sent to your email
              </p>
              <p className="text-[11px] text-on-surface-variant/55 leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-bold text-charcoal">{maskedEmail}</span>.
                It expires in 10 minutes.
              </p>
            </div>

            {/* OTP boxes */}
            <div className="flex justify-center gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={verifying}
                  className={`w-11 h-12 text-center text-lg font-bold border rounded-xl bg-surface-container-lowest text-charcoal focus:outline-none focus:ring-2 transition-all ${
                    otpError
                      ? "border-red-400/50 focus:ring-red-300/30"
                      : digit
                      ? "border-champagne focus:ring-champagne/30"
                      : "border-outline-variant/15 focus:ring-champagne/30 focus:border-champagne"
                  }`}
                />
              ))}
            </div>

            {/* OTP error */}
            {otpError && (
              <p className="text-[10px] text-red-500 font-semibold text-center -mt-2">
                ⚠ {otpError}
              </p>
            )}

            {/* Resend */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || sendingOtp || verifying}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-champagne transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${sendingOtp ? "animate-spin" : ""}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : sendingOtp
                    ? "Sending..."
                    : "Resend OTP"}
                </span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
                disabled={verifying}
                className="flex-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-charcoal border border-outline-variant/15 px-4 py-2.5 rounded-xl hover:bg-surface-container-low transition-all cursor-pointer disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying || otp.join("").length < 6}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-charcoal text-surface-container-lowest text-[10px] px-4 py-2.5 rounded-xl hover:bg-champagne hover:text-charcoal transition-all cursor-pointer font-bold uppercase shadow-sm disabled:opacity-50"
              >
                {verifying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span>{verifying ? "Verifying..." : "Verify & Save"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
