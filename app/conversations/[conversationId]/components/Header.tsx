"use client";

import { Conversation, User } from "@prisma/client"; 
import useOtherUser from "@/app/hooks/useOtherUser"; 
import { useMemo, useState } from "react"; 
import Link from "next/link"; 
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2"; 
import Avatar from "@/app/components/Avatar"; 
import AvatarGroup from "@/app/components/GroupAvatar"; 
import ProfileDrawer from "./ProfileDrawer"; 
import useActiveList from "@/app/hooks/useActiveList"; 

// Define properties for the Header component
interface HeaderProps {
  // Extend Conversation type to include an array of users
  conversation: Conversation & {
    users: User[]; 
  };
}

// Create the Header component
const Header: React.FC<HeaderProps> = ({ conversation }) => {
  // Get other user details
  const otherUser = useOtherUser(conversation); 
  // State to handle drawer open/close
  const [drawerOpen, setDrawerOpen] = useState(false); 

  // Get list of active members
  const { members } = useActiveList(); 
  // Check if the other user is active
  const isActive = members.indexOf(otherUser?.email!) !== -1; 

  // Determine the status text based on the conversation type and user activity
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      // Show the number of members if it's a group conversation
      return `${conversation.users.length} members`; 
    }
    // Show active or offline status for individual conversation
    return isActive ? 'Active' : 'Offline'; 
  }, [conversation, isActive]);

  return (
    <>
      {/* ProfileDrawer component for viewing user profile */}
      <ProfileDrawer
        // Pass conversation data
        data={conversation} 
        // Pass drawer open state
        isOpen={drawerOpen} 
        // Handle drawer close
        onClose={() => setDrawerOpen(false)} 
      />
      <div
        className="
          bg-white
          w-full
          flex
          border-b-[1px]
          sm:px-4
          py-3
          px-4
          lg:px-6
          justify-between
          items-center
          shadow-sm
        "
      >
        <div className="flex gap-3 items-center">
          <Link
            className="
              lg:hidden
              block
              text-sky-500
              hover:text-sky-600
              transition
              cursor-pointer
            "
            // Link to conversations page
            href="/conversations" 
          >
            {/* Display back icon */}
            <HiChevronLeft size={32} /> 
          </Link>
          {conversation.isGroup ? (
            // Display group avatar for group conversation
            <AvatarGroup users={conversation.users} /> 
          ) : (
            // Display avatar for individual conversation
            <Avatar user={otherUser} /> 
          )}
          <div className="flex flex-col">
            <div>
              {/* Display conversation name or other user's name */}
              {conversation.name || otherUser.name} 
            </div>
            <div
              className="
                text-sm
                font-light
                text-neutral-500
              "
            >
              {/* Display status text */}
              {statusText} 
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          size={32}
          // Handle drawer open
          onClick={() => setDrawerOpen(true)} 
          className="
            text-sky-500
            cursor-pointer
            hover:text-sky-600
            transition
          "
        />
      </div>
    </>
  );
};

// Export the Header component
export default Header; 
