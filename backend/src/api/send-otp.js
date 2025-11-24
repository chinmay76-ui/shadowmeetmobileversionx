// src/controllers/auth.controller.js
import Otp from "../models/Otp.js";
import otpGenerator from "otp-generator";
import { transporter } from "../utils/sendEmail.js";

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = otpGenerator.generate(6, { digits: true });

  await Otp.create({ email, otp });

  await transporter.sendMail({
    to: email,
    subject: "Your ShadowMeet OTP Code",
    html: `
      <h2>Your Verification Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code is valid for 5 minutes.</p>
    `,
  });

  res.json({ message: "OTP sent successfully" });
};
