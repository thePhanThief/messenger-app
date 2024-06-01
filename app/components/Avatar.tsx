"use client";

import Image from "next/image"; // Import Image component from Next.js
import { User } from "@prisma/client"; // Import User type from Prisma client
import useActiveList from "../hooks/useActiveList"; // Import custom hook to get active list of users

interface AvatarProps {
  user?: User; // Define user property which is optional
}

// Create the Avatar component
const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const { members } = useActiveList(); // Get list of active members
  const isActive = members.indexOf(user?.email!) !== -1; // Check if the user is active

  return (
    <div className="relative">
      <div
        className="
          relative
          inline-block
          rounded-full
          overflow-hidden
          h-9
          w-9
          md:h-11
          md:w-11
        "
      >
        <Image
          alt="Avatar"
          src={user?.image || "/images/placeholder.jpg"} // Set user's image or placeholder
          fill
        />
      </div>
      {isActive && (
        <span
          className="
            absolute
            block
            rounded-full
            bg-green-500
            ring-2
            ring-white
            top-0
            right-0
            h-2
            w-2
            md:h-3
            md:w-3
          "
        />
      )}
    </div>
  );
};

export default Avatar; // Export the Avatar component
