import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-emerald-700">
          Land Management System
        </Link>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link
                to="/signin"
                className="px-4 py-2 rounded-md text-emerald-700 hover:bg-emerald-50"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;


