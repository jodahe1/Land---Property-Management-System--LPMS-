import api from "./axios";

export type Land = {
  _id?: string;
  parcelId: string;
  ownerId?: string;
  sizeSqm: number;
  usageType: "business" | "farming" | "residential";
  location?: {
    address?: string;
    gps?: { latitude?: number; longitude?: number };
  };
  status?: "waitingToBeApproved" | "forSell" | "active" | "onDispute";
  createdAt?: string;
  updatedAt?: string;
};

export type Dispute = {
  _id: string;
  fileUrl: string;
  parcelId: string;
  landOwnerCitizenId: string;
  raisedByUserCitizenId: string;
  status?: string;
  deleted_at?: string | null;
  createdAt?: string;
};

export type PaginatedResult<T> = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  items: T[];
};

export type Transfer = {
  _id: string;
  parcelId: string;
  sellerCitizenId: string;
  buyerCitizenId: string;
  status?: string;
  adminApproved?: boolean;
  createdAt?: string;
};

export const ownerApi = {
  // Profile
  getMe: () => api.get("/owner/me"),

  // Land
  getMyLand: (status: Land["status"] = "active") => api.get<Land[]>(`/owner/myland?status=${status}`),
  seeLands: (status?: Land["status"]) =>
    api.get<Land[]>(`/owner/seeLands${status ? `?status=${status}` : ""}`),
  addLand: (payload: {
    parcelId: string;
    sizeSqm: number;
    usageType: Land["usageType"];
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post<Land>("/owner/addland", payload),

  // Disputes
  addDispute: (payload: {
    fileUrl: string;
    parcelId: string;
    landOwnerCitizenId: string;
    raisedByUserCitizenId: string;
  }) => api.post("/owner/addDispute", payload),

  myDisputes: (page = 1, limit = 10) =>
    api.get<PaginatedResult<Dispute>>(
      `/owner/MyDispute?page=${page}&limit=${limit}`
    ),

  removeDispute: (id: string) => api.put(`/owner/removeDispute/${id}`),

  // Transfers
  addToTransfer: (payload: {
    parcelId: string;
    sellerCitizenId: string;
    buyerCitizenId: string;
  }) => api.post<Transfer>("/owner/addToTransfer", payload),

  cancelTransfer: (transferId: string) =>
    api.put(`/owner/cancelTransfer/${transferId}`),

  myTransfers: (page = 1, limit = 10) =>
    api.get<PaginatedResult<Transfer>>(
      `/owner/MyTransfers?page=${page}&limit=${limit}`
    ),
};

export default ownerApi;


