// Uploaded file URL (developer-provided for tooling): /mnt/data/236186b0-91af-44cc-8074-64d18d2ca881.png

import express from "express";
import { login, logout, onboard, signup, sendForgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Password reset endpoints (public)
router.post("/forgot-password", sendForgotPassword);
router.post("/reset-password", resetPassword);

// Onboarding requires authentication
router.post("/onboarding", protectRoute, onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;