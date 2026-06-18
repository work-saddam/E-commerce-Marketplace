import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import { validateEmail } from "../../../shared/utils/validators/emailValidator";
import { routePaths } from "../../../app/router/routePaths";
import {
  requestForgotPasswordOtpRequest,
  verifyForgotPasswordOtpRequest,
  resetPasswordRequest,
} from "../api/authApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // UI / Action states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setTimeout(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [remainingSeconds]);

  // Password criteria helper
  const criteria = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /\d/.test(newPassword),
    symbol:
      /[!@#$%^&*(),.?":{}|<>_+\-`~]/.test(newPassword) ||
      newPassword.includes("[") ||
      newPassword.includes("]") ||
      newPassword.includes("\\") ||
      newPassword.includes("/"),
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors({ email: "Email address is required" });
      return;
    }
    if (!validateEmail(email)) {
      setFieldErrors({ email: "Invalid email format" });
      return;
    }

    setLoading(true);
    try {
      const response = await requestForgotPasswordOtpRequest(email);
      setLoading(false);
      setStep(2);
      setRemainingSeconds(30);
      toast.success(response.message || "OTP code sent successfully");
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!otp) {
      setError("OTP is required");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyForgotPasswordOtpRequest(email, otp);
      setLoading(false);
      setResetToken(response.resetToken);
      setStep(3);
      toast.success(response.message || "OTP verified successfully");
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || "Invalid or expired OTP. Try again.",
      );
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!newPassword) {
      setFieldErrors({ newPassword: "Password is required" });
      return;
    }
    if (!isPasswordValid) {
      setFieldErrors({ newPassword: "Password does not meet requirements" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordRequest(resetToken, newPassword);
      setLoading(false);
      toast.success(response.message || "Password reset successfully!");
      navigate(routePaths.LOGIN);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please try again.",
      );
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setOtp("");
    setError("");
  };

  return (
    <main className="flex min-h-screen flex-col md:flex-row bg-background font-body-md overflow-x-hidden">
      {/* Brand/Typography Sidebar */}
      <section className="hidden md:flex relative w-1/2 bg-surface-container overflow-hidden">
        {/* Ghost Text Background */}
        <div className="absolute -left-12 top-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-charcoal">
            FUTURE
          </span>
        </div>
        <div className="absolute -right-12 bottom-1/4 opacity-5 select-none pointer-events-none">
          <span className="font-display-bg-ghost text-display-bg-ghost text-charcoal">
            LUXURY
          </span>
        </div>

        {/* Bold Typography Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-start justify-center p-margin-edge max-w-2xl mx-auto">
          <div className="space-y-4">
            <span className="font-label-caps text-label-caps text-secondary tracking-[0.3em] uppercase block">
              Established 2024
            </span>
            <h2 className="font-display-xl text-display-xl text-charcoal font-black uppercase tracking-tight">
              THE FUTURE <br />
              <span className="text-secondary">OF</span> <br />
              <span className="text-secondary">COMMERCE</span>
            </h2>
            <div className="w-24 h-1 bg-charcoal mt-8 mb-12"></div>
            <p className="font-headline-sm text-headline-sm text-charcoal/80 max-w-md uppercase tracking-wider">
              TRUSTKART PREMIUM
            </p>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-4 leading-relaxed">
              Experience the intersection of{" "}
              <span className="text-charcoal font-bold">Curated Luxury</span>{" "}
              and{" "}
              <span className="text-charcoal font-bold">Precision Tech</span>.
              Our seasonal collections are crafted for those who demand
              excellence in every detail.
            </p>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 p-12">
          <div className="w-16 h-16 border-r border-b border-secondary opacity-30"></div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-margin-edge relative bg-surface-container-lowest min-h-screen">
        {/* Mobile Brand Logo */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 md:hidden">
          <span className="font-display-xl text-[32px] tracking-tight text-charcoal uppercase font-black">
            Trustkart
          </span>
        </div>

        <div className="w-full max-w-md space-y-8" id="form-container">
          <div className="text-center md:text-left">
            <h1 className="font-headline-lg text-headline-lg text-charcoal mb-2">
              Reset Password
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {step === 1 && "Recover your account credentials."}
              {step === 2 && "Enter verification details."}
              {step === 3 && "Secure your new account password."}
            </p>
          </div>

          {error && (
            <div className="rounded border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label
                  className="block font-label-caps text-label-caps text-charcoal mb-2"
                  htmlFor="email"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  className={`w-full px-4 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                    fieldErrors.email
                      ? "border-error"
                      : "border-outline-variant"
                  }`}
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                />
                {fieldErrors.email && (
                  <span className="text-error text-xs mt-1 block">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-5 cursor-pointer font-bold tracking-[0.2em] uppercase"
              >
                SEND RESET OTP
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="rounded border border-outline-variant bg-surface-container p-4 text-sm text-on-surface-variant">
                <p className="font-bold text-charcoal uppercase tracking-widest text-xs">
                  OTP SENT TO EMAIL
                </p>
                <p className="mt-1 break-all font-body-md">{email}</p>
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps text-charcoal mb-2"
                  htmlFor="otp"
                >
                  6-DIGIT OTP CODE
                </label>
                <input
                  className="w-full rounded-none border-0 border-b border-outline-variant bg-surface-container py-4 text-center text-2xl tracking-[0.35em] text-charcoal outline-none transition focus:border-charcoal focus:ring-0"
                  id="otp"
                  maxLength={6}
                  placeholder="••••••"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                  }}
                />
                <p className="mt-2 text-xs text-on-surface-variant">
                  Enter the verification code sent to your inbox.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackToStep1}
                  className="flex-1 py-4 cursor-pointer font-bold uppercase tracking-widest text-xs"
                >
                  BACK
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="flex-1 py-4 cursor-pointer font-bold uppercase tracking-[0.2em] text-sm"
                >
                  VERIFY OTP
                </Button>
              </div>

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading || remainingSeconds > 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded border border-outline-variant hover:bg-surface-container transition-colors font-button text-button text-charcoal cursor-pointer disabled:opacity-50 uppercase font-bold tracking-widest"
              >
                {remainingSeconds > 0
                  ? `RESEND OTP IN ${remainingSeconds}S`
                  : "RESEND OTP"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label
                  className="block font-label-caps text-label-caps text-charcoal mb-2"
                  htmlFor="new-password"
                >
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    className={`w-full pl-4 pr-12 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                      fieldErrors.newPassword
                        ? "border-error"
                        : "border-outline-variant"
                    }`}
                    id="new-password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          newPassword: null,
                        }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-charcoal transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <span className="text-error text-xs mt-1 block">
                    {fieldErrors.newPassword}
                  </span>
                )}
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps text-charcoal mb-2"
                  htmlFor="confirm-password"
                >
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    className={`w-full pl-4 pr-12 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                      fieldErrors.confirmPassword
                        ? "border-error"
                        : "border-outline-variant"
                    }`}
                    id="confirm-password"
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: null,
                        }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-charcoal transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <span className="text-error text-xs mt-1 block">
                    {fieldErrors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Password Requirement Guidelines */}
              <div className="rounded bg-surface-container p-4 space-y-2 text-xs">
                <p className="font-bold text-charcoal uppercase tracking-wider mb-1">
                  PASSWORD REQUIREMENTS:
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      criteria.length ? "bg-secondary" : "bg-outline"
                    }`}
                  ></span>
                  <span
                    className={
                      criteria.length
                        ? "text-charcoal"
                        : "text-on-surface-variant"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      criteria.lowercase && criteria.uppercase
                        ? "bg-secondary"
                        : "bg-outline"
                    }`}
                  ></span>
                  <span
                    className={
                      criteria.lowercase && criteria.uppercase
                        ? "text-charcoal"
                        : "text-on-surface-variant"
                    }
                  >
                    Uppercase & lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      criteria.number ? "bg-secondary" : "bg-outline"
                    }`}
                  ></span>
                  <span
                    className={
                      criteria.number
                        ? "text-charcoal"
                        : "text-on-surface-variant"
                    }
                  >
                    At least one number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      criteria.symbol ? "bg-secondary" : "bg-outline"
                    }`}
                  ></span>
                  <span
                    className={
                      criteria.symbol
                        ? "text-charcoal"
                        : "text-on-surface-variant"
                    }
                  >
                    At least one symbol (e.g. !@#$)
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                className="w-full py-5 cursor-pointer font-bold tracking-[0.2em] uppercase"
              >
                RESET PASSWORD
              </Button>
            </form>
          )}

          <p className="text-center font-body-md text-body-md text-on-surface-variant">
            Remember your password?
            <Link
              className="text-charcoal hover:text-secondary transition-colors underline underline-offset-4 ml-1 uppercase font-semibold"
              to={routePaths.LOGIN}
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
