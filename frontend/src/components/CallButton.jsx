import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="w-full flex justify-end px-2 py-2 sm:px-3 sm:py-3 border-b bg-base-200">
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-xs sm:btn-sm text-white"
      >
        <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

export default CallButton;
