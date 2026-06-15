import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../../../shared/components/ui/Button";
import { Mail, LockKeyhole } from "lucide-react";

function LoginForm() {
  const {
    login,
    isLoading,
    error: apiError,
    setError: setApiError,
  } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="w-full max-w-md space-y-8">
      <div className="text-center md:text-left">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Welcome Back
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Sign in to continue your premium journey.
        </p>
      </div>

      {/* Social Logins */}
      {/* <div className="flex gap-4">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-full hover:bg-surface-container transition-colors font-label-bold text-label-bold text-on-surface cursor-pointer"
        >
          <img
            alt="Google"
            className="w-5 h-5"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsqO4d5-vwIhmqGhjJRswD_clxZBnR_5z1Lrj86eZrunczdJqGWaUFjpghTNWj7c7OOzlMMB28FtHjvyCy0iy7UuX0PU4zX0HJoL2eaaA41_eqK6_EUplOxPSzSWYqus4Un7tnf-OTI_NS0nNUPpJaAe7wUtpXAkWAlVJomDjo_CKW69aCzaZeWOcHhbC4m9P8chFapIWaW7YYfgyzI0GBCtVyeyOGFzWyY15IjrLt0XjsDd67hE1oeTm1tBcVfIttInsABBIsahJD"
          />
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-outline-variant rounded-full hover:bg-surface-container transition-colors font-label-bold text-label-bold text-on-surface cursor-pointer"
        >
          <span className="text-xl font-bold"></span>
          Apple
        </button>
      </div> */}

      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/50"></div>
        </div>
        <div className="relative flex justify-center text-xs text-label-bold">
          <span className="bg-surface-container-low px-4 text-secondary uppercase tracking-widest">
            or email
          </span>
        </div>
      </div> */}

      {apiError ? (
        <div className="rounded-2xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {apiError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface mb-2 ml-4"
              htmlFor="email-or-phone"
            >
              <Mail className="w-4 h-4 text-secondary" />
              Email or Phone
            </label>
            <input
              className={`w-full px-6 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                fieldErrors.identifier ? "ring-error" : "ring-outline-variant"
              }`}
              id="email-or-phone"
              placeholder="name@company.com or phone"
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
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.identifier}
              </span>
            ) : null}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-4 mr-4">
              <label
                className="flex items-center gap-2 font-label-bold text-label-bold text-on-surface"
                htmlFor="password"
              >
                <LockKeyhole className="w-4 h-4 text-secondary" />
                Password
              </label>
              <Link
                className="text-label-bold font-label-bold text-primary hover:underline transition-all text-xs"
                to="/forgot-password"
              >
                Forgot?
              </Link>
            </div>
            <input
              className={`w-full px-6 py-4 rounded-full bg-surface-container-lowest border-0 ring-1 focus:ring-2 focus:ring-primary transition-all text-body-md font-body-md outline-none ${
                fieldErrors.password ? "ring-error" : "ring-outline-variant"
              }`}
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: null }));
                }
              }}
            />
            {fieldErrors.password ? (
              <span className="text-error text-xs ml-4 mt-1 block">
                {fieldErrors.password}
              </span>
            ) : null}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-4 tracking-wide shadow-lg cursor-pointer"
        >
          Sign In
        </Button>
      </form>

      <p className="text-center font-body-md text-body-md text-secondary">
        Don't have an account?
        <Link
          className="font-label-bold text-on-surface hover:text-primary transition-colors underline ml-1"
          to="/signup"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
