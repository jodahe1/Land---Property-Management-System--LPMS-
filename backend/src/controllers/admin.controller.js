import User from "../models/user.model.js";
import { Land } from "../models/land.model.js";
import Dispute from "../models/dispute.model.js";
import Transfer from "../models/transfer.model.js";

export const getMe = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching admin profile" });
  }
};

// Approve a land that is waiting for approval
// body: { parcelId: string }
export const approveLand = async (req, res) => {
  try {
    const { parcelId } = req.body;
    if (!parcelId) {
      return res.status(400).json({ message: "parcelId is required" });
    }

    const land = await Land.findOne({ parcelId });
    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    land.status = "active";
    land.approvedBy = req.user._id;

    // Ensure ownership history has an open entry for current owner
    if (!Array.isArray(land.ownershipHistory) || land.ownershipHistory.length === 0) {
      land.ownershipHistory = [
        { ownerId: land.ownerId, fromDate: new Date(), toDate: null },
      ];
    }

    await land.save();
    return res.status(200).json({ message: "Land approved", land });
  } catch (error) {
    return res.status(500).json({ message: "Error approving land" });
  }
};

// Approve a transfer: mark adminApproved, mark transfer as sold, move land ownership to buyer
// body: { transferId: string }
export const approvetransfer = async (req, res) => {
  try {
    const { transferId } = req.body;
    if (!transferId) {
      return res.status(400).json({ message: "transferId is required" });
    }

    const transfer = await Transfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    if (transfer.status !== "active") {
      return res
        .status(400)
        .json({ message: "Only active transfers can be approved" });
    }

    // Find land by parcel
    const land = await Land.findOne({ parcelId: transfer.parcelId });
    if (!land) {
      return res.status(404).json({ message: "Land not found for parcel" });
    }

    // Lookup buyer user by citizenId
    const buyer = await User.findOne({ citizenId: transfer.buyerCitizenId });
    if (!buyer) {
      return res.status(404).json({ message: "Buyer user not found" });
    }

    // Close previous ownership entry
    if (Array.isArray(land.ownershipHistory) && land.ownershipHistory.length > 0) {
      const last = land.ownershipHistory[land.ownershipHistory.length - 1];
      if (!last.toDate) last.toDate = new Date();
    }

    // Move ownership
    land.ownerId = buyer._id;
    land.status = "active";
    land.approvedBy = req.user._id;
    land.ownershipHistory = [
      ...(land.ownershipHistory || []),
      { ownerId: buyer._id, fromDate: new Date(), toDate: null },
    ];

    transfer.status = "sold";
    transfer.adminApproved = String(req.user._id);

    await Promise.all([land.save(), transfer.save()]);

    return res.status(200).json({ message: "Transfer approved", transfer, land });
  } catch (error) {
    return res.status(500).json({ message: "Error approving transfer" });
  }
};

// Solve a dispute
// body: { disputeId: string }
export const fixDisputes = async (req, res) => {
  try {
    const { disputeId } = req.body;
    if (!disputeId) {
      return res.status(400).json({ message: "disputeId is required" });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    dispute.status = "solved";
    dispute.adminApproved = String(req.user._id);
    await dispute.save();

    return res.status(200).json({ message: "Dispute resolved", dispute });
  } catch (error) {
    return res.status(500).json({ message: "Error resolving dispute" });
  }
};

// Paginated transfers
export const seeTransfers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transfer.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Transfer.countDocuments({}),
    ]);

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching transfers" });
  }
};

// Paginated disputes
export const seeDisputes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { deleted_at: null };
    const [items, total] = await Promise.all([
      Dispute.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Dispute.countDocuments(filter),
    ]);

    return res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching disputes" });
  }
};

export default {
  getMe,
  approveLand,
  approvetransfer,
  fixDisputes,
  seeTransfers,
  seeDisputes,
};


