import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../store/authSlice";
import { loginRequest, registerRequest, verifyOtpRequest, logoutRequest } from "../api/authApi";
import { extractErrorMessage } from "../../../shared/services/errorHandler";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(
    async (identifier, password) => {
      setAuthLoading(true);
      setError(null);
      try {
        const responseData = await loginRequest(identifier, password);
        dispatch(addUser(responseData.data));
        return { success: true, user: responseData.data };
      } catch (err) {
        const errMsg = extractErrorMessage(err);
        setError(errMsg);
        return { success: false, error: errMsg };
      } finally {
        setAuthLoading(false);
      }
    },
    [dispatch]
  );

  const signup = useCallback(async ({ name, phone, email, password }) => {
    setAuthLoading(true);
    setError(null);
    try {
      const responseData = await registerRequest({ name, phone, email, password });
      return { success: true, message: responseData.message };
    } catch (err) {
      const errMsg = extractErrorMessage(err);
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    setAuthLoading(true);
    setError(null);
    try {
      const responseData = await verifyOtpRequest(email, otp);
      return { success: true, message: responseData.message };
    } catch (err) {
      const errMsg = extractErrorMessage(err);
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      dispatch(removeUser());
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading || authLoading,
    error,
    setError,
    login,
    signup,
    verifyOtp,
    logout,
  };
};
