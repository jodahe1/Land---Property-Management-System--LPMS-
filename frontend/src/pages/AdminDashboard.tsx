import { useEffect, useMemo, useState } from "react";
import adminApi from "../api/admin";
import type { Dispute, Land, PaginatedResult, Transfer } from "../api/owner";
import { useAuthStore } from "../store/auth";

type TabKey = "overview" | "approveLand" | "disputes" | "transfers" | "approveTransfer" | "seeLands";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "approveLand", label: "Approve Land" },
  { key: "disputes", label: "Disputes" },
  { key: "transfers", label: "Transfers" },
  { key: "approveTransfer", label: "Approve Transfer" },
  { key: "seeLands", label: "See Lands" },
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
      case "seeLands":
        return "See Lands";
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
      {active === "seeLands" && <SeeLands />}
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
  const [pending, setPending] = useState<Array<Land & { ownerId: any }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<null | (Land & { ownerId: any })>(null);
  const [form, setForm] = useState({
    parcelId: "",
    sizeSqm: "",
    usageType: "residential" as Land["usageType"],
    address: "",
    latitude: "",
    longitude: "",
    ownerName: "",
    ownerEmail: "",
    ownerCitizenId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.pendingLands();
      setPending(data as any);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load pending lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Waiting for Approval</h3>
        <button onClick={load} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pending.map((l) => (
          <Card key={l._id}>
            <h4 className="text-md font-semibold text-gray-900">Parcel {l.parcelId}</h4>
            <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
            {l.location?.address && <p className="text-gray-600 text-sm">{l.location.address}</p>}
            <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
              <p className="font-medium">Owner</p>
              <p>{l.ownerId?.name} • {l.ownerId?.email}</p>
              <p>Citizen ID: {l.ownerId?.citizenId}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={() => {
                  setEditing(l);
                  setForm({
                    parcelId: l.parcelId || "",
                    sizeSqm: String(l.sizeSqm || ""),
                    usageType: l.usageType,
                    address: l.location?.address || "",
                    latitude:
                      l.location?.gps?.latitude != null
                        ? String(l.location?.gps?.latitude)
                        : "",
                    longitude:
                      l.location?.gps?.longitude != null
                        ? String(l.location?.gps?.longitude)
                        : "",
                    ownerName: l.ownerId?.name || "",
                    ownerEmail: l.ownerId?.email || "",
                    ownerCitizenId: l.ownerId?.citizenId || "",
                  });
                }}
                className="px-3 py-2 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Review & Approve
              </button>
            </div>
          </Card>
        ))}
      </div>
      {editing && (
        <Card>
          <h4 className="text-md font-semibold text-gray-900 mb-3">Review Land • Parcel {editing.parcelId}</h4>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await adminApi.reviewAndApproveLand({
                  originalParcelId: editing.parcelId!,
                  parcelId: form.parcelId.trim() || undefined,
                  sizeSqm: form.sizeSqm ? Number(form.sizeSqm) : undefined,
                  usageType: form.usageType,
                  address: form.address || undefined,
                  latitude: form.latitude ? Number(form.latitude) : undefined,
                  longitude: form.longitude ? Number(form.longitude) : undefined,
                  owner: {
                    name: form.ownerName || undefined,
                    email: form.ownerEmail || undefined,
                    citizenId: form.ownerCitizenId || undefined,
                  },
                });
                setEditing(null);
                await load();
              } catch {}
              setSubmitting(false);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Parcel ID</label>
              <input value={form.parcelId} onChange={(e) => setForm((f) => ({ ...f, parcelId: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Size (sqm)</label>
              <input type="number" value={form.sizeSqm} onChange={(e) => setForm((f) => ({ ...f, sizeSqm: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Type</label>
              <select value={form.usageType} onChange={(e) => setForm((f) => ({ ...f, usageType: e.target.value as any }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600">
                <option value="residential">Residential</option>
                <option value="business">Business</option>
                <option value="farming">Farming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
            </div>
            <div className="md:col-span-2 mt-2">
              <p className="text-sm font-medium text-gray-900 mb-2">Owner</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Name" value={form.ownerName} onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
                <input placeholder="Email" value={form.ownerEmail} onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
                <input placeholder="Citizen ID" value={form.ownerCitizenId} onChange={(e) => setForm((f) => ({ ...f, ownerCitizenId: e.target.value }))} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Approving..." : "Approve"}</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

const Disputes = () => {
  const [data, setData] = useState<PaginatedResult<Dispute> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rank, setRank] = useState<"newest" | "oldest" | "recent">("newest");
  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.seeDisputes(p, 10, rank);
      setData(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(1); }, [rank]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={rank} onChange={(e) => setRank(e.target.value as any)} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600">
          <option value="newest">Newest</option>
          <option value="recent">Recently Updated</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
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
  const [data, setData] = useState<PaginatedResult<Transfer> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.awaitingTransfers(p, 12);
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
      {message && (
        <div className={`rounded-md border p-3 text-sm ${message.toLowerCase().includes("success") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{message}</div>
      )}
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((t) => (
          <Card key={t._id}>
            <h3 className="text-lg font-semibold text-gray-900">Parcel {t.parcelId}</h3>
            <p className="text-gray-700">Seller: {t.sellerCitizenId}</p>
            <p className="text-gray-700">Selected Buyer: {t.buyerCitizenId}</p>
            <p className="text-gray-600 text-sm">Status: {t.status}</p>
            <div className="mt-3">
              <button
                onClick={async () => {
                  try {
                    await adminApi.approvetransfer({ transferId: t._id });
                    setMessage("Transfer approved successfully");
                    load(page);
                  } catch (e: any) {
                    setMessage(e?.response?.data?.message || "Approval failed");
                  }
                }}
                className="px-3 py-2 rounded-md border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Approve
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

const SeeLands = () => {
  const [lands, setLands] = useState<Array<Land & { ownerId: any }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Land["status"] | "all">("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await adminApi.seeLands(status === "all" ? undefined : status);
      setLands(data as any);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="waitingToBeApproved">Waiting</option>
          <option value="forSell">For Sell</option>
          <option value="onDispute">On Dispute</option>
        </select>
        <button onClick={load} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lands.map((l) => (
          <Card key={l._id}>
            <h4 className="text-md font-semibold text-gray-900">Parcel {l.parcelId}</h4>
            <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
            {l.location?.address && <p className="text-gray-600 text-sm">{l.location.address}</p>}
            <p className="text-gray-600 text-sm">Owner: {l.ownerId?.name}</p>
            <p className="text-gray-600 text-sm">Owner Citizen ID: {l.ownerId?.citizenId}</p>
            <p className="text-gray-600 text-sm">Owner Phone: {l.ownerId?.phoneNumber}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;


