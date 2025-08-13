import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true, // since this holds the case file, you can make it optional if needed
    },
    parcelId: {
      type: String, // Using plain string for parcelId
      required: true,
    },
    landOwnerCitizenId: {
      type: String,
      required: true,
    },
    raisedByUserCitizenId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "solved", "Dropped"],
      default: "waiting",
    },
    adminApproved: {
      type: String, // This will store admin's ID
      default: null,
    },
    deleted_at: {
      type: Date, // null means it's still active
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
