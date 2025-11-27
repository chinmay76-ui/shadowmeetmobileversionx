// src/pages/NewFriendsPage.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon } from "lucide-react";

import { capitialize } from "../lib/utils";
import { getLanguageFlag } from "../components/FriendCard";

const TEST_IMAGE = "/mnt/data/368df7a4-9cbd-4ad7-8a62-6e0d6ad4bbec.png";
const PAGE_SIZE = 5;

const NewFriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const [learnersSearch, setLearnersSearch] = useState("");
  const [learnersPage, setLearnersPage] = useState(1);
  const [showAllLearners, setShowAllLearners] = useState(false);

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
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    } else {
      setOutgoingRequestsIds(new Set());
    }
  }, [outgoingFriendReqs]);

  const filterUsers = (list, q) => {
    if (!q) return list;
    const ql = q.trim().toLowerCase();
    return list.filter(
      (u) =>
        (u.fullName && u.fullName.toLowerCase().includes(ql)) ||
        (u.bio && u.bio.toLowerCase().includes(ql)) ||
        (u.location && u.location.toLowerCase().includes(ql)) ||
        (u.nativeLanguage && u.nativeLanguage.toLowerCase().includes(ql)) ||
        (u.learningLanguage && u.learningLanguage.toLowerCase().includes(ql))
    );
  };

  const filteredLearners = useMemo(
    () => filterUsers(recommendedUsers, learnersSearch),
    [recommendedUsers, learnersSearch]
  );

  const learnersTotalPages = Math.max(1, Math.ceil(filteredLearners.length / PAGE_SIZE));

  const paginatedLearners = useMemo(() => {
    if (showAllLearners) return filteredLearners;
    const start = (learnersPage - 1) * PAGE_SIZE;
    return filteredLearners.slice(start, start + PAGE_SIZE);
  }, [filteredLearners, learnersPage, showAllLearners]);

  useEffect(() => setLearnersPage(1), [learnersSearch, recommendedUsers, showAllLearners]);

  return (
    <div className="w-full min-h-screen">
      {/* fluid container with comfortable paddings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between mb-4 flex-col lg:flex-row gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
            <p className="opacity-70 mt-1">Discover perfect language exchange partners based on your profile</p>
          </div>

          {/* Controls: stacked on small screens, inline on larger */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch lg:items-center">
            <input
              type="text"
              value={learnersSearch}
              onChange={(e) => setLearnersSearch(e.target.value)}
              placeholder="Search learners..."
              aria-label="Search learners"
              className="input input-sm input-bordered flex-1 min-w-0"
            />

            <div className="flex gap-2 flex-wrap">
              <button
                className="btn btn-ghost btn-sm whitespace-nowrap"
                onClick={() => {
                  setLearnersSearch("");
                  setShowAllLearners(false);
                  setLearnersPage(1);
                }}
              >
                Clear
              </button>

              <button
                className="btn btn-outline btn-sm whitespace-nowrap"
                onClick={() => setShowAllLearners((s) => !s)}
              >
                {showAllLearners ? "Paginate" : "Show All"}
              </button>

              <Link to="/friends" className="btn btn-ghost btn-sm whitespace-nowrap">
                Back to Friends
              </Link>
            </div>
          </div>
        </div>

        {loadingUsers ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="card bg-base-200 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
            <p className="text-base-content opacity-70">Check back later for new language partners!</p>
          </div>
        ) : (
          <>
            {/* responsive grid: 1 / 2 / 3 / 4 columns depending on width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedLearners.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                  >
                    <div className="card-body p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-3">
                        <div className="avatar w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={user.profilePic || TEST_IMAGE}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1 truncate">
                              <MapPinIcon className="size-4 mr-1" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="badge badge-secondary whitespace-nowrap">
                          {getLanguageFlag(user.nativeLanguage)}
                          <span className="ml-1">Native: {capitialize(user.nativeLanguage)}</span>
                        </span>
                        <span className="badge badge-outline whitespace-nowrap">
                          {getLanguageFlag(user.learningLanguage)}
                          <span className="ml-1">Learning: {capitialize(user.learningLanguage)}</span>
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70 mt-2 line-clamp-3">{user.bio}</p>}

                      {/* action button — full width on small screens, inline on larger */}
                      <div className="mt-auto">
                        <button
                          className={`btn w-full sm:w-full md:w-full lg:w-full xl:w-full mt-2 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                          aria-disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <CheckCircleIcon className="size-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-4 mr-2" />
                              Send Friend Request
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* pagination controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-sm"
                  onClick={() => setLearnersPage((p) => Math.max(1, p - 1))}
                  disabled={showAllLearners || learnersPage <= 1}
                >
                  Prev
                </button>

                <div className="text-sm">Page {learnersPage} / {learnersTotalPages}</div>

                <button
                  className="btn btn-sm"
                  onClick={() => setLearnersPage((p) => Math.min(learnersTotalPages, p + 1))}
                  disabled={showAllLearners || learnersPage >= learnersTotalPages}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setShowAllLearners((s) => !s);
                    if (!showAllLearners) setLearnersPage(1);
                  }}
                >
                  {showAllLearners ? "Paginate" : "Show All"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewFriendsPage;
