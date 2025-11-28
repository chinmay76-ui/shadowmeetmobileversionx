import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
// NOTE: do NOT statically import profile.routes.js here (it may not exist)
import chatRoutes from "./routes/chat.route.js";
import uploadRoutes from "./routes/upload.route.js";
import { connectDB } from "./lib/db.js";
import otpRoutes from "./routes/otp.route.js";

const app = express();

// Use the PORT that the host (Render) provides. Local fallback 5001 is fine for local dev.
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Make the frontend origin configurable via env var (set FRONTEND_URL in Render)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // allow frontend to send cookies
  })
);

// Increase payload size limit to handle profile pic uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// existing mounts
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // keeps your existing user routes

// Safe: try to mount profile.routes if the file exists. This avoids startup crash if file missing.
// If routes/profile.routes.js exists and exports `default` router, it will be mounted on /api/users
try {
  const profileRoutesPath = path.join(__dirname, "routes", "profile.routes.js");
  if (fs.existsSync(profileRoutesPath)) {
    import("./routes/profile.routes.js")
      .then((mod) => {
        if (mod && mod.default) {
          app.use("/api/users", mod.default); // mounts routes defined as router.put("/me", ...)
          console.log("Mounted profile.routes.js at /api/users (provides /api/users/me).");
        } else {
          console.warn(
            "profile.routes.js found but did not export a default router (export default router)."
          );
        }
      })
      .catch((err) => {
        console.error("Failed to dynamically import profile.routes.js:", err);
      });
  } else {
    console.log(
      "profile.routes.js not found — skipping mount (create routes/profile.routes.js to enable /api/users/me)."
    );
  }
} catch (err) {
  console.error("Error checking for profile.routes.js:", err);
}

app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", otpRoutes);

if (process.env.NODE_ENV === "production") {
  // serve frontend build
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

/**
 * Start sequence:
 * 1. connect to DB
 * 2. start listening on the PORT (bind 0.0.0.0 for container hosts)
 */
async function startServer() {
  try {
    await connectDB();
    // bind to 0.0.0.0 so platforms (Render/Docker) can detect and route to the port
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT} (bound to 0.0.0.0)`);
    });
  } catch (err) {
    console.error(
      "Failed to start server (DB connection or other startup error):",
      err
    );
    process.exit(1); // crash so the platform restarts or shows the failure
  }
}

startServer();
