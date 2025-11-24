import express from "express";
import { sendOtp, verifyOtpAndRegister } from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp-register", verifyOtpAndRegister);

export default router;
