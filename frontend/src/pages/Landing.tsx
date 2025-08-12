import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Manage land records with confidence
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-8">
              A modern Land Management System to streamline property
              registration, ownership verification, and parcel tracking.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Get started
              </Link>
              <Link
                to="/signin"
                className="inline-flex items-center px-6 py-3 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-semibold text-gray-900">99.9%</p>
                <p className="text-sm text-gray-600">Uptime</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Support</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-gray-900">Secure</p>
                <p className="text-sm text-gray-600">JWT auth</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl rotate-2" />
            <div className="relative p-8 bg-white rounded-2xl shadow-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="font-medium text-gray-900">Ownership</p>
                  <p className="text-gray-600 mt-1">Track parcels & deeds</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="font-medium text-gray-900">Registry</p>
                  <p className="text-gray-600 mt-1">Search and verify</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="font-medium text-gray-900">Workflows</p>
                  <p className="text-gray-600 mt-1">Digital approvals</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="font-medium text-gray-900">Security</p>
                  <p className="text-gray-600 mt-1">Role-based access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;


