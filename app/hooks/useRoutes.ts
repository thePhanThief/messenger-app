// Imports: React and Next.js hooks, authentication functions, icons, and custom hooks
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import useConversations from "./useConversation";

// Custom hook for managing navigation routes
const useRoutes = () => {
  // Use Next.js and custom hooks to get current path and conversation context
  const pathname = usePathname();
  const {conversationId}  = useConversations();

  // Routes definition, memoized to optimize performance
  const routes = useMemo(
    () => [
      {
        // Chat route: dynamic activation based on path or conversation presence
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        // Users route: active when the users page is the current view
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathname === "/users", 
      },
      {
        // Logout action: triggers sign out
        label: "Logout",
        href: "#",
        onClick: () => signOut(),
        icon: HiArrowLeftOnRectangle,
      },
    ],
    // Dependencies for useMemo to control re-computation
    [conversationId, pathname]
  );

  // Return the configured routes
  return routes;
};

export default useRoutes;
