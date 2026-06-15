import { Routes, Route } from "react-router-dom";
import { LoginPage, SignupPage } from "../../features/auth";
import PrivateRoute from "./PrivateRoute";
import { routePaths } from "./routePaths";
import Home from "../../pages/Home";
import NotFound from "../../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={routePaths.LOGIN} element={<LoginPage />} />
      <Route path={routePaths.SIGNUP} element={<SignupPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path={routePaths.HOME} element={<Home />} />
        {/* We can add more protected pages here, like cart checkout, profile editing, etc. */}
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
