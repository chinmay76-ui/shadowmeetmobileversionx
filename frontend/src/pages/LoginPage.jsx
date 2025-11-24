import { useState } from "react";
import { Sparkles } from "lucide-react"; // changed icon
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
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Sparkles className="size-7 text-primary" />
            </div>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ShadowMeet
            </span>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response?.data?.message}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 w-full">
            <div>
              <h2 className="text-xl font-semibold">Welcome Back</h2>
              <p className="text-sm opacity-70">Sign in to continue your language journey</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Email */}
              <div className="form-control w-full">
                <label className="label"><span className="label-text">Email</span></label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  className="input input-bordered w-full rounded-lg"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-control w-full">
                <label className="label"><span className="label-text">Password</span></label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full rounded-lg"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary w-full rounded-lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center mt-2 text-sm">
                <p>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto rounded-xl overflow-hidden shadow-md">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full object-cover" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">Practice conversations, make friends, and improve your language skills together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;