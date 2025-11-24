// src/controllers/auth.controller.js
import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import PasswordReset from "../models/PasswordReset.js"; // new model (create file as shown below)
import { transporter } from "../utils/sendEmail.js"; // you already have a transporter

// -------------------------------
// Existing functions — unchanged
// -------------------------------
export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, // prevent XSS attacks,
      sameSite: "strict", // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location, gender } = req.body;

    // gender is required for onboarding in this update
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location || !gender) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
          !gender && "gender",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        gender,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// -----------------------------------------------------------
// Forgot / Reset password additions (safe, appended, no change to above logic)
// -----------------------------------------------------------

/**
 * POST /api/auth/forgot-password
 * Public: Accepts { email } and sends reset email with one-time token link.
 * Response is neutral (so attacker can't enumerate valid emails).
 */
export async function sendForgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalized = String(email).trim().toLowerCase();

    // Generate a secure token (plain for email), and a hash to store
    const token = crypto.randomBytes(32).toString("hex"); // 64 chars
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + (process.env.PW_RESET_EXP_MS ? Number(process.env.PW_RESET_EXP_MS) : 60 * 60 * 1000)); // default 1 hour

    // Remove any existing tokens for the email then create new
    await PasswordReset.deleteMany({ email: normalized });
    await PasswordReset.create({ email: normalized, tokenHash, expiresAt });

    // Compose reset link for client
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalized)}`;

    // Send email (use your existing transporter)
    await transporter.sendMail({
      to: normalized,
      subject: "ShadowMeet — Password reset instructions",
      html: `
        <div style="font-family: sans-serif; line-height: 1.4;">
          <h3>Reset your ShadowMeet password</h3>
          <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    // Neutral response to avoid revealing whether the email exists
    return res.json({ message: "If that email is registered, you will receive reset instructions." });
  } catch (err) {
    console.error("sendForgotPassword error:", err);
    return res.status(500).json({ message: "Failed to send reset instructions" });
  }
}

/**
 * POST /api/auth/reset-password
 * Public: Accepts { email, token, newPassword } and if valid, updates user's password.
 */
export async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "email, token and newPassword are required" });
    }

    const normalized = String(email).trim().toLowerCase();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find matching token record
    const resetDoc = await PasswordReset.findOne({ email: normalized, tokenHash });
    if (!resetDoc) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Check expiry
    if (new Date(resetDoc.expiresAt) < new Date()) {
      // cleanup expired token
      await PasswordReset.deleteMany({ email: normalized });
      return res.status(400).json({ message: "Reset token has expired. Request a new one." });
    }

    // Find user and update password using save() so pre-save hooks (hashing) run
    const user = await User.findOne({ email: normalized });
    if (!user) {
      // cleanup tokens and respond
      await PasswordReset.deleteMany({ email: normalized });
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save(); // IMPORTANT: triggers password hashing in User model pre-save hook

    // delete any reset tokens for this email
    await PasswordReset.deleteMany({ email: normalized });

    return res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
}
