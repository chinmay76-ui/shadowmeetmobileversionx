// src/lib/api.js  (updated)
//
// Note: this file expects an `axiosInstance` exported from ./axios
// (which should already have baseURL set to your backend).
//
// I also include a local test image path (one of your uploaded files) that
// you can use as a fallback in the UI if needed:
// Local path: /mnt/data/0256f8e0-8635-4e6a-b078-88aa611c5420.png
// src/lib/api.js  (updated)

// Local test image path (for optional UI fallback)
// Local path: /mnt/data/0256f8e0-8635-4e6a-b078-88aa611c5420.png
export const TEST_IMAGE_LOCAL_PATH =
  "/mnt/data/0256f8e0-8635-4e6a-b078-88aa611c5420.png";

import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

// IMPORTANT for Stream: backend must sign token with req.user._id
export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  if (!response.data?.token) {
    console.warn("getStreamToken: response has no token field", response.data);
  }
  return response.data; // { token: "..." }
}

/**
 * Upload avatar image file to backend which will forward to Cloudinary.
 * Accepts a File object.
 * Returns whatever the backend returns (expected: { url: 'https://...' }).
 */
export const uploadAvatar = async (file) => {
  if (!file) throw new Error("No file provided to uploadAvatar");

  const formData = new FormData();
  formData.append("image", file);

  const res = await axiosInstance.post("/upload/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

/* ----------------------------
   NEW: OTP Signup helpers
   ---------------------------- */

export const sendOtp = async (email) => {
  if (!email) throw new Error("Email is required for sendOtp");
  const response = await axiosInstance.post("/send-otp", { email });
  return response.data;
};

/**
 * verifyOtpRegister
 * @param {Object} payload - { email, otp, fullName, password }
 * Returns backend response which should include { token, user } on success.
 */
export const verifyOtpRegister = async (payload) => {
  const { email, otp, fullName, password } = payload || {};
  if (!email || !otp || !fullName || !password) {
    throw new Error("email, otp, fullName and password are required");
  }

  const response = await axiosInstance.post("/verify-otp-register", {
    email,
    otp,
    fullName,
    password,
  });
  return response.data;
};
