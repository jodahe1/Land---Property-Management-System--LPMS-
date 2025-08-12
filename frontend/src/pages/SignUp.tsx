import { FormEvent, useState } from "react";
import { useAuthStore } from "../store/auth";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuthStore();

  const [form, setForm] = useState({
    citizenId: "",
    email: "",
    phoneNumber: "",
    name: "",
    role: "public" as const,
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const { citizenId, email, phoneNumber, name, role, password } = form;
    if (!citizenId || !email || !phoneNumber || !name || !role || !password) {
      setFormError("All fields are required");
      return;
    }
    try {
      await signup({ citizenId, email, phoneNumber, name, role, password });
      navigate("/welcome", { replace: true });
    } catch (err: any) {
      // error already set in store
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 pt-12 pb-24">
      <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
      <p className="mt-2 text-gray-600">
        Already have an account?{" "}
        <Link className="text-emerald-700 font-medium" to="/signin">
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {(formError || error) && (
          <div className="sm:col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {formError || error}
          </div>
        )}
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Citizen ID</label>
          <input
            name="citizenId"
            type="text"
            value={form.citizenId}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="e.g. 1234567890"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="you@example.com"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Phone number</label>
          <input
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="e.g. +1 555 000 1234"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="John Doe"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
          >
            <option value="public">Public</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
            placeholder="••••••••"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default SignUp;


