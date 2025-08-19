import User from "../models/user.model.js";
import { Land } from "../models/land.model.js";
import Dispute from "../models/dispute.model.js";
import Transfer from "../models/transfer.model.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
};

export const getMyLand = async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedStatuses = [
      "waitingToBeApproved",
      "forSell",
      "active",
      "onDispute",
    ];
    const status = req.query.status && allowedStatuses.includes(req.query.status)
      ? req.query.status
      : "active";

    // Find lands owned by the current user filtered by status (default: active)
    const lands = await Land.find({ ownerId: userId, status });

    if (!lands || lands.length === 0) {
      return res.status(404).json({
        message: "This user doesn't have any land.",
      });
    }

    return res.status(200).json(lands);
  } catch (error) {
    console.error("Error getting land:", error);
    return res.status(500).json({
      message: "Server Error at getting land",
    });
  }
};

// See lands for owner: list all their lands, optional status filter, include owner ref (useful for phone)
export const seeLands = async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedStatuses = [
      "waitingToBeApproved",
      "forSell",
      "active",
      "onDispute",
    ];
    const status = req.query.status;
    const filter = { ownerId: userId };
    if (allowedStatuses.includes(status)) {
      filter.status = status;
    }

    const lands = await Land.find(filter)
      .populate("ownerId", "name email citizenId phoneNumber role")
      .sort({ createdAt: -1 });

    return res.status(200).json(lands);
  } catch (error) {
    console.error("Error seeing lands:", error);
    return res.status(500).json({ message: "Server Error at seeing lands" });
  }
};

export const addLand = async (req, res) => {
  try {
    const userId = req.user._id;
    const { parcelId, sizeSqm, usageType, address, latitude, longitude } =
      req.body;

    if (!parcelId || !sizeSqm || !usageType) {
      return res
        .status(400)
        .json({ message: "parcelId, sizeSqm, and usageType are required" });
    }

    const allowedTypes = ["business", "farming", "residential"];
    if (!allowedTypes.includes(usageType)) {
      return res.status(400).json({
        message: `usageType must be one of: ${allowedTypes.join(", ")}`,
      });
    }

    const existingLand = await Land.findOne({ parcelId });
    if (existingLand) {
      return res
        .status(400)
        .json({ message: "Land by this Parcel ID already exists" });
    }

    const newLand = new Land({
      parcelId,
      ownerId: userId,
      sizeSqm,
      usageType,
      location: {
        address: address || undefined,
        gps: {
          latitude: typeof latitude === "number" ? latitude : undefined,
          longitude: typeof longitude === "number" ? longitude : undefined,
        },
      },
      // status will default to waitingToBeApproved
    });

    const land = await newLand.save();

    return res.status(201).json(land);
  } catch (error) {
    console.error("Error Adding land:", error);
    return res.status(500).json({ message: "Server Error at Adding land" });
  }
};

export const addDispute = async (req, res) => {
  try {
    const { fileUrl, parcelId, landOwnerCitizenId, raisedByUserCitizenId } =
      req.body;

    // Basic validation
    if (
      !fileUrl ||
      !parcelId ||
      !landOwnerCitizenId ||
      !raisedByUserCitizenId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (typeof parcelId !== "string" || parcelId.trim().length === 0) {
      return res.status(400).json({ message: "Invalid parcelId" });
    }

    if (
      typeof landOwnerCitizenId !== "string" ||
      landOwnerCitizenId.trim().length === 0
    ) {
      return res.status(400).json({ message: "Invalid landOwnerCitizenId" });
    }

    if (
      typeof raisedByUserCitizenId !== "string" ||
      raisedByUserCitizenId.trim().length === 0
    ) {
      return res.status(400).json({ message: "Invalid raisedByUserCitizenId" });
    }

    const land = await Land.findOne({ parcelId });
    if (!land) {
      return res.status(404).json({ message: "There is no land with this Parcel ID" });
    }
    // Create new dispute
    const newDispute = new Dispute({
      fileUrl: fileUrl.trim(),
      parcelId: parcelId.trim(),
      landOwnerCitizenId: landOwnerCitizenId.trim(),
      raisedByUserCitizenId: raisedByUserCitizenId.trim(),
    });

    const dispute = await newDispute.save();

    // Mark land as onDispute
    land.status = "onDispute";
    await land.save();

    res.status(201).json({ message: "Dispute added successfully", dispute });
  } catch (error) {
    console.error("Error Adding Dispute:", error);
    res.status(500).json({ message: "Error Adding Dispute" });
  }
};
export const removeDispute = async (req, res) => {
  try {
    const disputeId = req.params.id;

    // Find the dispute
    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    // Update status and soft delete
    dispute.status = "Dropped";
    dispute.deleted_at = new Date();

    await dispute.save();

    // Restore land status to active when dispute is removed
    if (dispute.parcelId) {
      const land = await Land.findOne({ parcelId: dispute.parcelId });
      if (land && land.status === "onDispute") {
        land.status = "active";
        await land.save();
      }
    }

    res.status(200).json({
      message: "Dispute dropped successfully",
      dispute,
    });
  } catch (error) {
    console.error("Error Removing Dispute:", error);
    res.status(500).json({ message: "Error Removing Dispute" });
  }
};

export const MyDispute = async (req, res) => {
  try {
    const citizenId = req.user?.citizenId;

    if (!citizenId) {
      return res
        .status(400)
        .json({ message: "Citizen ID not found in user data" });
    }

    // Get pagination params (default: page 1, 10 per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for disputes belonging to the user and not soft-deleted
    const filter = {
      $and: [
        { $or: [ { deleted_at: null }, { deleted_at: { $exists: false } } ] },
        { $or: [
            { landOwnerCitizenId: citizenId },
            { raisedByUserCitizenId: citizenId },
          ]
        }
      ]
    };

    const disputes = await Dispute.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Dispute.countDocuments(filter);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items: disputes,
    });
  } catch (error) {
    console.error("Error Displaying Dispute:", error);
    res.status(500).json({ message: "Error Displaying Dispute" });
  }
};

export const addToTransfer = async (req, res) => {
  try {
    const { parcelId, sellerCitizenId, buyerCitizenId } = req.body;

    const isParcelThere = await Land.findOne({ parcelId });
    if (!isParcelThere) {
      return res
        .status(404)
        .json({ message: "No land found with this Parcel ID" });
    }

    // Block adding transfer if land is on dispute
    if (isParcelThere.status === "onDispute") {
      return res.status(400).json({ message: "Cannot add a land on dispute to transfer" });
    }

    // Record previous status and set land to forSell
    const previousStatus = isParcelThere.status;
    isParcelThere.status = "forSell";
    await isParcelThere.save();

    const newTransfer = new Transfer({
      parcelId,
      sellerCitizenId,
      buyerCitizenId,
      previousLandStatus: previousStatus,
    });

    const transfer = await newTransfer.save();

    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error Adding Land To Transfer:", error);
    res.status(500).json({ message: "Error Adding Land To Transfer" });
  }
};

export const cancelTransfer = async (req, res) => {
  try {
    const citizenId = req.user?.citizenId;
    const { transferId } = req.params;

    if (!citizenId) {
      return res
        .status(400)
        .json({ message: "Citizen ID not found in user data" });
    }

    const transfer = await Transfer.findOne({
      _id: transferId,
      sellerCitizenId: citizenId,
      status: "active",
      adminApproved: { $exists: false },
    });

    if (!transfer) {
      return res
        .status(404)
        .json({ message: "Transfer not found or cannot be canceled" });
    }

    transfer.status = "canceled";
    await transfer.save();

    // Restore land status to what it was before transfer
    const land = await Land.findOne({ parcelId: transfer.parcelId });
    if (land) {
      const restoreStatus = transfer.previousLandStatus || "active";
      land.status = restoreStatus;
      await land.save();
    }

    res.status(200).json({ message: "Transfer canceled successfully" });
  } catch (error) {
    console.error("Error canceling transfer:", error);
    res.status(500).json({ message: "Error canceling transfer" });
  }
};

export const myTransfer = async (req, res) => {
  try {
    const citizenId = req.user?.citizenId;

    if (!citizenId) {
      return res
        .status(400)
        .json({ message: "Citizen ID not found in user data" });
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ sellerCitizenId: citizenId }, { buyerCitizenId: citizenId }],
    };

    const transfers = await Transfer.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Transfer.countDocuments(filter);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items: transfers,
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({ message: "Error fetching transfers" });
  }
};
