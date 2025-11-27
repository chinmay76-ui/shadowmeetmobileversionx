import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 bg-tree-hero relative"
      data-theme="forest"
    >
      {/* very light dark overlay so text is still readable; reduce or remove if you want */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row w-full max-w-6xl mx-auto gap-10 text-base-100">
        {/* LEFT SIDE - LOGIN FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-6 sm:mb-8 flex items-center justify-start gap-2">
            <div className="p-2 rounded-xl bg-primary/40 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold font-monotext-green-700">
              ShadowMeet
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mb-4 text-sm sm:text-base">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6 w-full">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm opacity-130 mt-1">
                Sign in to continue your language journey
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs sm:text-sm text-base-200">
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  className="input input-bordered w-full rounded-lg text-sm sm:text-base-00 bg-black/20 border-white/40 text-base-100 placeholder:text-gray-300"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Password */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-xs sm:text-sm text-base-200">
                    Password
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full rounded-lg text-sm sm:text-base bg-black/20 border-white/40 text-base-100 placeholder:text-gray-300"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-full rounded-lg text-sm sm:text-base mt-2 shadow-lg shadow-primary/40"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center mt-2 text-xs sm:text-sm">
                <p>
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary hover:underline font-medium"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE (NO BIG BOX) */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between gap-6">
          <div>
            <div className="relative aspect-square max-w-[260px] sm:max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl ring-2 ring-primary/50">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-95 text-xs sm:text-sm px-2 sm:px-4">
                Practice conversations, make friends, and improve your language
                skills together.
              </p>
            </div>

            {/* Stats - small floating cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg border border-primary/40">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  10K+
                </p>
                <p className="text-xs sm:text-sm opacity-90 mt-1">
                  Total Users
                </p>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center shadow-lg border border-secondary/40">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">
                  2.5K+
                </p>
                <p className="text-xs sm:text-sm opacity-90 mt-1">
                  Monthly Active
                </p>
              </div>
            </div>
          </div>

          {/* CONTACT + COPYRIGHT */}
          <div className="mt-4 pt-2 text-center space-y-1 text-[11px] sm:text-xs md:text-sm opacity-100">
            <p>
              Contact:{" "}
              <a href="tel:9337738523" className="hover:underline text-primary font-bold">
                9337738523
              </a>{" "}
              |{" "}
              <a
                href="mailto:lmsbc56@gmail.com"
                className="hover:underline text-primary font-bold"
              >
                lmsbc56@gmail.com
              </a>
            </p>
            <p>
              © {new Date().getFullYear()} ShadowMeet. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
