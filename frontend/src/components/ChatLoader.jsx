import { LoaderIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="h-dvh sm:h-screen flex flex-col items-center justify-center px-4">
      <LoaderIcon className="animate-spin w-8 h-8 sm:w-10 sm:h-10 text-primary" />
      <p className="mt-4 text-center text-base sm:text-lg font-mono">
        Connecting to chat...
      </p>
    </div>
  );
}

export default ChatLoader;
