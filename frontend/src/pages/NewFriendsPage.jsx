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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>
            <p className="opacity-70">Discover perfect language exchange partners based on your profile</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={learnersSearch}
              onChange={(e) => setLearnersSearch(e.target.value)}
              placeholder="Search learners..."
              className="input input-sm input-bordered"
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

            <Link to="/friends" className="btn btn-ghost btn-sm">
              Back to Friends
            </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedLearners.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <div
                    key={user._id}
                    className="card bg-base-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="card-body p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar size-16 rounded-full">
                          <img src={user.profilePic || TEST_IMAGE} alt={user.fullName} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{user.fullName}</h3>
                          {user.location && (
                            <div className="flex items-center text-xs opacity-70 mt-1">
                              <MapPinIcon className="size-3 mr-1" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge badge-secondary">
                          {getLanguageFlag(user.nativeLanguage)}
                          Native: {capitialize(user.nativeLanguage)}
                        </span>
                        <span className="badge badge-outline">
                          {getLanguageFlag(user.learningLanguage)}
                          Learning: {capitialize(user.learningLanguage)}
                        </span>
                      </div>

                      {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

                      <button
                        className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"} `}
                        onClick={() => sendRequestMutation(user._id)}
                        disabled={hasRequestBeenSent || isPending}
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
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
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

              <div>
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
