import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth";
import Loader from "../../shared/components/feedback/Loader";
import { routePaths } from "./routePaths";

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-container-low">
        <Loader size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={routePaths.LOGIN} replace />;
}
