import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "@/utils/constant";
import {
  buildRateLimitMessage,
  getRateLimitRetrySeconds,
} from "@/utils/authRateLimit";
import { useRegistrationOtp } from "@/hooks/useRegistrationOtp";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Building2,
  IdCard,
  KeyRound,
  LockKeyhole,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

const initialFields = {
  sellerName: "",
  shopName: "",
  email: "",
  password: "",
  phone: "",
  gstNumber: "",
  panNumber: "",
};

export function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState(initialFields);
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

  const updateField = (name) => (event) => {
    const { value } = event.target;
    setFields((previous) => ({ ...previous, [name]: value }));
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    if (loading || isRateLimited) {
      if (isRateLimited) {
        setError(buildRateLimitMessage(remainingSeconds));
      }
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/api/seller/register`, fields, {
        withCredentials: true,
      });

      setStep(2);
      resetOtpState();
      startCooldown(30);
      toast.success("OTP sent to your email");
    } catch (requestError) {
      const retryAfterSeconds = getRateLimitRetrySeconds(requestError);

      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
        setError(buildRateLimitMessage(retryAfterSeconds));
      } else {
        setError(
          requestError.response?.data?.message || "Something went wrong.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!otp) {
      setError("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/seller/register/verify-otp`,
        {
          email: fields.email,
          otp,
        },
        { withCredentials: true },
      );

      toast.success("Registration verified successfully.");
      navigate("/login");
    } catch (verifyError) {
      const retryAfterSeconds = getRateLimitRetrySeconds(verifyError);

      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
        setError(buildRateLimitMessage(retryAfterSeconds));
      } else {
        setError(verifyError.response?.data?.message || "Invalid OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError("");
    resetOtpState();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-stone-100 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center">
        <Card className="w-full overflow-hidden border-stone-200/80 shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
          <div className="grid md:grid-cols-[1fr_1.15fr]">
            <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">
                  Seller Dashboard
                </p>
                <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
                  Launch your seller workspace in minutes.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                  The seller flow now uses a 2-step signup: submit details,
                  verify the OTP, then wait for approval as usual.
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Step 1</p>
                  <p>Submit seller details and request a verification OTP.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">Step 2</p>
                  <p>
                    Verify the OTP and continue to the seller approval flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              <CardHeader className="px-0 pt-0">
                <CardAction className="justify-end">
                  <Button asChild variant="link" className="gap-1.5">
                    <Link to="/login">
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Login
                    </Link>
                  </Button>
                </CardAction>
                <CardTitle className="text-2xl">
                  {step === 1 ? "Signup to new account" : "Verify your email"}
                </CardTitle>
                <CardDescription>
                  {step === 1
                    ? "Enter your details below to create the seller registration request."
                    : "Enter the 6-digit OTP sent to your email to finish signup."}
                </CardDescription>
              </CardHeader>

              <div className="mb-6 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    step === 1
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  1. Details
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    step === 2
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  2. OTP
                </span>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <CardContent className="px-0">
                {step === 1 ? (
                  <form onSubmit={handleRequestOtp}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="sellerName"
                          className="flex items-center gap-2"
                        >
                          <User
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          Seller Name
                        </Label>
                        <Input
                          id="sellerName"
                          type="text"
                          placeholder="Enter your name"
                          value={fields.sellerName}
                          onChange={updateField("sellerName")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="shopName"
                          className="flex items-center gap-2"
                        >
                          <Store
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          Shop Name
                        </Label>
                        <Input
                          id="shopName"
                          type="text"
                          placeholder="Enter your shop name"
                          value={fields.shopName}
                          onChange={updateField("shopName")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          value={fields.email}
                          onChange={updateField("email")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="password"
                          className="flex items-center gap-2"
                        >
                          <LockKeyhole
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter strong password"
                          value={fields.password}
                          onChange={updateField("password")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="text"
                          placeholder="Enter your contact number"
                          value={fields.phone}
                          onChange={updateField("phone")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="gstNumber"
                          className="flex items-center gap-2"
                        >
                          <BadgePercent
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          GST Number
                        </Label>
                        <Input
                          id="gstNumber"
                          type="text"
                          placeholder="Enter GST number"
                          value={fields.gstNumber}
                          onChange={updateField("gstNumber")}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label
                          htmlFor="panNumber"
                          className="flex items-center gap-2"
                        >
                          <IdCard
                            className="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          PAN Number
                        </Label>
                        <Input
                          id="panNumber"
                          type="text"
                          placeholder="Enter PAN number"
                          value={fields.panNumber}
                          onChange={updateField("panNumber")}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="mt-6 w-full gap-2"
                      disabled={loading || isRateLimited}
                    >
                      {loading ? (
                        "Sending OTP..."
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" aria-hidden="true" />
                          Send OTP
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                      <p className="font-medium text-stone-900">OTP sent to</p>
                      <p className="mt-1 break-all">{fields.email}</p>
                    </div>

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
                        onChange={(event) =>
                          setOtp(sanitizeOtp(event.target.value))
                        }
                        maxLength="6"
                        className="text-center text-lg tracking-widest font-mono"
                        required
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                      <p className="text-xs text-gray-600">
                        Valid for 10 minutes
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Edit details
                      </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2"
                      disabled={loading}
                    >
                        {loading ? (
                          "Verifying..."
                        ) : (
                          <>
                            <ShieldCheck
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Verify OTP
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={loading || isRateLimited}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <Building2 className="h-4 w-4" aria-hidden="true" />
                      {isRateLimited
                        ? `Resend OTP (${remainingSeconds}s)`
                        : "Resend OTP"}
                    </Button>
                  </form>
                )}
              </CardContent>

              <CardFooter className="px-0 pb-0 pt-6">
                <p className="text-sm text-muted-foreground">
                  Need to sign in instead?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                  >
                    Go to login
                  </Link>
                </p>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
