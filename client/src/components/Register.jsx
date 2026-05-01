import { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { buildRateLimitMessage, getRateLimitRetrySeconds } from "../utils/authRateLimit";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isRateLimited = Boolean(cooldownEndsAt && remainingSeconds > 0);

  useEffect(() => {
    if (!cooldownEndsAt) {
      setRemainingSeconds(0);
      return undefined;
    }

    const syncCooldown = () => {
      const seconds = Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000));

      setRemainingSeconds(seconds);
      if (seconds === 0) {
        setCooldownEndsAt(null);
        setError("");
      } else {
        setError(buildRateLimitMessage(seconds));
      }
    };

    syncCooldown();
    const intervalId = setInterval(syncCooldown, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownEndsAt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRateLimited) {
      setError(buildRateLimitMessage(remainingSeconds));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/auth/register`,
        { name, phone, email, password },
        { withCredentials: true }
      );
      setCooldownEndsAt(null);
      setRemainingSeconds(0);
      navigate("/login");
    } catch (error) {
      const retryAfterSeconds = getRateLimitRetrySeconds(error);

      if (retryAfterSeconds) {
        setCooldownEndsAt(Date.now() + retryAfterSeconds * 1000);
        setRemainingSeconds(retryAfterSeconds);
        setError(buildRateLimitMessage(retryAfterSeconds));
      } else {
        setError(error.response?.data?.message || "Something went wrong!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          Register new account
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              placeholder="Enter your phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="mt-2 w-full rounded-lg bg-yellow-500 px-4 py-2 font-medium text-white transition hover:bg-yellow-600"
          >
            {loading ? "Registering..." : isRateLimited ? `Try again in ${remainingSeconds}s` : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
