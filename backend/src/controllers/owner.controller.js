import { Land } from "../models/land.model.js";
import { Dispute } from "../models/dispute.model.js";
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

export const addToTransfer = async (req, res) => {
  try {

    const user=req.user;
    
  } catch (error) {
    console.error("Error Adding Land To Transfer:", error);
    res.status(500).json({ message: "Error Adding Land To Transfer" });
  }
};

export const cancelTransfer = async (req, res) => {
  console.log("first");
};
