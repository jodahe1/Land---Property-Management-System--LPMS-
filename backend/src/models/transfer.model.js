import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    parcelId: {
      type: String,
      required: [true, "Parcel ID is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "canceled"],
      default: "active",
    },
    sellerCitizenId: {
      type: String,
      required: [true, "Seller Citizen ID is required"],
      trim: true,
    },
    buyerCitizenId: {
      type: String,
      required: [true, "Buyer Citizen ID is required"],
      trim: true,
    },
    previousLandStatus: {
      type: String,
      enum: ["waitingToBeApproved", "forSell", "active", "onDispute"],
    },
    adminApproved: {
      type: String, // This will store admin's ID
      default: null,
    },
  },
  { timestamps: true }
);

const Transfer = mongoose.model("Transfer", transferSchema);
export default Transfer;
