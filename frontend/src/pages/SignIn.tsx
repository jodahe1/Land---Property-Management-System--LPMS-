import { useState } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "../store/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/welcome";

  const { login, loading, error } = useAuthStore();
  const [citizenId, setCitizenId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!citizenId || !password) {
      setFormError("Citizen ID and password are required");
      return;
    }
    try {
      await login({ citizenId, password });
      // If owner, go to owner dashboard; otherwise go to intended or welcome
      const role = useAuthStore.getState().user?.role;
      if (role === "owner") {
        navigate("/owner", { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      // error already set in store
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 pt-12 pb-24">
      <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
      <p className="mt-2 text-gray-600">
        Welcome back. Don't have an account?{" "}
        <Link className="text-emerald-700 font-medium" to="/signup">
          Sign up
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {(formError || error) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {formError || error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Citizen ID</label>
          <input
            type="text"
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="e.g. 1234567890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="••••••••"
          />
        </div>
        <button
          disabled={loading}
          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
};

export default SignIn;


