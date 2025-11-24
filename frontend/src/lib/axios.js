import axios from "axios";

/**
 * Behavior:
 * - If VITE_BACKEND_URL is set (recommended), use that.
 * - Otherwise retain previous behavior: in development use http://localhost:5001/api, else /api.
 *
 * This keeps your existing flow intact while adding an easy way to override the backend URL via .env.
 */
const envUrl = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = envUrl
  ? `${envUrl.replace(/\/$/, "")}/api` // ensure no trailing slash
  : import.meta.env.MODE === "development"
  ? "http://localhost:5001/api"
  : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});
