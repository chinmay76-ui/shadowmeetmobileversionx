import { LoaderIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();

  return (
    <div
      className="h-dvh sm:min-h-screen flex items-center justify-center"
      data-theme={theme}
    >
      <LoaderIcon className="animate-spin w-8 h-8 sm:w-10 sm:h-10 text-primary" />
    </div>
  );
};

export default PageLoader;
