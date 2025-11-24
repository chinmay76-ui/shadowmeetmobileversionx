import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js"; // now works
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/avatar", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "streamify/avatars",
    });

    fs.unlinkSync(req.file.path);

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
});

export default router;
