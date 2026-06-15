import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useRegistrationOtp } from "../hooks/useRegistrationOtp";
import Button from "../../../shared/components/ui/Button";
import { validateEmail } from "../../../shared/utils/validators/emailValidator";
import { validatePassword } from "../../../shared/utils/validators/passwordValidator";
import { User, Phone, Mail, LockKeyhole, KeyRound, Eye, EyeOff } from "lucide-react";
import { routePaths } from "../../../app/router/routePaths";

function SignupForm() {
  const navigate = useNavigate();
  const { signup, verifyOtp } = useAuth();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const {
    otp,
    setOtp,
    sanitizeOtp,
    error,
    setError,
    loading,
    setLoading,
    remainingSeconds,
    isRateLimited,
    startCooldown,
    resetOtpState,
  } = useRegistrationOtp();

  const [fieldErrors, setFieldErrors] = useState({});

  const handleFieldChange = (name) => (e) => {
    setFields((prev) => ({ ...prev, [name]: e.target.value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!fields.name.trim()) errors.name = "Full name is required";
    if (!fields.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(fields.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    if (!fields.email.trim()) {
      errors.email = "Email address is required";
    } else if (!validateEmail(fields.email)) {
      errors.email = "Invalid email format";
    }
    if (!fields.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(fields.password)) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await signup(fields);
    setLoading(false);

    if (result.success) {
      setStep(2);
      resetOtpState();
      startCooldown(30); // 30 seconds rate limit cooldown
      toast.success(result.message || "OTP sent to your email");
    } else {
      setError(result.error || "Failed to register. Please check details.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    const result = await verifyOtp(fields.email, otp);
    setLoading(false);

    if (result.success) {
      toast.success("Registration verified successfully.");
      navigate(routePaths.LOGIN);
    } else {
      setError(result.error || "Invalid OTP. Please try again.");
    }
  };

  const handleBack = () => {
    setStep(1);
    setError("");
    resetOtpState();
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center md:text-left">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          {step === 1 ? "Join Trustkart" : "Verify Email"}
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          {step === 1
            ? "Start your curated performance experience."
            : `Enter the 6-digit OTP code sent to your inbox.`}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="name"
            >
              <User className="w-4 h-4 text-secondary" />
              Full Name
            </label>
            <input
              className={`w-full px-6 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                fieldErrors.name ? "ring-error" : "ring-outline-variant"
              }`}
              id="name"
              placeholder="John Doe"
              type="text"
              value={fields.name}
              onChange={handleFieldChange("name")}
            />
            {fieldErrors.name ? (
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.name}
              </span>
            ) : null}
          </div>

          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="phone"
            >
              <Phone className="w-4 h-4 text-secondary" />
              Phone Number
            </label>
            <input
              className={`w-full px-6 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                fieldErrors.phone ? "ring-error" : "ring-outline-variant"
              }`}
              id="phone"
              placeholder="e.g. 9876543210"
              type="text"
              value={fields.phone}
              onChange={handleFieldChange("phone")}
            />
            {fieldErrors.phone ? (
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.phone}
              </span>
            ) : null}
          </div>

          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="email"
            >
              <Mail className="w-4 h-4 text-secondary" />
              Email Address
            </label>
            <input
              className={`w-full px-6 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                fieldErrors.email ? "ring-error" : "ring-outline-variant"
              }`}
              id="email"
              placeholder="name@company.com"
              type="email"
              value={fields.email}
              onChange={handleFieldChange("email")}
            />
            {fieldErrors.email ? (
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.email}
              </span>
            ) : null}
          </div>

          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="password"
            >
              <LockKeyhole className="w-4 h-4 text-secondary" />
              Password
            </label>
            <div className="relative">
              <input
                className={`w-full pl-6 pr-12 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                  fieldErrors.password ? "ring-error" : "ring-outline-variant"
                }`}
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={fields.password}
                onChange={handleFieldChange("password")}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password ? (
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.password}
              </span>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full py-4 tracking-wide shadow-lg mt-2 cursor-pointer"
          >
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 text-sm text-secondary">
            <p className="font-semibold text-on-surface">OTP sent to email</p>
            <p className="mt-1 break-all">{fields.email}</p>
          </div>

          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="otp"
            >
              <KeyRound className="w-4 h-4 text-secondary" />
              6-digit OTP Code
            </label>
            <input
              className="w-full rounded-full border-0 ring-1 ring-outline-variant bg-surface-container-lowest py-4 text-center text-2xl tracking-[0.35em] text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
              id="otp"
              maxLength={6}
              placeholder="••••••"
              type="text"
              value={otp}
              onChange={(e) => setOtp(sanitizeOtp(e.target.value))}
            />
            <p className="mt-2 text-xs text-secondary ml-4">
              Enter the OTP code from your email (e.g. 123456 in mock mode).
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              className="flex-1 py-4 cursor-pointer"
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="flex-1 py-4 cursor-pointer"
            >
              Verify OTP
            </Button>
          </div>

          <button
            type="button"
            onClick={handleRequestOtp}
            disabled={loading || isRateLimited}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-outline-variant hover:bg-surface-container transition-colors font-label-bold text-label-bold text-on-surface cursor-pointer disabled:opacity-50"
          >
            {isRateLimited
              ? `Resend OTP in ${remainingSeconds}s`
              : "Resend OTP"}
          </button>
        </form>
      )}

      <p className="text-center font-body-md text-body-md text-secondary">
        Already have an account?
        <Link
          className="font-label-bold text-on-surface hover:text-primary transition-colors underline ml-1"
          to="/login"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}

export default SignupForm;
