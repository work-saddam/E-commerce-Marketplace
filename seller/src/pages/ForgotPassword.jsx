import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
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

export function ForgotPassword() {
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
      await axios.post(`${BASE_URL}/api/auth/forgot-password/request-otp`, {
        email,
        userType: "seller",
      });
      toast.success("OTP sent to your email");
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
        userType: "seller",
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
        { email, otp, userType: "seller" },
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
      toast.success(
        "Password reset successfully. Please login with your new password.",
      );
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
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the 6-digit OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {!loading && <Send className="h-4 w-4" aria-hidden="true" />}
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <KeyRound
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  6-Digit OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength="6"
                  className="text-center text-lg tracking-widest font-mono"
                  required
                />
                <p className="text-xs text-gray-600">Valid for 10 minutes</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {!loading && (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                variant="outline"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {resendCooldown > 0
                  ? `Resend OTP (${resendCooldown}s)`
                  : "Resend OTP"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form
              onSubmit={handlePasswordReset}
              className="flex flex-col gap-4"
            >
              <div className="grid gap-2">
                <Label
                  htmlFor="newPassword"
                  className="flex items-center gap-2"
                >
                  <LockKeyhole
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Min 8 chars, with uppercase, lowercase, number, and special
                  character
                </p>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center gap-2"
                >
                  <LockKeyhole
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
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

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {!loading && (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/login">
              <Button variant="link" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
