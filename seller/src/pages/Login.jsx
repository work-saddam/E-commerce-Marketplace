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
import { addUser } from "@/store/userSlice";
import {
  buildRateLimitMessage,
  getRateLimitRetrySeconds,
} from "@/utils/authRateLimit";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  UserPlus,
} from "lucide-react";

export function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRateLimited = Boolean(cooldownEndsAt && remainingSeconds > 0);

  useEffect(() => {
    if (!cooldownEndsAt) {
      setRemainingSeconds(0);
      return undefined;
    }

    const syncCooldown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((cooldownEndsAt - Date.now()) / 1000),
      );

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
      const res = await axios.post(
        `${BASE_URL}/api/seller/login`,
        { identifier, password },
        { withCredentials: true },
      );
      setCooldownEndsAt(null);
      setRemainingSeconds(0);
      dispatch(addUser(res?.data?.data));
      navigate("/");
    } catch (error) {
      const retryAfterSeconds = getRateLimitRetrySeconds(error);

      if (retryAfterSeconds) {
        setCooldownEndsAt(Date.now() + retryAfterSeconds * 1000);
        setRemainingSeconds(retryAfterSeconds);
        setError(buildRateLimitMessage(retryAfterSeconds));
      } else {
        setError(
          error?.response?.data?.message ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm ">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your credentials below to login
          </CardDescription>
          <CardAction>
            <Button asChild variant="link" className="gap-1.5">
              <Link to="/signup">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Sign Up
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Email/Mobile
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@example.com"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="ml-auto">
                    <Button variant="link" size="sm" className="gap-1.5">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      Forgot?
                    </Button>
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter strong password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center pt-4">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading || isRateLimited}
            >
              {!loading && !isRateLimited && (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              )}
              {loading
                ? "Logging in..."
                : isRateLimited
                  ? `Try again in ${remainingSeconds}s`
                  : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
