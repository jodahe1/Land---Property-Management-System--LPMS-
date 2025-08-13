import { Land } from "../models/land.model.js";
import { Dispute } from "../models/dispute.model.js";
import { Transfer } from "../models/transfer.model.js";
import { now } from "mongoose";
export const getMyLand = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find lands owned by the current user
    const lands = await Land.find({ ownerId: userId });

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
      address,
      latitude,
      longitude,
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

    const isParcelthere = Land.findOne(parcelId);
    if (!isParcelthere) {
      console.error("There is no Land By this id:", error);
      res.status(500).json({ message: "There is no Land By this id:" });
    }
    // Create new dispute
    const newDispute = new Dispute({
      fileUrl: fileUrl.trim(),
      parcelId: parcelId.trim(),
      landOwnerCitizenId: landOwnerCitizenId.trim(),
      raisedByUserCitizenId: raisedByUserCitizenId.trim(),
    });

    const dispute = await newDispute.save();

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
      return res.status(400).json({ message: "Citizen ID not found in user data" });
    }

    // Get pagination params (default: page 1, 10 per page)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter for disputes belonging to the user and not soft-deleted
    const filter = {
      deleted_at: null,
      $or: [
        { landOwnerCitizenId: citizenId },
        { raisedByUserCitizenId: citizenId },
      ],
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

    const newTransfer = new Transfer({
      parcelId,
      sellerCitizenId,
      buyerCitizenId,
    });

    const transfer = await newTransfer.save();

    res.status(201).json(transfer);
  } catch (error) {
    console.error("Error Adding Land To Transfer:", error);
    res.status(500).json({ message: "Error Adding Land To Transfer" });
  }
};

export const cancelTransfer = async (req, res) => {};
