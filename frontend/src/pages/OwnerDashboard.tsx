import { useEffect, useMemo, useState } from "react";
import ownerApi from "../api/owner";
import type { Dispute, Land, PaginatedResult, Transfer } from "../api/owner";
import { useAuthStore } from "../store/auth";

type TabKey =
  | "overview"
  | "myLand"
  | "addLand"
  | "disputes"
  | "addDispute"
  | "transfers"
  | "addToTransfer";

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "myLand", label: "My Land" },
  { key: "addLand", label: "Register Land" },
  { key: "disputes", label: "My Disputes" },
  { key: "addDispute", label: "Add Dispute" },
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
      case "addLand":
        return "Register New Land";
      case "disputes":
        return "My Disputes";
      case "addDispute":
        return "Add Dispute";
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
      {active === "addLand" && <AddLand />}
      {active === "disputes" && <MyDisputes />}
      {active === "addDispute" && <AddDispute />}
      {active === "transfers" && <MyTransfers />}
      {active === "addToTransfer" && <AddToTransfer />}
    </main>
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

  const fetchLands = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ownerApi.getMyLand();
      setLands(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch land");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

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
                {l.address && <p className="text-gray-600 text-sm">{l.address}</p>}
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
      setMessage("Land registered successfully");
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
      {loading && <p>Loading...</p>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
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
  const [form, setForm] = useState({
    parcelId: "",
    sellerCitizenId: user.citizenId,
    buyerCitizenId: "",
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
      await ownerApi.addToTransfer({
        parcelId: form.parcelId.trim(),
        sellerCitizenId: form.sellerCitizenId.trim(),
        buyerCitizenId: form.buyerCitizenId.trim(),
      });
      setMessage("Added to transfer successfully");
      setForm({ parcelId: "", sellerCitizenId: user.citizenId, buyerCitizenId: "" });
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to add to transfer");
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
          <label className="block text-sm font-medium text-gray-700">Buyer Citizen ID</label>
          <input name="buyerCitizenId" value={form.buyerCitizenId} onChange={onChange} className="mt-1 w-full rounded-md border-gray-300 focus:border-emerald-600 focus:ring-emerald-600" />
        </div>
        <div className="md:col-span-2">
          <button disabled={submitting} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{submitting ? "Submitting..." : "Add To Transfer"}</button>
        </div>
      </form>
    </Card>
  );
};

export default OwnerDashboard;


