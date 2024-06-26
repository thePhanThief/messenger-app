"use client";

// Import custom hook to get routes
import useRoutes from "@/app/hooks/useRoutes";
// Import useState hook from React
import { useState } from "react";
// Import DesktopItem component
import DesktopItem from "./DesktopItem";
// Import Avatar component
import Avatar from "../Avatar";
// Import User type from Prisma client
import { User } from "@prisma/client";
// Import SettingsModal component
import SettingsModal from "./SettingsModal";

interface DesktopSidebarProps {
  currentUser: User;
}

// Create the DesktopSidebar component
const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
 // State to handle the visibility of the settings modal
 const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <div
        className="
          hidden 
          lg:fixed 
          lg:inset-y-0 
          lg:left-0 
          lg:z-40 
          lg:w-20 
          xl:px-6
          lg:overflow-y-auto 
          lg:bg-white 
          lg:border-r-[1px]
          lg:pb-4
          lg:flex
          lg:flex-col
          justify-between
      "
      >
        {/* Navigation for desktop items */}
        <nav className="mt-4 flex flex-col justify-between">
          <ul role="list" className="flex flex-col items-center space-y-1">
            {routes.map((item) => (
              <DesktopItem
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
                onClick={item.onClick}
              />
            ))}
          </ul>
        </nav>
        <nav className="mt-4 flex flex-col justify-between items-center">
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer hover:opacity-75 transition"
          >
            <Avatar user={currentUser} />
          </div>
        </nav>
      </div>
    </>
  );
};

export default DesktopSidebar;
