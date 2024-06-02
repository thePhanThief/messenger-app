"use client";

import useConversation from "@/app/hooks/useConversation"; 
import useRoutes from "@/app/hooks/useRoutes"; 
import MobileItem from "./MobileItem"; 

// Create the MobileFooter component
const MobileFooter = () => {
  const routes = useRoutes(); 
   // Get conversation open state using the custom hook
  const { isOpen } = useConversation();

  if (isOpen) {
    // If a conversation is open, do not render the footer
    return null; 
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

export default MobileFooter; 
