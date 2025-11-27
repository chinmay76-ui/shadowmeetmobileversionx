// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, Sparkles, ArrowLeftIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getFriendRequests, logout as logoutApi } from "../lib/api";

const Navbar = ({ showSidebar, onToggleSidebar }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isChatPage = location.pathname?.startsWith("/chat");

  // same query key as NotificationsPage
  const { data: friendReqData } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const incomingCount = friendReqData?.incomingReqs?.length || 0;

  const { mutate: doLogout, isLoading: logoutLoading } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["streamToken"] });
      navigate("/login", { replace: true });
    },
    onError: () => {
      queryClient.setQueryData(["authUser"], null);
      navigate("/login", { replace: true });
    },
  });

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger for mobile sidebar */}
            {showSidebar && (
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm md:hidden"
                aria-label="Open sidebar"
                onClick={onToggleSidebar}
              >
                <span className="flex flex-col gap-[3px]">
                  <span className="w-4 h-[2px] bg-base-content rounded" />
                  <span className="w-4 h-[2px] bg-base-content rounded" />
                  <span className="w-4 h-[2px] bg-base-content rounded" />
                </span>
              </button>
            )}

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

            {/* Logo (only on chat pages, as before) */}
            {isChatPage && (
              <Link to="/" className="flex items-center gap-2.5">
                <Sparkles className="size-9 text-primary" />
                <span className="text-2xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Chat
                </span>
              </Link>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/notifications" aria-label="Notifications">
              <button
                className="btn btn-ghost btn-circle relative"
                aria-haspopup="true"
              >
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {incomingCount > 0 && (
                  <span
                    aria-live="polite"
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content text-xs font-semibold"
                    title={`${incomingCount} new friend request${
                      incomingCount > 1 ? "s" : ""
                    }`}
                  >
                    {incomingCount > 9 ? "9+" : incomingCount}
                  </span>
                )}
              </button>
            </Link>

            <ThemeSelector />

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
