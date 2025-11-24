import { Link, useLocation, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon,Sparkles, ArrowLeftIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
// removed useLogout import in favor of a local mutation to ensure cache clearing

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getFriendRequests, logout as logoutApi } from "../lib/api";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isChatPage = location.pathname?.startsWith("/chat");

  // NOTE: Use the SAME query key as NotificationsPage and the mutation logic:
  // NotificationsPage uses ["friendRequests"] — using the exact same key here
  // ensures the badge updates instantly when you setQueryData or invalidateQueries.
  const { data: friendReqData } = useQuery({
    queryKey: ["friendRequests"], // <- kept to match NotificationsPage
    queryFn: getFriendRequests,
    // refresh periodically so the badge stays up-to-date
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // your API returns an object like { incomingReqs: [...], acceptedReqs: [...] }
  const incomingCount = friendReqData?.incomingReqs?.length || 0;

  // Local logout mutation: call server, then immediately clear authUser cache
  const { mutate: doLogout, isLoading: logoutLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Clear cached auth user immediately so UI reacts (no refresh)
      queryClient.setQueryData(["authUser"], null);

      // Optionally invalidate other user-related queries:
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["streamToken"] });
      // navigate to login
      navigate("/login", { replace: true });
    },
    onError: () => {
      // Even if server failed, clear client-side auth to avoid stale UI
      queryClient.setQueryData(["authUser"], null);
      navigate("/login", { replace: true });
    },
  });

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between w-full">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            {/* Back button (only on chat pages) */}
            {isChatPage && (
              <Link
                to="/"
                className="btn btn-ghost btn-circle"
                title="Back to Home"
                aria-label="Back to Home"
              >
                <ArrowLeftIcon className="h-5 w-5 text-base-content opacity-80" />
              </Link>
            )}

            {/* Logo (optional; show on chat pages if you want) */}
            {isChatPage && (
              <Link to="/" className="flex items-center gap-2.5">
                <Sparkles className="size-9 text-primary" />
                <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  ShadowMeet
                </span>
              </Link>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={"/notifications"} aria-label="Notifications">
              <button className="btn btn-ghost btn-circle relative" aria-haspopup="true">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />

                {/* topbar badge (orange) — shows when there's at least one incoming friend request */}
                {incomingCount > 0 && (
                  <span
                    aria-live="polite"
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content text-xs font-semibold"
                    title={`${incomingCount} new friend request${incomingCount > 1 ? "s" : ""}`}
                  >
                    {incomingCount > 9 ? "9+" : incomingCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Theme selector */}
            <ThemeSelector />

            {/* Avatar */}
            <div className="avatar">
              <div className="w-9 rounded-full overflow-hidden">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>

            {/* Logout button */}
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => doLogout()}
              aria-label="Logout"
              disabled={logoutLoading}
            >
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
