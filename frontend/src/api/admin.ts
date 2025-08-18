import api from "./axios";
import type { PaginatedResult, Transfer, Dispute } from "./owner";

export const adminApi = {
  getMe: () => api.get("/admin/me"),

  approveLand: (payload: { parcelId: string }) =>
    api.post("/admin/approveLand", payload),

  approvetransfer: (payload: { transferId: string }) =>
    api.post("/admin/approvetransfer", payload),

  fixDisputes: (payload: { disputeId: string }) =>
    api.post("/admin/fixDisputes", payload),

  seeTransfers: (page = 1, limit = 10) =>
    api.get<PaginatedResult<Transfer>>(
      `/admin/seeTransfers?page=${page}&limit=${limit}`
    ),

  seeDisputes: (page = 1, limit = 10) =>
    api.get<PaginatedResult<Dispute>>(
      `/admin/seeDisputes?page=${page}&limit=${limit}`
    ),
};

export default adminApi;


