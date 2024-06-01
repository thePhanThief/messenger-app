"use client";

import useConversation from "@/app/hooks/useConversation"; // Import custom hook to get conversation details
import useRoutes from "@/app/hooks/useRoutes"; // Import custom hook to get routes
import MobileItem from "./MobileItem"; // Import MobileItem component

// Create the MobileFooter component
const MobileFooter = () => {
  const routes = useRoutes(); // Get routes using the custom hook
  const { isOpen } = useConversation(); // Get conversation open state using the custom hook

  if (isOpen) {
    return null; // If a conversation is open, do not render the footer
  }

  return (
    <div
      className="
        fixed
        justify-between
        w-full
        bottom-0
        z-40
        flex
        items-center
        bg-white
        border-t-[1px]
        lg:hidden
    "
    >
      {routes.map((route) => (
        <MobileItem
          key={route.label}
          href={route.href}
          active={route.active}
          icon={route.icon}
          onClick={route.onClick}
        />
      ))}
    </div>
  );
};

export default MobileFooter; // Export the MobileFooter component
