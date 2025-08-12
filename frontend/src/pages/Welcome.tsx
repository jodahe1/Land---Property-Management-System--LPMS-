import { useAuthStore } from "../store/auth";

const Welcome = () => {
  const { user } = useAuthStore();
  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 pb-24">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-10 border">
        <h1 className="text-3xl font-bold text-gray-900">
          {user ? `Welcome, Mr. ${user.name}` : "Welcome"}
        </h1>
        <p className="mt-3 text-gray-700">
          You are signed in as <span className="font-medium">{user?.role}</span>.
        </p>
        <p className="mt-6 text-gray-600">
          Explore land parcels, manage ownership records, and streamline your
          workflows from a single dashboard.
        </p>
      </div>
    </main>
  );
};

export default Welcome;


