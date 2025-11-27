import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        {showSidebar && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            showSidebar={showSidebar}
            onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />

          {/* Mobile sidebar drawer */}
          {showSidebar && mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative z-50 w-64 max-w-[80%] h-full">
                {/* mobile=true so Sidebar is not hidden on small screens */}
                <Sidebar mobile={true} />
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
