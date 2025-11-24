// src/pages/HomePage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

// fallback image
const TEST_IMAGE = "/mnt/data/0256f8e0-8635-4e6a-b078-88aa611c5420.png";

const PAGE_SIZE = 4;

// ⭐ NEW: Zoom Modal Component
const ImageZoomModal = ({ imgSrc, onClose }) => {
  if (!imgSrc) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <img
        src={imgSrc}
        className="max-w-[90%] max-h-[90%] rounded-xl border border-white/20 shadow-xl animate-[zoomIn_.25s_ease]"
      />
    </div>
  );
};

// keyframes
const HomePage = () => {
  const queryClient = useQueryClient();
  const learnersRef = useRef(null);

  // ⭐ NEW: zoom state
  const [zoomImage, setZoomImage] = useState(null);

  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const [friendsSearch, setFriendsSearch] = useState("");
  const [friendsPage, setFriendsPage] = useState(1);
  const [showAllFriends, setShowAllFriends] = useState(false);

  const [learnersSearch, setLearnersSearch] = useState("");
  const [learnersPage, setLearnersPage] = useState(1);
  const [showAllLearners, setShowAllLearners] = useState(false);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const ids = new Set();
    outgoingFriendReqs?.forEach((req) => {
      if (req?.recipient?._id) ids.add(req.recipient._id);
    });
    setOutgoingRequestsIds(ids);
  }, [outgoingFriendReqs]);

  const filterUsers = (list, q) => {
    if (!q) return list;
    const term = q.trim().toLowerCase();
    return list.filter(
      (u) =>
        u?.fullName?.toLowerCase().includes(term) ||
        u?.bio?.toLowerCase().includes(term) ||
        u?.location?.toLowerCase().includes(term) ||
        u?.nativeLanguage?.toLowerCase().includes(term) ||
        u?.learningLanguage?.toLowerCase().includes(term)
    );
  };

  const filteredFriends = useMemo(() => filterUsers(friends, friendsSearch), [friends, friendsSearch]);
  const filteredLearners = useMemo(
    () => filterUsers(recommendedUsers, learnersSearch),
    [recommendedUsers, learnersSearch]
  );

  const friendsTotalPages = Math.max(1, Math.ceil(filteredFriends.length / PAGE_SIZE));
  const learnersTotalPages = Math.max(1, Math.ceil(filteredLearners.length / PAGE_SIZE));

  const paginatedFriends = useMemo(() => {
    if (showAllFriends) return filteredFriends;
    const start = (friendsPage - 1) * PAGE_SIZE;
    return filteredFriends.slice(start, start + PAGE_SIZE);
  }, [filteredFriends, friendsPage, showAllFriends]);

  const paginatedLearners = useMemo(() => {
    if (showAllLearners) return filteredLearners;
    const start = (learnersPage - 1) * PAGE_SIZE;
    return filteredLearners.slice(start, start + PAGE_SIZE);
  }, [filteredLearners, learnersPage, showAllLearners]);

  useEffect(() => setFriendsPage(1), [friendsSearch, friends, showAllFriends]);
  useEffect(() => setLearnersPage(1), [learnersSearch, recommendedUsers, showAllLearners]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#learners" && learnersRef.current) {
      setTimeout(() => learnersRef.current.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0f121a] text-white">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto space-y-10">

          {/* FRIENDS SECTION */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                placeholder="Search friends..."
                className="input input-sm input-bordered bg-slate-700 text-white"
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setFriendsSearch("");
                  setShowAllFriends(false);
                  setFriendsPage(1);
                }}
              >
                Clear
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAllFriends((s) => !s)}>
                {showAllFriends ? "Paginate" : "Show All"}
              </button>
              <Link to="/notifications" className="btn btn-outline btn-sm">
                <UsersIcon className="mr-2 size-4" />
                Friend Requests
              </Link>
            </div>
          </div>

          {/* FRIENDS GRID */}
          {loadingFriends ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <NoFriendsFound />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedFriends.map((friend) => (
                  <div key={friend._id} className="card bg-slate-800">
                    <div className="card-body p-0">

                      {/* ⭐ Zoomable Profile Pic */}
                      <img
                        src={friend.profilePic || TEST_IMAGE}
                        onClick={() => setZoomImage(friend.profilePic || TEST_IMAGE)}
                        className="w-full h-40 object-cover rounded-t-lg cursor-pointer hover:scale-[1.02] transition-transform"
                      />

                      <FriendCard friend={friend} />
                    </div>
                  </div>
                ))}
              </div>

              {/* FRIENDS PAGINATION */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button className="btn btn-sm" onClick={() => setFriendsPage((p) => p - 1)} disabled={showAllFriends || friendsPage <= 1}>
                    Prev
                  </button>
                  <div className="text-sm text-white/80">Page {friendsPage} / {friendsTotalPages}</div>
                  <button className="btn btn-sm" onClick={() => setFriendsPage((p) => p + 1)} disabled={showAllFriends || friendsPage >= friendsTotalPages}>
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MEET NEW LEARNERS */}
          <section ref={learnersRef} id="learners">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold">Meet New Learners</h2>
                <p className="opacity-70">Discover perfect language exchange partners</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={learnersSearch}
                  onChange={(e) => setLearnersSearch(e.target.value)}
                  placeholder="Search learners..."
                  className="input input-sm input-bordered bg-slate-700 text-white"
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setLearnersSearch("");
                    setShowAllLearners(false);
                    setLearnersPage(1);
                  }}
                >
                  Clear
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setShowAllLearners((s) => !s)}>
                  {showAllLearners ? "Paginate" : "Show All"}
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : filteredLearners.length === 0 ? (
              <div className="card bg-slate-800 p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedLearners.map((user) => {
                    const hasSent = outgoingRequestsIds.has(user._id);

                    return (
                      <div key={user._id} className="card bg-slate-800 hover:shadow-xl transition-all">
                        <div className="card-body p-5 space-y-4">

                          {/* ⭐ Zoomable Profile Pic */}
                          <div className="avatar size-16 rounded-full">
                            <img
                              src={user.profilePic || TEST_IMAGE}
                              onClick={() => setZoomImage(user.profilePic || TEST_IMAGE)}
                              className="cursor-pointer hover:scale-105 transition-transform"
                            />
                          </div>

                          <div>
                            <h3 className="font-semibold text-lg">{user.fullName}</h3>
                            {user.location && (
                              <div className="text-xs opacity-70 mt-1 flex items-center">
                                <MapPinIcon className="size-3 mr-1" />
                                {user.location}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <span className="badge badge-secondary">
                              {getLanguageFlag(user.nativeLanguage)} Native: {capitialize(user.nativeLanguage)}
                            </span>
                            <span className="badge badge-outline">
                              {getLanguageFlag(user.learningLanguage)} Learning: {capitialize(user.learningLanguage)}
                            </span>
                          </div>

                          {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                          <button
                            className={`btn w-full mt-2 ${hasSent ? "btn-disabled" : "btn-primary"}`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasSent || isPending}
                          >
                            {hasSent ? (
                              <>
                                <CheckCircleIcon className="size-4 mr-2" /> Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-4 mr-2" /> Send Friend Request
                              </>
                            )}
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button className="btn btn-sm" onClick={() => setLearnersPage((p) => p - 1)} disabled={showAllLearners || learnersPage <= 1}>
                      Prev
                    </button>
                    <div className="text-sm text-white/80">Page {learnersPage} / {learnersTotalPages}</div>
                    <button className="btn btn-sm" onClick={() => setLearnersPage((p) => p + 1)} disabled={showAllLearners || learnersPage >= learnersTotalPages}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* ⭐ ZOOM MODAL */}
      <ImageZoomModal imgSrc={zoomImage} onClose={() => setZoomImage(null)} />
    </div>
  );
};

export default HomePage;
