import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/forgot-password/request-otp`,
        { email },
      );
      toast.success(res?.data?.message || "OTP sent to your email");
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/request-otp`, {
        email,
      });
      toast.success("OTP resent to your email");
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
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
    try {
      const res = await axios.post(
        `${BASE_URL}/api/auth/forgot-password/verify-otp`,
        { email, otp },
      );
      toast.success("OTP verified");
      setResetToken(res.data.resetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setError(
        "Password must include uppercase, lowercase, number, and special character",
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/forgot-password/reset-password`, {
        resetToken,
        newPassword,
      });
      toast.success("Password reset successfully.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Reset Password
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {step === 1 && "Enter your email to receive an OTP"}
          {step === 2 && "Enter the 6-digit OTP sent to your email"}
          {step === 3 && "Create your new password"}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 text-gray-500" aria-hidden="true" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {!loading && <Send className="h-4 w-4" aria-hidden="true" />}
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <KeyRound
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                6-Digit OTP
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength="6"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-2xl tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 font-mono"
              />
              <p className="mt-2 text-xs text-gray-600">Valid for 10 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {!loading && (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-yellow-500 px-4 py-2 font-medium text-yellow-600 transition hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {resendCooldown > 0
                ? `Resend OTP (${resendCooldown}s)`
                : "Resend OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <LockKeyhole
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Min 8 chars, with uppercase, lowercase, number, and special
                character
              </p>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <LockKeyhole
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600 disabled:bg-gray-400"
            >
              {!loading && (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
