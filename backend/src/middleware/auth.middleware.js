// src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protectRoute middleware (backward-compatible & safe)
 *
 * - Priority for token extraction:
 *   1) req.cookies.jwt        (keeps your existing behavior)
 *   2) Authorization: Bearer <token>
 *   3) req.cookies.token
 *   4) x-access-token header
 *
 * - Accepts either process.env.JWT_SECRET_KEY or process.env.JWT_SECRET
 * - Accepts common JWT id claims: userId, id, _id, sub
 * - Attaches full user document (without password) to req.user (keeps existing downstream behavior)
 */
export const protectRoute = async (req, res, next) => {
  try {
    // 1) extract token from several common places
    const cookieJwt = req.cookies?.jwt;
    const cookieToken = req.cookies?.token;
    const authHeader = (req.headers?.authorization || "").trim();
    const headerToken = req.headers["x-access-token"] || req.headers["X-Access-Token"];

    let token = null;

    if (cookieJwt) {
      token = cookieJwt;
    } else if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    } else if (headerToken) {
      token = headerToken;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // 2) determine secret (support both env var names)
    const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
    if (!secret) {
      console.error("protectRoute: missing JWT secret env var (JWT_SECRET_KEY or JWT_SECRET)");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // 3) verify token safely
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      // invalid / expired token
      return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }

    // 4) accept several possible id claim names
    const userId = decoded?.userId || decoded?.id || decoded?._id || decoded?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token payload" });
    }

    // 5) fetch user and attach to req.user (exclude password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user; // keep same behavior as before (full user doc)
    next();
  } catch (error) {
    console.error("protectRoute error:", error);
    // Do not leak internal details to client
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
