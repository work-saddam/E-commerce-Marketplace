import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { BASE_URL } from "../utils/constants";
import {
  buildRateLimitMessage,
  getRateLimitRetrySeconds,
} from "../utils/authRateLimit";
import { useRegistrationOtp } from "../hooks/useRegistrationOtp";

const initialFields = {
  name: "",
  phone: "",
  email: "",
  password: "",
};

const Register = () => {
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
      const res = await axios.post(`${BASE_URL}/api/auth/register`, fields, {
        withCredentials: true,
      });

      setStep(2);
      resetOtpState();
      startCooldown(30);
      // toast.success("OTP sent to your email");
      toast.success(res.data.message);
    } catch (requestError) {
      const retryAfterSeconds = getRateLimitRetrySeconds(requestError);

      if (retryAfterSeconds) {
        startCooldown(retryAfterSeconds);
        setError(buildRateLimitMessage(retryAfterSeconds));
      } else {
        setError(
          requestError.response?.data?.message || "Something went wrong!",
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
        `${BASE_URL}/api/auth/register/verify-otp`,
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_36%,#020617_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between border-r border-white/10 p-10 md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">
                TrustKart
              </p>
              <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-white">
                Create your buyer account.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Register once, verify the OTP in your inbox, and get a verified
                account ready for checkout.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Step 1</p>
                <p>Enter your profile details and request an OTP.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-medium text-white">Step 2</p>
                <p>Verify the OTP and finish account creation.</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
                  Buyer Signup
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {step === 1 ? "Create your account" : "Verify your email"}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-3 py-1 ${
                    step === 1
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  1. Details
                </span>
                <span
                  className={`rounded-full px-3 py-1 ${
                    step === 2
                      ? "bg-amber-400 text-slate-950"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  2. OTP
                </span>
              </div>
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {step === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                  >
                    <User
                      className="h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={fields.name}
                    onChange={updateField("name")}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                  >
                    <Phone
                      className="h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="text"
                    placeholder="Enter your phone"
                    value={fields.phone}
                    onChange={updateField("phone")}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                  >
                    <Mail
                      className="h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={fields.email}
                    onChange={updateField("email")}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                  >
                    <LockKeyhole
                      className="h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={fields.password}
                    onChange={updateField("password")}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isRateLimited}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Sending OTP..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Send OTP
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <p className="font-medium text-white">OTP sent to</p>
                  <p className="mt-1 break-all">{fields.email}</p>
                </div>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200"
                  >
                    <KeyRound
                      className="h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />
                    6-digit OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(event) =>
                      setOtp(sanitizeOtp(event.target.value))
                    }
                    maxLength={6}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl tracking-[0.35em] text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    Valid for 10 minutes.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Edit details
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      "Verifying..."
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Verify OTP
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading || isRateLimited}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/50 bg-transparent px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRateLimited
                    ? `Resend OTP in ${remainingSeconds}s`
                    : "Resend OTP"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
