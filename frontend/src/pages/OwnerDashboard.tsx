import { useEffect, useMemo, useState } from "react";
import ownerApi from "../api/owner";
import type { Dispute, Land, PaginatedResult, Transfer } from "../api/owner";
import { useAuthStore } from "../store/auth";

type TabKey =
  | "overview"
  | "myLand"
  | "pendingReview"
  | "seeLands"
  | "addDisputeFromLand"
  | "addLand"
  | "disputes"
  | "addDispute"
  | "transfers"
  | "addToTransfer";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "myLand", label: "My Land" },
  { key: "pendingReview", label: "Pending Review" },
  { key: "seeLands", label: "See Lands" },
  { key: "addDisputeFromLand", label: "Dispute a Land" },
  { key: "addLand", label: "Register Land" },
  { key: "disputes", label: "My Disputes" },
  { key: "transfers", label: "My Transfers" },
  { key: "addToTransfer", label: "Add To Transfer" },
];

const OwnerDashboard = () => {
  const user = useAuthStore((s) => s.user)!;
  const [active, setActive] = useState<TabKey>("overview");

  const isOwner = user?.role === "owner";

  const header = useMemo(() => {
    switch (active) {
      case "myLand":
        return "My Land";
      case "pendingReview":
        return "Pending Approval";
      case "seeLands":
        return "See Lands";
      case "addDisputeFromLand":
        return "Dispute a Land";
      case "addLand":
        return "Register New Land";
      case "disputes":
        return "My Disputes";
      case "transfers":
        return "My Transfers";
      case "addToTransfer":
        return "Add Land To Transfer";
      default:
        return "Owner Dashboard";
    }
  }, [active]);

  useEffect(() => {
    if (!isOwner) {
      setActive("overview");
    }
  }, [isOwner]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{header}</h1>
          <p className="text-gray-600">Welcome, {user?.name}. Citizen ID: {user?.citizenId}</p>
        </div>
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
      {active === "myLand" && <MyLand />}
      {active === "pendingReview" && <PendingReview />}
      {active === "seeLands" && <SeeLands />}
      {active === "addDisputeFromLand" && <AddDisputeFromLand />}
      {active === "addLand" && <AddLand />}
      {active === "disputes" && <MyDisputes />}
      {active === "transfers" && <MyTransfers />}
      {active === "addToTransfer" && <AddToTransfer />}
    </main>
  );
};

const SeeLands = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Land["status"] | "all">("all");

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.seeLands(status === "all" ? undefined : status);
      setLands(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [status]);

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
        <button onClick={fetchLands} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {!loading && !error && lands.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Lands Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                {status === "all" 
                  ? "You don't have any lands registered yet. Register your first land to get started."
                  : `No lands found with status "${status}". Try changing the filter or register a new land.`
                }
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.hash = '#addLand'}
                  className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Register New Land
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {lands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lands.map((l) => (
            <Card key={l._id}>
              <h4 className="text-md font-semibold text-gray-900">Parcel {l.parcelId}</h4>
              <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
              {l.location?.address && <p className="text-gray-600 text-sm">{l.location.address}</p>}
              <p className="text-gray-600 text-sm">Owner: {typeof l.ownerId === "string" ? "-" : (l.ownerId?.name || "-")}</p>
              <p className="text-gray-600 text-sm">Owner Citizen ID: {typeof l.ownerId === "string" ? "-" : (l.ownerId?.citizenId || "-")}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">{children}</div>
);

const Overview = () => {
  const user = useAuthStore((s) => s.user)!;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900">Role</h3>
        <p className="text-gray-700">{user.role}</p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
        <p className="text-gray-700">{user.name} • {user.email}</p>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-gray-900">Quick Tips</h3>
        <p className="text-gray-700">Use the tabs above to manage land, disputes, and transfers.</p>
      </Card>
    </div>
  );
};

const MyLand = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noLands, setNoLands] = useState(false);

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    setNoLands(false);
    try {
      const { data } = await ownerApi.seeLands();
      const filtered = (data || []).filter(
        (l) => l.status === "active" || l.status === "onDispute"
      );
      setLands(filtered);
      setNoLands(filtered.length === 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch land");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  if (noLands) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Active or Disputed Lands Found</h3>
            <p className="mt-2 text-sm text-gray-600">
              You don't have any active or disputed lands yet. Register your first land to get started.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.hash = '#addLand'}
                className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Register Your First Land
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={fetchLands}
        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
      >
        Refresh
      </button>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lands.map((l) => (
          <Card key={l._id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Parcel {l.parcelId}</h3>
                <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
                {l.location?.address && <p className="text-gray-600 text-sm">{l.location.address}</p>}
                {l.status === "onDispute" && (
                  <p className="text-red-600 text-sm font-medium mt-1">On Dispute</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PendingReview = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noLands, setNoLands] = useState(false);

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    setNoLands(false);
    try {
      const { data } = await ownerApi.getMyLand("waitingToBeApproved");
      setLands(data);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setNoLands(true);
      } else {
        setError(e?.response?.data?.message || "Failed to fetch land");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  if (noLands) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Pending Lands</h3>
            <p className="mt-2 text-sm text-gray-600">
              You don't have any lands waiting for approval. All your lands are either active or have other statuses.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.location.hash = '#addLand'}
                className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Register New Land
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={fetchLands}
        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
      >
        Refresh
      </button>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lands.map((l) => (
          <Card key={l._id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Parcel {l.parcelId}</h3>
                <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
                <p className="text-gray-600 text-sm">Status: {l.status}</p>
                {l.location?.address && <p className="text-gray-600 text-sm">{l.location.address}</p>}
              </div>
            </div>
          </Card>
          ))}
      </div>
    </div>
  );
};

const AddLand = () => {
  const [form, setForm] = useState({
    parcelId: "",
    sizeSqm: "",
    usageType: "residential" as Land["usageType"],
    address: "",
    latitude: "",
    longitude: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await ownerApi.addLand({
        parcelId: form.parcelId.trim(),
        sizeSqm: Number(form.sizeSqm),
        usageType: form.usageType,
        address: form.address || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      setMessage("Submitted for review. You can track it in Pending Approval.");
      setForm({ parcelId: "", sizeSqm: "", usageType: "residential", address: "", latitude: "", longitude: "" });
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to register land");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {message && (
          <div
            className={`md:col-span-2 rounded-md border p-3 text-sm ${
              message.toLowerCase().includes("success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Parcel ID</label>
          <input name="parcelId" value={form.parcelId} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Size (sqm)</label>
          <input name="sizeSqm" value={form.sizeSqm} onChange={onChange} type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Usage Type</label>
          <select name="usageType" value={form.usageType} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600">
            <option value="residential">Residential</option>
            <option value="business">Business</option>
            <option value="farming">Farming</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input name="address" value={form.address} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input name="latitude" value={form.latitude} onChange={onChange} type="number" step="any" className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input name="longitude" value={form.longitude} onChange={onChange} type="number" step="any" className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div className="md:col-span-2">
          <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Submitting..." : "Register Land"}</button>
        </div>
      </form>
    </Card>
  );
};

const MyDisputes = () => {
  const [data, setData] = useState<PaginatedResult<Dispute> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.myDisputes(p, 10);
      setData(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => fetchData(page)}
          className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {!loading && !error && (!data || data.items.length === 0) && (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Disputes Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                You don't have any disputes yet.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((d) => (
          <Card key={d._id}>
            <h3 className="text-lg font-semibold text-gray-900">Parcel {d.parcelId}</h3>
            <p className="text-gray-700">File: <a className="text-emerald-700 underline" href={d.fileUrl} target="_blank" rel="noreferrer">View</a></p>
            <p className="text-gray-600 text-sm">Owner: {d.landOwnerCitizenId}</p>
            <p className="text-gray-600 text-sm">Raised By: {d.raisedByUserCitizenId}</p>
            <div className="mt-3">
              <button
                onClick={async () => {
                  try {
                    await ownerApi.removeDispute(d._id);
                    fetchData(page);
                  } catch {}
                }}
                className="px-3 py-2 rounded-md border border-red-600 text-red-700 hover:bg-red-50"
              >
                Drop Dispute
              </button>
            </div>
          </Card>
        ))}
      </div>
      {data && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => { setPage((p) => p - 1); fetchData(page - 1); }} className="px-3 py-2 rounded-md border">Prev</button>
          <span className="text-sm text-gray-600">Page {data.currentPage} of {data.totalPages}</span>
          <button disabled={data.currentPage >= data.totalPages} onClick={() => { setPage((p) => p + 1); fetchData(page + 1); }} className="px-3 py-2 rounded-md border">Next</button>
        </div>
      )}
    </div>
  );
};

const AddDispute = () => {
  const user = useAuthStore((s) => s.user)!;
  const [form, setForm] = useState({
    fileUrl: "",
    parcelId: "",
    landOwnerCitizenId: user.citizenId,
    raisedByUserCitizenId: user.citizenId,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await ownerApi.addDispute({
        fileUrl: form.fileUrl.trim(),
        parcelId: form.parcelId.trim(),
        landOwnerCitizenId: form.landOwnerCitizenId.trim(),
        raisedByUserCitizenId: form.raisedByUserCitizenId.trim(),
      });
      setMessage("Dispute submitted successfully");
      setForm({ fileUrl: "", parcelId: "", landOwnerCitizenId: user.citizenId, raisedByUserCitizenId: user.citizenId });
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {message && (
          <div
            className={`md:col-span-2 rounded-md border p-3 text-sm ${
              message.toLowerCase().includes("success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Evidence File URL</label>
          <input name="fileUrl" value={form.fileUrl} onChange={onChange} placeholder="https://..." className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Parcel ID</label>
          <input name="parcelId" value={form.parcelId} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner Citizen ID</label>
          <input name="landOwnerCitizenId" value={form.landOwnerCitizenId} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div className="md:col-span-2">
          <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Submitting..." : "Submit Dispute"}</button>
        </div>
      </form>
    </Card>
  );
};

const AddDisputeFromLand = () => {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user)!;
  const [selected, setSelected] = useState<Land | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<Land["status"] | "all">("active");

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.seeLands(status === "all" ? undefined : status);
      setLands(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch lands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [status]);

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md border p-3 text-sm ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      {!selected ? (
        <>
          <div className="flex items-center gap-3">
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="waitingToBeApproved">Waiting</option>
              <option value="forSell">For Sell</option>
              <option value="onDispute">On Dispute</option>
            </select>
            <button onClick={fetchLands} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          </div>
          {loading && <p>Loading...</p>}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.map((l) => (
              <button key={l._id} onClick={() => l.status !== "onDispute" ? setSelected(l) : null} className="text-left">
                <Card>
                  <h4 className="text-md font-semibold text-gray-900">Parcel {l.parcelId}</h4>
                  <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
                  {l.location?.address && (
                    <p className="text-gray-600 text-sm">{l.location.address}</p>
                  )}
                  <p className="text-gray-600 text-sm">Owner: {typeof l.ownerId === "string" ? "-" : (l.ownerId?.name || "-")}</p>
                  <p className="text-gray-600 text-sm">Owner Citizen ID: {typeof l.ownerId === "string" ? "-" : (l.ownerId?.citizenId || "-")}</p>
                  {l.status === "onDispute" && (
                    <p className="text-red-600 text-sm font-medium mt-1">Already On Dispute</p>
                  )}
                </Card>
              </button>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <h4 className="text-md font-semibold text-gray-900">Dispute • Parcel {selected.parcelId}</h4>
          <div className="text-sm text-gray-700 mb-3">
            <p>Usage: {selected.usageType} • Size: {selected.sizeSqm} sqm</p>
            {selected.location?.address && <p>Address: {selected.location.address}</p>}
            <p>Owner: {typeof selected.ownerId === "string" ? "-" : (selected.ownerId?.name || "-")}</p>
            <p>Owner Citizen ID: {typeof selected.ownerId === "string" ? "-" : (selected.ownerId?.citizenId || "-")}</p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setMessage(null);
              try {
                const ownerCitizenId = typeof selected.ownerId === "string" ? "" : (selected.ownerId?.citizenId || "");
                await ownerApi.addDispute({
                  fileUrl: fileUrl.trim(),
                  parcelId: selected.parcelId,
                  landOwnerCitizenId: ownerCitizenId || user.citizenId,
                  raisedByUserCitizenId: user.citizenId,
                });
                setMessage("Dispute submitted successfully");
                setSelected(null);
                setFileUrl("");
                await fetchLands();
              } catch (e: any) {
                setMessage(e?.response?.data?.message || "Failed to submit dispute");
              } finally {
                setSubmitting(false);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Evidence File URL</label>
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

const MyTransfers = () => {
  const [data, setData] = useState<PaginatedResult<Transfer> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.myTransfers(p, 10);
      setData(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

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
            <p className="text-gray-600 text-sm">Status: {t.status || "active"}</p>
            <div className="mt-3">
              <button
                onClick={async () => {
                  try {
                    await ownerApi.cancelTransfer(t._id);
                    fetchData(page);
                  } catch {}
                }}
                className="px-3 py-2 rounded-md border border-red-600 text-red-700 hover:bg-red-50"
              >
                Cancel Transfer
              </button>
            </div>
          </Card>
        ))}
      </div>
      {data && (
        <div className="flex items-center justify-between">
          <button disabled={page <= 1} onClick={() => { setPage((p) => p - 1); fetchData(page - 1); }} className="px-3 py-2 rounded-md border">Prev</button>
          <span className="text-sm text-gray-600">Page {data.currentPage} of {data.totalPages}</span>
          <button disabled={data.currentPage >= data.totalPages} onClick={() => { setPage((p) => p + 1); fetchData(page + 1); }} className="px-3 py-2 rounded-md border">Next</button>
        </div>
      )}
    </div>
  );
};

const AddToTransfer = () => {
  const user = useAuthStore((s) => s.user)!;
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Land | null>(null);
  const [buyerId, setBuyerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchActiveLands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.getMyLand("active");
      setLands(data);
    } catch (e: any) {
      setLands([]);
      const msg = e?.response?.data?.message || "Failed to fetch land";
      // If 404 (no active lands), treat as empty state instead of error banner
      if (e?.response?.status === 404) {
        setError(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveLands();
  }, []);

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-md border p-3 text-sm ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {!selected ? (
        <>
          <div className="flex items-center justify-between">
            <button onClick={fetchActiveLands} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Refresh</button>
          </div>
          {loading && <p>Loading...</p>}
          {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
          {!loading && !error && lands.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Active Lands</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You don't have any active lands available to add to transfer.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lands.map((l) => (
              <button key={l._id} onClick={() => setSelected(l)} className="text-left">
                <Card>
                  <h4 className="text-md font-semibold text-gray-900">Parcel {l.parcelId}</h4>
                  <p className="text-gray-700">{l.usageType} • {l.sizeSqm} sqm</p>
                  {l.location?.address && (
                    <p className="text-gray-600 text-sm">{l.location.address}</p>
                  )}
                </Card>
              </button>
            ))}
          </div>
        </>
      ) : (
        <Card>
          <h4 className="text-md font-semibold text-gray-900">Add To Transfer • Parcel {selected.parcelId}</h4>
          <div className="text-sm text-gray-700 mb-3">
            <p>Usage: {selected.usageType} • Size: {selected.sizeSqm} sqm</p>
            {selected.location?.address && <p>Address: {selected.location.address}</p>}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!buyerId.trim()) return;
              if (!window.confirm(`Confirm adding parcel ${selected.parcelId} to transfer?`)) return;
              setSubmitting(true);
              setMessage(null);
              try {
                await ownerApi.addToTransfer({
                  parcelId: selected.parcelId,
                  sellerCitizenId: user.citizenId,
                  buyerCitizenId: buyerId.trim(),
                });
                setMessage("Added to transfer successfully");
                setSelected(null);
                setBuyerId("");
                await fetchActiveLands();
              } catch (e: any) {
                setMessage(e?.response?.data?.message || "Failed to add to transfer");
              } finally {
                setSubmitting(false);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Buyer Citizen ID</label>
              <input
                name="buyerId"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                disabled={submitting || !buyerId.trim()}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm & Add To Transfer"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default OwnerDashboard;


