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
import { buildRateLimitMessage, getRateLimitRetrySeconds } from "@/utils/authRateLimit";
import { BASE_URL } from "@/utils/constant";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Signup() {
  const [sellerName, setSellerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
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
        `${BASE_URL}/api/seller/register`,
        { sellerName, shopName, email, password, phone, gstNumber, panNumber },
        { withCredentials: true },
      );
      setCooldownEndsAt(null);
      setRemainingSeconds(0);
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
          <CardTitle>Signup to new account</CardTitle>
          <CardDescription>
            Enter your all the details below to signup
          </CardDescription>
          <CardAction>
            <Link to={"/login"}>
              <Button variant="link">Login</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sellerName">Seller Name</Label>
                <Input
                  id="sellerName"
                  type="text"
                  placeholder="Enter your name"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  type="text"
                  placeholder="Enter your shop name"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter strong password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="Enter your contact number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  type="text"
                  placeholder="Enter gst number"
                  required
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  type="text"
                  placeholder="Enter pan number"
                  required
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                />
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
              {loading ? "Sign Up..." : isRateLimited ? `Try again in ${remainingSeconds}s` : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
