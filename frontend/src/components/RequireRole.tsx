import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import type { UserRole } from "../store/auth";

type RequireRoleProps = {
  allowed: UserRole[];
};

const RequireRole = ({ allowed }: RequireRoleProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!allowed.includes(user.role)) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
};

export default RequireRole;


