import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../../../shared/components/ui/Button";
import { Eye, EyeOff, Grid } from "lucide-react";

function LoginForm() {
  const {
    login,
    isLoading,
    error: apiError,
    setError: setApiError,
  } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier = "Email or Phone is required";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await login(identifier, password);
  };

  return (
    <div className="w-full max-w-md space-y-8" id="form-container">
      <div className="text-center md:text-left">
        <h1 className="font-headline-lg text-headline-lg text-charcoal mb-2">
          Welcome Back
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Sign in to continue your premium journey.
        </p>
      </div>

      {/* Social Logins */}
      {/* <div className="flex gap-4">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded hover:bg-surface-container transition-colors font-button text-button text-charcoal cursor-pointer"
        >
          <img
            alt="Google"
            className="w-5 h-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsqO4d5-vwIhmqGhjJRswD_clxZBnR_5z1Lrj86eZrunczdJqGWaUFjpghTNWj7c7OOzlMMB28FtHjvyCy0iy7UuX0PU4zX0HJoL2eaaA41_eqK6_EUplOxPSzSWYqus4Un7tnf-OTI_NS0nNUPpJaAe7wUtpXAkWAlVJomDjo_CKW69aCzaZeWOcHhbC4m9P8chFapIWaW7YYfgyzI0GBCtVyeyOGFzWyY15IjrLt0XjsDd67hE1oeTm1tBcVfIttInsABBIsahJD"
          />
          GOOGLE
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded hover:bg-surface-container transition-colors font-button text-button text-charcoal cursor-pointer"
        >
          <Grid className="w-4 h-4 text-charcoal" />
          APPLE
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant"></div>
        </div>
        <div className="relative flex justify-center text-label-caps text-label-caps">
          <span className="bg-surface-container-lowest px-4 text-on-surface-variant uppercase">
            or email
          </span>
        </div>
      </div> */}

      {apiError ? (
        <div className="rounded border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {apiError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              className="block font-label-caps text-label-caps text-charcoal mb-2"
              htmlFor="email-or-phone"
            >
              EMAIL ADDRESS
            </label>
            <input
              className={`w-full px-4 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                fieldErrors.identifier
                  ? "border-error"
                  : "border-outline-variant"
              }`}
              id="email-or-phone"
              placeholder="name@company.com"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (fieldErrors.identifier) {
                  setFieldErrors((prev) => ({ ...prev, identifier: null }));
                }
              }}
            />
            {fieldErrors.identifier ? (
              <span className="text-error text-xs mt-1 block">
                {fieldErrors.identifier}
              </span>
            ) : null}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                className="block font-label-caps text-label-caps text-charcoal"
                htmlFor="password"
              >
                PASSWORD
              </label>
              <Link
                className="text-label-caps font-label-caps text-secondary hover:text-charcoal transition-all underline decoration-1 underline-offset-4 uppercase"
                to="/forgot-password"
              >
                FORGOT?
              </Link>
            </div>
            <div className="relative">
              <input
                className={`w-full pl-4 pr-12 py-4 rounded-none bg-surface-container border-0 border-b focus:border-charcoal focus:ring-0 transition-all text-body-md font-body-md outline-none ${
                  fieldErrors.password
                    ? "border-error"
                    : "border-outline-variant"
                }`}
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
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
          isLoading={isLoading}
          className="w-full py-5 cursor-pointer font-bold tracking-[0.2em] uppercase"
        >
          SIGN IN
        </Button>
      </form>

      <p className="text-center font-body-md text-body-md text-on-surface-variant">
        Don't have an account?
        <Link
          className="text-charcoal hover:text-secondary transition-colors underline underline-offset-4 ml-1 uppercase font-semibold"
          to="/signup"
        >
          CREATE ACCOUNT
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
