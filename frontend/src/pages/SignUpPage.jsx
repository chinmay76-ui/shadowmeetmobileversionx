// src/pages/SignUpPage.jsx
import { useState, useRef } from "react";
import { Sparkles } from "lucide-react"; // changed icon
import { Link, useNavigate } from "react-router";

// ✅ use your central API helpers instead of raw axios
import { sendOtp as sendOtpApi, verifyOtpRegister } from "../lib/api";
import { axiosInstance } from "../lib/axios";

const TOKEN_KEY = "token"; // change if your app uses a different key or cookie flow
const RESEND_COOLDOWN = 60; // seconds

const SignUpPage = () => {
  const navigate = useNavigate?.() ?? (() => (window.location.href = "/"));
  const [step, setStep] = useState(1); // 1 = enter email, 2 = verify otp + complete
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [signupData, setSignupData] = useState({
    fullName: "",
    password: "",
  });

  // UX / loading / errors
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotInfo, setForgotInfo] = useState(null);

  // helper to start cooldown timer
  const startCooldown = (seconds = RESEND_COOLDOWN) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current);
          cooldownRef.current = null;
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // STEP A: Send OTP to email
  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setInfo(null);

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingOtp(true);
      // ✅ use API helper so it hits backend baseURL, not Vite
      await sendOtpApi(normalizedEmail);
      setInfo("OTP sent to your email. It is valid for 5 minutes.");
      startCooldown(RESEND_COOLDOWN);
      setStep(2);
      // keep the normalized email in state for subsequent requests
      setEmail(normalizedEmail);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to send OTP. Please try again or check your email address."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setInfo(null);
    try {
      setIsSendingOtp(true);
      // ✅ same API helper (email should already be normalized)
      await sendOtpApi(String(email || "").trim().toLowerCase());
      setInfo("OTP resent. Check your email.");
      startCooldown(RESEND_COOLDOWN);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // STEP B: Verify OTP & Register
  const verifyAndRegister = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setInfo(null);

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedOtp || normalizedOtp.length === 0) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    if (!signupData.fullName || signupData.fullName.trim().length < 2) {
      setError("Please provide your full name (at least 2 characters).");
      return;
    }
    if (!signupData.password || signupData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsVerifying(true);

      // ✅ use verifyOtpRegister helper instead of axios.post("/api/verify-otp-register")
      const res = await verifyOtpRegister({
        email: normalizedEmail,
        otp: normalizedOtp,
        fullName: signupData.fullName.trim(),
        password: signupData.password,
      });

      // Expect backend to return { token, user } on success
      const token = res?.token;
      const user = res?.user;
      if (!token) {
        // fallback: if your backend uses a different response restructure here
        setError("Registration succeeded but no token returned. Contact admin.");
        return;
      }

      // store token so your app recognizes the user (adjust if you use cookies)
      localStorage.setItem(TOKEN_KEY, token);

      // set axios instance auth header immediately so subsequent requests are authenticated
      try {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (e) {
        // ignore if axiosInstance not available
        console.warn("Could not set axiosInstance authorization header", e);
      }

      // decide where to navigate: onboarding or home
      const willOnboard = !(user && (user.isOnboarded === true || user.isOnboarded === "true"));

      setInfo("Registration complete. Redirecting...");
      setTimeout(() => {
        try {
          if (willOnboard) navigate("/onboarding");
          else navigate("/");
        } catch (err) {
          window.location.href = willOnboard ? "/onboarding" : "/";
        }
      }, 700);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to verify OTP or register. Please check your OTP and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Forgot password: send reset email
  const handleSendForgot = async (e) => {
    e?.preventDefault?.();
    setForgotError(null);
    setForgotInfo(null);

    const normalized = String(forgotEmail || "").trim().toLowerCase();
    if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSendingForgot(true);
      // Adjust the endpoint to match your backend; common paths: /api/auth/forgot-password or /api/forgot-password
      await axiosInstance.post("/auth/forgot-password", { email: normalized });
      setForgotInfo(
        "If that email exists in our system, a password reset link has been sent. Check your inbox."
      );
    } catch (err) {
      console.error(err);
      setForgotError(
        err?.response?.data?.message ||
          "Failed to send password reset email. Try again later."
      );
    } finally {
      setIsSendingForgot(false);
    }
  };

  // If user wants to go back to step 1 to change email
  const backToEmailStep = () => {
    setStep(1);
    setOtp("");
    setInfo(null);
    setError(null);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
    setCooldown(0);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LEFT: FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <Sparkles className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ShadowMeet
            </span>
          </div>

          {/* show one shared error box */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="alert alert-info mb-4">
              <span>{info}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Enter your email to receive a verification code (OTP).
                  </p>
                </div>

                <div className="space-y-3">
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@gmail.com"
                      className="input input-bordered w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <button className="btn btn-primary" type="submit" disabled={isSendingOtp}>
                    {isSendingOtp ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        Sending...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </button>

                  {email && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setEmail("");
                        setError(null);
                        setInfo(null);
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                    <span className="mx-2">·</span>
                    <button type="button" className="link" onClick={() => { setForgotOpen(true); setForgotEmail(email); }}>
                      Forgot password?
                    </button>
                  </p>
                </div>
              </div>
            </form>
          ) : (
            // STEP 2: enter OTP + full form
            <form onSubmit={verifyAndRegister}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Verify & Create Account</h2>
                  <p className="text-sm opacity-70">
                    We sent an OTP to <strong>{email}</strong>. Enter it below and complete your profile.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">OTP</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      className="input input-bordered w-full"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={handleResendOtp}
                        disabled={isSendingOtp || cooldown > 0}
                      >
                        {isSendingOtp
                          ? "Resending..."
                          : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Resend OTP"}
                      </button>

                      <button type="button" className="btn btn-sm btn-ghost" onClick={backToEmailStep}>
                        Change email
                      </button>
                    </div>
                  </div>

                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) =>
                        setSignupData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <button className="btn btn-primary" type="submit" disabled={isVerifying}>
                    {isVerifying ? (
                      <>
                        <span className="loading loading-spinner loading-xs" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setOtp("");
                      setSignupData({ fullName: "", password: "" });
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                    <span className="mx-2">·</span>
                    <button type="button" className="link" onClick={() => { setForgotOpen(true); setForgotEmail(email); }}>
                      Forgot password?
                    </button>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT SIDE ILLUSTRATION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Meet. Speak. Connect worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-ghost absolute right-2 top-2"
              onClick={() => {
                setForgotOpen(false);
                setForgotEmail("");
                setForgotError(null);
                setForgotInfo(null);
                setIsSendingForgot(false);
              }}
            >
              ✕
            </button>

            <h3 className="font-bold text-lg">Forgot your password?</h3>
            <p className="py-2 text-sm opacity-70">Enter your account email and we'll send reset instructions.</p>

            {forgotError && <div className="alert alert-error mb-2"><span>{forgotError}</span></div>}
            {forgotInfo && <div className="alert alert-info mb-2"><span>{forgotInfo}</span></div>}

            <form onSubmit={handleSendForgot} className="space-y-3 mt-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => setForgotOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit" disabled={isSendingForgot}>
                  {isSendingForgot ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      Sending...
                    </>
                  ) : (
                    "Send reset email"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-3 text-xs opacity-70">If you don't see the email, check spam or wait a few minutes.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpPage;
