import api from "./axios";
import type { PaginatedResult, Transfer, Dispute } from "./owner";

export const adminApi = {
  getMe: () => api.get("/admin/me"),

  approveLand: (payload: { parcelId: string }) =>
    api.post("/admin/approveLand", payload),

  pendingLands: () => api.get<Array<{
    _id: string;
    parcelId: string;
    sizeSqm: number;
    usageType: "business" | "farming" | "residential";
    location?: { address?: string; gps?: { latitude?: number; longitude?: number } };
    ownerId: { _id: string; name?: string; email?: string; citizenId?: string; role?: string };
    createdAt?: string;
  }>>("/admin/pendingLands"),

  seeLands: (status?: "waitingToBeApproved" | "forSell" | "active" | "onDispute") =>
    api.get<Array<{
      _id: string;
      parcelId: string;
      sizeSqm: number;
      usageType: "business" | "farming" | "residential";
      location?: { address?: string; gps?: { latitude?: number; longitude?: number } };
      ownerId: { _id: string; name?: string; email?: string; phoneNumber?: string; citizenId?: string; role?: string };
      createdAt?: string;
    }>>(`/admin/seeLands${status ? `?status=${status}` : ""}`),

  reviewAndApproveLand: (payload: {
    originalParcelId: string;
    parcelId?: string;
    sizeSqm?: number;
    usageType?: "business" | "farming" | "residential";
    address?: string;
    latitude?: number;
    longitude?: number;
    owner?: { name?: string; email?: string; citizenId?: string };
  }) => api.post("/admin/reviewAndApproveLand", payload),

  approvetransfer: (payload: { transferId: string }) =>
    api.post("/admin/approvetransfer", payload),

  fixDisputes: (payload: { disputeId: string }) =>
    api.post("/admin/fixDisputes", payload),

  seeTransfers: (page = 1, limit = 10) =>
    api.get<PaginatedResult<Transfer>>(
      `/admin/seeTransfers?page=${page}&limit=${limit}`
    ),

  seeDisputes: (
    page = 1,
    limit = 10,
    rank: "newest" | "oldest" | "recent" = "newest"
  ) =>
    api.get<PaginatedResult<Dispute>>(
      `/admin/seeDisputes?page=${page}&limit=${limit}&rank=${rank}`
    ),
};

export default adminApi;


