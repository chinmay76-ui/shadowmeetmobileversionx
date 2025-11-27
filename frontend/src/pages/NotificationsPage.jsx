import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  const fallbackAvatar = "/mnt/data/5d7ba368-4871-4706-bdc9-e93cbaee024b.png";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-base-100 px-3 py-4 sm:px-4 sm:py-6 lg:px-8 lg:py-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-1 sm:ml-2">
                    {incomingRequests.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {incomingRequests.map((request, idx) => {
                    if (!request) return null;

                    const sender = request.sender ?? request.user ?? null;
                    if (!sender) return null;

                    const avatar = sender?.profilePic ?? fallbackAvatar;
                    const fullName = sender?.fullName ?? "Unknown user";

                    return (
                      <div
                        key={request._id ?? `incoming-${idx}`}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="avatar w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-base-300">
                                <img src={avatar} alt={fullName} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm sm:text-base">
                                  {fullName}
                                </h3>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="badge badge-secondary badge-sm">
                                    Native: {sender?.nativeLanguage ?? "—"}
                                  </span>
                                  <span className="badge badge-outline badge-sm">
                                    Learning: {sender?.learningLanguage ?? "—"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              className="btn btn-primary btn-xs sm:btn-sm"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isPending}
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {acceptedRequests.length > 0 && (
              <section className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification, idx) => {
                    if (!notification) return null;

                    const recipient = notification.recipient ?? notification.user ?? null;
                    if (!recipient) return null;

                    const avatar = recipient?.profilePic ?? fallbackAvatar;
                    const fullName = recipient?.fullName ?? "Unknown user";

                    return (
                      <div
                        key={notification._id ?? `accepted-${idx}`}
                        className="card bg-base-200 shadow-sm"
                      >
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <div className="avatar mt-1 size-8 sm:size-10 rounded-full">
                              <img src={avatar} alt={fullName} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm sm:text-base">
                                {fullName}
                              </h3>
                              <p className="text-xs sm:text-sm my-1">
                                {fullName} accepted your friend request
                              </p>
                              <p className="text-[11px] sm:text-xs flex items-center opacity-70">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Recently
                              </p>
                            </div>
                            <div className="badge badge-success text-[10px] sm:text-xs">
                              <MessageSquareIcon className="h-3 w-3 mr-1" />
                              New Friend
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequests.length === 0 &&
              acceptedRequests.length === 0 && <NoNotificationsFound />}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
