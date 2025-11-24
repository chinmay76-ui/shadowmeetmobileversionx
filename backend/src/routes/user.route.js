// src/routes/user.route.js
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  getCurrentUser,
  updateUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

// return recommended users (GET /api/users/)
router.get("/", getRecommendedUsers);

// current logged in user (GET /api/users/me)
router.get("/me", getCurrentUser);

// get friends (GET /api/users/friends)
router.get("/friends", getMyFriends);


// friend-request endpoints
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

// friend requests listing
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

// update user (PUT /api/users/:id)
router.put("/:id", updateUserById);

export default router;
