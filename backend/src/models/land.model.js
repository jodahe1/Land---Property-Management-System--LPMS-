import mongoose from "mongoose";

const landSchema = new mongoose.Schema(
  {
    parcelId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      address: {
        type: String,
        trim: true,
      },
      gps: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },

    sizeSqm: {
      type: Number,
      required: true,
    },

    usageType: {
      type: String,
      enum: ["business", "farming", "residential"],
      required: true,
    },

    ownershipHistory: [
      {
        ownerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        fromDate: { type: Date },
        toDate: { type: Date },
      },
    ],

    status: {
      type: String,
      enum: ["waitingToBeApproved", "forSell", "active", "onDispute"],
      default: "waitingToBeApproved",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who approved it
    },
  },
  { timestamps: true }
);

export const Land = mongoose.model("Land", landSchema);
