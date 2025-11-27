import { BellIcon } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
      <div className="size-14 sm:size-16 rounded-full bg-base-300 flex items-center justify-center mb-3 sm:mb-4">
        <BellIcon className="w-7 h-7 sm:size-8 text-base-content opacity-40" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold mb-2">
        No notifications yet
      </h3>
      <p className="text-sm sm:text-base text-base-content opacity-70 max-w-md">
        When you receive friend requests or messages, they'll appear here.
      </p>
    </div>
  );
}

export default NoNotificationsFound;
