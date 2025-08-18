import { useEffect, useMemo, useState } from "react";
import adminApi from "../api/admin";
import type { Dispute, PaginatedResult, Transfer } from "../api/owner";
import { useAuthStore } from "../store/auth";

type TabKey = "overview" | "approveLand" | "disputes" | "transfers" | "approveTransfer";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "approveLand", label: "Approve Land" },
  { key: "disputes", label: "Disputes" },
  { key: "transfers", label: "Transfers" },
  { key: "approveTransfer", label: "Approve Transfer" },
];

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">{children}</div>
);

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user)!;
  const [active, setActive] = useState<TabKey>("overview");

  const header = useMemo(() => {
    switch (active) {
      case "approveLand":
        return "Approve Land";
      case "disputes":
        return "Manage Disputes";
      case "transfers":
        return "Manage Transfers";
      case "approveTransfer":
        return "Approve Transfer";
      default:
        return "Admin Dashboard";
    }
  }, [active]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{header}</h1>
        <p className="text-gray-600">Welcome, {user?.name}. Role: {user?.role}</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`whitespace-nowrap rounded-t-md px-4 py-2 text-sm font-medium border-b-2 ${
                active === t.key
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {active === "overview" && <Overview />}
      {active === "approveLand" && <ApproveLand />}
      {active === "disputes" && <Disputes />}
      {active === "transfers" && <Transfers />}
      {active === "approveTransfer" && <ApproveTransfer />}
    </main>
  );
};

const Overview = () => {
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await adminApi.getMe();
        setMe(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <Card>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          <p className="text-gray-700">{me?.name} • {me?.email}</p>
          <p className="text-gray-600 text-sm">Citizen ID: {me?.citizenId}</p>
        </div>
      )}
    </Card>
  );
};

const ApproveLand = () => {
  const [parcelId, setParcelId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await adminApi.approveLand({ parcelId: parcelId.trim() });
      setMessage("Land approved successfully");
      setParcelId("");
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Card>
      {message && (
        <div
          className={`mb-4 rounded-md border p-3 text-sm ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex gap-3">
        <input value={parcelId} onChange={(e) => setParcelId(e.target.value)} placeholder="Parcel ID" className="flex-1 rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Approving..." : "Approve"}</button>
      </form>
    </Card>
  );
};

const Disputes = () => {
  const [data, setData] = useState<PaginatedResult<Dispute> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.seeDisputes(p, 10);
      setData(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(1); }, []);
  return (
    <div className="space-y-4">
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((d) => (
          <Card key={d._id}>
            <h3 className="text-lg font-semibold text-gray-900">Parcel {d.parcelId}</h3>
            <p className="text-gray-700">Owner: {d.landOwnerCitizenId}</p>
            <p className="text-gray-700">Raised By: {d.raisedByUserCitizenId}</p>
            <div className="mt-3 flex gap-2">
              <a className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50" href={d.fileUrl} target="_blank" rel="noreferrer">Open File</a>
              <button
                onClick={async () => {
                  try {
                    await adminApi.fixDisputes({ disputeId: d._id });
                    load(page);
                  } catch {}
                }}
                className="px-3 py-2 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Mark Solved
              </button>
            </div>
          </Card>
        ))}
      </div>
      {data && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => { setPage((p) => p - 1); load(page - 1); }} className="px-3 py-2 rounded-md border">Prev</button>
          <span className="text-sm text-gray-600">Page {data.currentPage} of {data.totalPages}</span>
          <button disabled={data.currentPage >= data.totalPages} onClick={() => { setPage((p) => p + 1); load(page + 1); }} className="px-3 py-2 rounded-md border">Next</button>
        </div>
      )}
    </div>
  );
};

const Transfers = () => {
  const [data, setData] = useState<PaginatedResult<Transfer> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.seeTransfers(p, 10);
      setData(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(1); }, []);
  return (
    <div className="space-y-4">
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((t) => (
          <Card key={t._id}>
            <h3 className="text-lg font-semibold text-gray-900">Parcel {t.parcelId}</h3>
            <p className="text-gray-700">Seller: {t.sellerCitizenId}</p>
            <p className="text-gray-700">Buyer: {t.buyerCitizenId}</p>
            <p className="text-gray-600 text-sm">Status: {t.status}</p>
          </Card>
        ))}
      </div>
      {data && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => { setPage((p) => p - 1); load(page - 1); }} className="px-3 py-2 rounded-md border">Prev</button>
          <span className="text-sm text-gray-600">Page {data.currentPage} of {data.totalPages}</span>
          <button disabled={data.currentPage >= data.totalPages} onClick={() => { setPage((p) => p + 1); load(page + 1); }} className="px-3 py-2 rounded-md border">Next</button>
        </div>
      )}
    </div>
  );
};

const ApproveTransfer = () => {
  const [transferId, setTransferId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await adminApi.approvetransfer({ transferId: transferId.trim() });
      setMessage("Transfer approved successfully");
      setTransferId("");
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Approval failed");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Card>
      {message && (
        <div
          className={`mb-4 rounded-md border p-3 text-sm ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex gap-3">
        <input value={transferId} onChange={(e) => setTransferId(e.target.value)} placeholder="Transfer ID" className="flex-1 rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Approving..." : "Approve"}</button>
      </form>
    </Card>
  );
};

export default AdminDashboard;


