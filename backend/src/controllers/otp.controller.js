// src/controllers/otp.controller.js
import Otp from "../models/Otp.js";
import otpGenerator from "otp-generator";
import { transporter } from "../utils/sendEmail.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "dev_secret";

// POST /api/send-otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // normalize email to lower-case to avoid case mismatch issues
    const normalizedEmail = String(email).trim().toLowerCase();

    // store OTP (expires configured in model via TTL index)
    await Otp.create({ email: normalizedEmail, otp });

    // send mail
    await transporter.sendMail({
      to: normalizedEmail,
      subject: "Your ShadowMeet OTP Code",
      html: `
        <div style="font-family: sans-serif; line-height: 1.4;">
          <h3>ShadowMeet verification code</h3>
          <p>Your one-time verification code is:</p>
          <p style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">${otp}</p>
          <p>This code expires in 5 minutes.</p>
        </div>
      `,
    });

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error("sendOtp error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// POST /api/verify-otp-register
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const { email, otp, fullName, password } = req.body;

    // basic validation
    if (!email || !otp || !fullName || !password) {
      return res.status(400).json({ message: "email, otp, fullName and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // find OTP doc
    const otpDoc = await Otp.findOne({ email: normalizedEmail, otp }).lean();
    if (!otpDoc) {
      // helpful debug: also check if there exists any OTP for this email to differentiate expired vs wrong OTP
      const anyOtpForEmail = await Otp.findOne({ email: normalizedEmail }).lean();
      if (!anyOtpForEmail) {
        return res.status(400).json({ message: "No OTP request found for this email (may be expired). Please request a new OTP." });
      } else {
        return res.status(400).json({ message: "Invalid OTP. Please check the code and try again." });
      }
    }

    // If user already exists, prevent duplicate registration
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please login or use a different email." });
    }

    // create user
    const newUser = await User.create({
      email: normalizedEmail,
      fullName,
      password,
      // other defaults: profilePic etc will come from User model defaults
    });

    // cleanup OTP docs for this email (so OTP can't be reused)
    await Otp.deleteMany({ email: normalizedEmail });

    // create JWT (use same env var used elsewhere)
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // respond with token + user - do NOT set cookie unless your frontend expects it
    return res.status(201).json({ message: "Registration complete", token, user: newUser });
  } catch (err) {
    console.error("verifyOtpAndRegister error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};
