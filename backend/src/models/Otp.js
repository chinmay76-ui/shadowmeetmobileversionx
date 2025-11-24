import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 300, default: Date.now }, // auto-delete after 5 mins
});

export default mongoose.model("Otp", otpSchema);
