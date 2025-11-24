import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { transporter } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
// src/controllers/otp.controller.js
// Replace only the verifyOtpAndRegister function with this debug version temporarily.

export const verifyOtpAndRegister = async (req, res) => {
  try {
    console.log("=== VERIFY OTP REQUEST ===");
    console.log("Raw request body:", req.body);

    const { email, otp, fullName, password } = req.body;

    // basic validation
    if (!email || !otp || !fullName || !password) {
      console.log("Missing required fields:", {
        emailPresent: !!email,
        otpPresent: !!otp,
        fullNamePresent: !!fullName,
        passwordPresent: !!password,
      });
      return res.status(400).json({ message: "email, otp, fullName and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedOtp = String(otp).trim();

    console.log("Normalized values:", { normalizedEmail, normalizedOtp });

    // find all OTP docs for this email (use find to help debugging)
    const otpDocs = await Otp.find({ email: normalizedEmail }).sort({ createdAt: -1 }).lean();
    console.log("Found OTP docs for email:", otpDocs);

    // find matching OTP among them (helps if there are multiple)
    const otpDoc = otpDocs.find((d) => String(d.otp) === normalizedOtp);
    if (!otpDoc) {
      console.log("OTP not found or mismatch. Provided:", normalizedOtp, "Existing OTPs:", otpDocs.map(d => d.otp));
      const anyOtpForEmail = otpDocs.length > 0;
      if (!anyOtpForEmail) {
        return res.status(400).json({ message: "No OTP request found for this email (may be expired). Please request a new OTP." });
      } else {
        return res.status(400).json({ message: "Invalid OTP. Please check the code and try again." });
      }
    }

    // existing user check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log("Registration attempt for already-registered email:", normalizedEmail);
      return res.status(400).json({ message: "Email already registered. Please login or use a different email." });
    }

    // create user
    const newUser = await User.create({
      email: normalizedEmail,
      fullName,
      password,
    });

    // cleanup OTP docs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("User created via OTP verify:", newUser._id.toString());
    return res.status(201).json({ message: "Registration complete", token, user: newUser });
  } catch (err) {
    console.error("verifyOtpAndRegister error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};
