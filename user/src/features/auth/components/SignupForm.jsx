import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useRegistrationOtp } from "../hooks/useRegistrationOtp";
import Button from "../../../shared/components/ui/Button";
import { validateEmail } from "../../../shared/utils/validators/emailValidator";
import { validatePassword } from "../../../shared/utils/validators/passwordValidator";
import { Eye, EyeOff } from "lucide-react";
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
    <div className="w-full max-w-md space-y-8" id="form-container">
      <div className="text-center md:text-left">
        <h1 className="font-headline-lg text-headline-lg text-charcoal mb-2">
          {step === 1 ? "Create Account" : "Verify Email"}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {step === 1
            ? "Start your curated performance experience."
            : "Enter the 6-digit OTP code sent to your inbox."}
        </p>
      </div>

      {error ? (
        <div className="rounded border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                className="block font-label-caps text-label-caps text-charcoal mb-2"
                htmlFor="name"
              >
                FULL NAME
              </label>
              <input
                className={`w-full px-4 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                  fieldErrors.name ? "border-error" : "border-outline-variant"
                }`}
                id="name"
                placeholder="JOHN DOE"
                type="text"
                value={fields.name}
                onChange={handleFieldChange("name")}
              />
              {fieldErrors.name ? (
                <span className="text-error text-xs mt-1 block">
                  {fieldErrors.name}
                </span>
              ) : null}
            </div>

            <div>
              <label
                className="block font-label-caps text-label-caps text-charcoal mb-2"
                htmlFor="phone"
              >
                PHONE NUMBER
              </label>
              <input
                className={`w-full px-4 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                  fieldErrors.phone ? "border-error" : "border-outline-variant"
                }`}
                id="phone"
                placeholder="E.G. 9876543210"
                type="text"
                value={fields.phone}
                onChange={handleFieldChange("phone")}
              />
              {fieldErrors.phone ? (
                <span className="text-error text-xs mt-1 block">
                  {fieldErrors.phone}
                </span>
              ) : null}
            </div>

            <div>
              <label
                className="block font-label-caps text-label-caps text-charcoal mb-2"
                htmlFor="email"
              >
                EMAIL ADDRESS
              </label>
              <input
                className={`w-full px-4 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                  fieldErrors.email ? "border-error" : "border-outline-variant"
                }`}
                id="email"
                placeholder="name@company.com"
                type="email"
                value={fields.email}
                onChange={handleFieldChange("email")}
              />
              {fieldErrors.email ? (
                <span className="text-error text-xs mt-1 block">
                  {fieldErrors.email}
                </span>
              ) : null}
            </div>

            <div>
              <label
                className="block font-label-caps text-label-caps text-charcoal mb-2"
                htmlFor="password"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  className={`w-full pl-4 pr-12 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                    fieldErrors.password ? "border-error" : "border-outline-variant"
                  }`}
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={fields.password}
                  onChange={handleFieldChange("password")}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-charcoal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container cursor-pointer flex items-center justify-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <span className="text-error text-xs mt-1 block">
                  {fieldErrors.password}
                </span>
              ) : null}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full py-5 cursor-pointer font-bold tracking-[0.2em] uppercase"
          >
            SEND OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="rounded border border-outline-variant bg-surface-container p-4 text-sm text-on-surface-variant">
            <p className="font-bold text-charcoal uppercase tracking-widest text-xs">OTP SENT TO EMAIL</p>
            <p className="mt-1 break-all font-body-md">{fields.email}</p>
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
              onChange={(e) => setOtp(sanitizeOtp(e.target.value))}
            />
            <p className="mt-2 text-xs text-on-surface-variant">
              Enter the OTP code from your email (e.g. 123456 in mock mode).
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
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
            disabled={loading || isRateLimited}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded border border-outline-variant hover:bg-surface-container transition-colors font-button text-button text-charcoal cursor-pointer disabled:opacity-50 uppercase font-bold tracking-widest"
          >
            {isRateLimited
              ? `RESEND OTP IN ${remainingSeconds}S`
              : "RESEND OTP"}
          </button>
        </form>
      )}

      <p className="text-center font-body-md text-body-md text-on-surface-variant">
        Already have an account?
        <Link
          className="text-charcoal hover:text-secondary transition-colors underline underline-offset-4 ml-1 uppercase font-semibold"
          to="/login"
        >
          SIGN IN
        </Link>
      </p>
    </div>
  );
}

export default SignupForm;
