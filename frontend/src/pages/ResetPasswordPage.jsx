import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";

const ILLUSTRATION_SRC = "/i.png";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate?.() ?? (() => (window.location.href = "/login"));

  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
    if (tokenFromQuery) setToken(tokenFromQuery);
  }, [emailFromQuery, tokenFromQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!token || !email) {
      setError("Missing reset token or email. Use the link from your email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        token,
        newPassword: password,
      });

      setMessage(res.data?.message || "Password updated successfully.");

      setTimeout(() => {
        try {
          navigate("/login");
        } catch (err) {
          window.location.href = "/login";
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. The token may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 bg-base-100">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-6 lg:gap-10 items-center">
        {/* FORM CARD */}
        <div className="bg-base-100 shadow-lg rounded-xl border border-base-300 px-4 py-5 sm:px-6 sm:py-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Reset your password
          </h2>

          {error && (
            <div className="alert alert-error mb-3 text-sm sm:text-base">
              {error}
            </div>
          )}
          {message && (
            <div className="alert alert-success mb-3 text-sm sm:text-base">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text text-sm sm:text-base">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-sm sm:text-base">
                  New password
                </span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-sm sm:text-base">
                  Confirm password
                </span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary btn-sm sm:btn-md" disabled={loading}>
                {loading ? "Saving..." : "Save new password"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-xs sm:text-sm opacity-70">
            <p>
              Already remembered your password?{" "}
              <a
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* ILLUSTRATION (desktop only) */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="max-w-sm text-center">
            <img
              src={ILLUSTRATION_SRC}
              alt="Reset illustration"
              className="w-full h-auto rounded-lg shadow"
            />
            <h3 className="text-lg font-medium mt-4">
              Securely reset your account
            </h3>
            <p className="text-sm opacity-70 mt-2">
              Use a strong password and don&apos;t share it with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
