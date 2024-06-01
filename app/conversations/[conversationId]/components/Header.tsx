"use client";

// Import necessary modules and components
import { Conversation, User } from "@prisma/client"; // Import Conversation and User types from Prisma client
import useOtherUser from "@/app/hooks/useOtherUser"; // Custom hook to get other user details
import { useMemo, useState } from "react"; // Import React hooks
import Link from "next/link"; // Import Link component from Next.js
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2"; // Import icons from react-icons/hi2
import Avatar from "@/app/components/Avatar"; // Import Avatar component
import AvatarGroup from "@/app/components/GroupAvatar"; // Import GroupAvatar component
import ProfileDrawer from "./ProfileDrawer"; // Import ProfileDrawer component
import useActiveList from "@/app/hooks/useActiveList"; // Custom hook to get active users list

// Define properties for the Header component
interface HeaderProps {
  conversation: Conversation & {
    users: User[]; // Extend Conversation type to include an array of users
  };
}

// Create the Header component
const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation); // Get other user details
  const [drawerOpen, setDrawerOpen] = useState(false); // State to handle drawer open/close

  const { members } = useActiveList(); // Get list of active members
  const isActive = members.indexOf(otherUser?.email!) !== -1; // Check if the other user is active

  // Determine the status text based on the conversation type and user activity
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`; // Show the number of members if it's a group conversation
    }
    return isActive ? 'Active' : 'Offline'; // Show active or offline status for individual conversation
  }, [conversation, isActive]);

  return (
    <>
      {/* ProfileDrawer component for viewing user profile */}
      <ProfileDrawer
        data={conversation} // Pass conversation data
        isOpen={drawerOpen} // Pass drawer open state
        onClose={() => setDrawerOpen(false)} // Handle drawer close
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
            href="/conversations" // Link to conversations page
          >
            <HiChevronLeft size={32} /> {/* Display back icon */}
          </Link>
          {conversation.isGroup ? (
            <AvatarGroup users={conversation.users} /> // Display group avatar for group conversation
          ) : (
            <Avatar user={otherUser} /> // Display avatar for individual conversation
          )}
          <div className="flex flex-col">
            <div>
              {conversation.name || otherUser.name} {/* Display conversation name or other user's name */}
            </div>
            <div
              className="
                text-sm
                font-light
                text-neutral-500
              "
            >
              {statusText} {/* Display status text */}
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          size={32}
          onClick={() => setDrawerOpen(true)} // Handle drawer open
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

export default Header; // Export the Header component
