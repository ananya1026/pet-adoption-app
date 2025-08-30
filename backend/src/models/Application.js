// backend/src/models/Application.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    message: { type: String, trim: true },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);

export default Application;