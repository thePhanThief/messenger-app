"use client";

import Image from "next/image"; 
import { User } from "@prisma/client"; 
import useActiveList from "../hooks/useActiveList"; 

// Interface for the properties of the Avatar component.
interface AvatarProps {
  // Define user property which is optional
  user?: User; 
}

// Create the Avatar component
const Avatar: React.FC<AvatarProps> = ({ user }) => {
  // Get list of active members
  const { members } = useActiveList(); 
  // Check if the user is active
  const isActive = members.indexOf(user?.email!) !== -1; 

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
          // Set user's image or placeholder
          src={user?.image || "/images/placeholder.jpg"} 
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

// Export the Avatar component
export default Avatar; 
