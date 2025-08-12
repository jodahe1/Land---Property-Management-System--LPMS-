import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const RequireAuth = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default RequireAuth;


