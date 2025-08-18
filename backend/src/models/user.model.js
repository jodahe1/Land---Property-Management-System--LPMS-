import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    citizenId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'owner', 'public'],
      default: 'owner'
    },
    password: {
      type: String,
      required: true
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Automatically creates createdAt & updatedAt
  }
);

const User = mongoose.model('User', userSchema);
export default User
