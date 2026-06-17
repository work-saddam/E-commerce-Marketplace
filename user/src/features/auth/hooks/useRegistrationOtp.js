import { useEffect, useState } from "react";

export function useRegistrationOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!cooldownEndsAt) {
      return undefined;
    }

    const syncCooldown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((cooldownEndsAt - Date.now()) / 1000)
      );

      setRemainingSeconds(seconds);
      if (seconds === 0) {
        setCooldownEndsAt(null);
      }
    };

    syncCooldown();
    const intervalId = setInterval(syncCooldown, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownEndsAt]);

  const startCooldown = (seconds) => {
    if (!seconds || seconds <= 0) {
      return;
    }

    setCooldownEndsAt(Date.now() + seconds * 1000);
    setRemainingSeconds(seconds);
  };

  const clearCooldown = () => {
    setCooldownEndsAt(null);
    setRemainingSeconds(0);
  };

  const resetOtpState = () => {
    setOtp("");
    clearCooldown();
  };

  const sanitizeOtp = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);
  const isRateLimited = Boolean(cooldownEndsAt && remainingSeconds > 0);

  return {
    otp,
    setOtp,
    sanitizeOtp,
    error,
    setError,
    loading,
    setLoading,
    cooldownEndsAt,
    setCooldownEndsAt,
    remainingSeconds,
    isRateLimited,
    startCooldown,
    clearCooldown,
    resetOtpState,
  };
}
