// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, Sparkles } from "lucide-react"; // UsersIcon removed
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";
import ProfileModal from "./ProfileModal"; // ADDED

/* --------------------------------------------
   Developer / Website Info (SAFE CONFIG AREA)
--------------------------------------------- */

// YOUR photo located in: /public/p.png
const DEV_PHOTO = "/p.png";

// Info shown in About modal (customize as needed)
const DEV_NAME = "Chinmaya Das";
const DEV_INSTA = "chinmay._.das"; // shown as @chinmay._.das
const SITE_SHORT = "ShadowMeet — Connect worldwide for language practice.";
const SITE_LONG =
  "ShadowMeet is a language exchange platform built to help learners practice speaking, find partners, and make global friends. Practice conversations, make friends, and improve your language skills through real-time chat and calls.";

// DEFAULT_AVATAR uses existing dev avatar constant
const DEFAULT_AVATAR = DEV_PHOTO;

// Use the uploaded local file from the conversation history as the QR image.
// (developer instruction: use the path from the conversation)
const DONATE_QR_SRC = "/qr.png";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const [aboutOpen, setAboutOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  // NEW: Profile modal open state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // prefer user's instagram if they set one; otherwise developer handle
  const instaHandle = authUser?.instagram || DEV_INSTA;

  // fetch incoming friend requests to show badge count
  const { data: incomingReqs = [] } = useQuery({
    queryKey: ["incomingFriendReqs"],
    queryFn: getFriendRequests,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // If your getFriendRequests returns { incomingReqs, acceptedReqs }
  // and Sidebar expects an array, try: const incomingCount = Array.isArray(incomingReqs) ? incomingReqs.length : (incomingReqs?.incomingReqs?.length || 0);
  const incomingCount = Array.isArray(incomingReqs) ? incomingReqs.length : (incomingReqs?.incomingReqs?.length || 0);

  // close modals on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (zoomOpen) setZoomOpen(false);
        if (aboutOpen) setAboutOpen(false);
        if (donateOpen) setDonateOpen(false);
        if (isProfileOpen) setIsProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen, zoomOpen, donateOpen, isProfileOpen]);

  return (
    <>
      <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-base-300">
          <Link to="/" className="flex items-center gap-2.5">
            <Sparkles className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              ShadowMeet
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""}`}
          >
            <HomeIcon className="size-5 text-base-content opacity-70" />
            <span>Home</span>
          </Link>

          <Link
            to="/notifications"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""}`}
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-3">
                <BellIcon className="size-5 text-base-content opacity-70" />
                <span>Notifications</span>
              </div>

              {incomingCount > 0 && (
                <span aria-live="polite" className="badge badge-sm badge-primary">
                  {incomingCount}
                </span>
              )}
            </div>
          </Link>

          {/* ABOUT BUTTON */}
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-base-content opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
              <path d="M12 16v-4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>About</span>
          </button>

          {/* DONATE BUTTON */}
          <button
            type="button"
            onClick={() => setDonateOpen(true)}
            className="btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-base-content opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
            <span>Donate</span>
          </button>

          {/* EDIT PROFILE - moved under Donate */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="btn btn-ghost justify-start w-full gap-3 px-3 normal-case text-left"
            aria-label="Edit Profile"
            title="Edit Profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5 text-base-content opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
            </svg>
            <span>Edit Profile</span>
          </button>
        </nav>

        {/* FOOTER USER PROFILE */}
        <div className="p-4 border-t border-base-300 mt-auto">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full overflow-hidden" title="User avatar">
                <img src={authUser?.profilePic || DEFAULT_AVATAR} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{authUser?.fullName || "User"}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ABOUT MODAL */}
      {aboutOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setAboutOpen(false)} />
          <div className="relative z-10 max-w-lg w-full bg-base-100 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setZoomOpen(true)}
                >
                  <img src={DEV_PHOTO} alt={`${DEV_NAME} photo`} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">DEVELOPER - {DEV_NAME}</h3>
                  <a href={`https://instagram.com/${instaHandle}`} target="_blank" rel="noreferrer" className="text-sm opacity-80 underline">
                    @{instaHandle}
                  </a>
                </div>

                <button onClick={() => setAboutOpen(false)} className="ml-auto btn btn-ghost btn-sm">
                  Close
                </button>
              </div>

              <div className="mt-4 text-sm leading-relaxed space-y-3">
                <p className="font-medium">{SITE_SHORT}</p>
                <p className="opacity-80">{SITE_LONG}</p>

                <div className="pt-2">
                  <strong>How this site helps:</strong>
                  <ul className="list-disc list-inside text-sm opacity-80 mt-2">
                    <li>Find language partners and practice real conversations.</li>
                    <li>Send friend requests and join voice/video calls.</li>
                    <li>Discover learners based on your languages and location.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-base-300 p-3 flex justify-end">
              <button onClick={() => setAboutOpen(false)} className="btn btn-primary">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE MODAL */}
      {zoomOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setZoomOpen(false)} />
          <div className="relative z-10 max-w-3xl w-full">
            <img src={DEV_PHOTO} alt="Zoomed" className="w-full h-auto rounded-lg shadow-xl border border-base-300" />
            <button onClick={() => setZoomOpen(false)} className="absolute top-3 right-3 btn btn-sm btn-circle btn-primary" aria-label="Close zoom">
              ✕
            </button>
          </div>
        </div>
      )} 

      {/* DONATE MODAL (behaves like About modal; displays local qr image and Close) */}
      {donateOpen && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDonateOpen(false)} />
          <div className="relative z-10 max-w-sm w-full bg-base-100 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">Support the project</h3>
                <button onClick={() => setDonateOpen(false)} className="btn btn-ghost btn-sm" aria-label="Close donate modal">
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-center mb-4">
                <img src={DONATE_QR_SRC} alt="Donate QR" className="w-48 h-48 object-contain" />
              </div>

              <p className="text-sm opacity-80 mb-4 text-center">Scan to donate. Thank you — every bit helps!</p>

              <div className="flex justify-end">
                <button onClick={() => setDonateOpen(false)} className="btn btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal (new) */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Sidebar;
