"use client";

import { User } from "@prisma/client"; // Import User type from Prisma client
import Image from "next/image"; // Import Image component from Next.js

// Define the properties for the GroupAvatar component
interface GroupAvatarProps {
  users?: User[]; // Define users property which is an array of User objects
}

// Create the GroupAvatar component
const GroupAvatar: React.FC<GroupAvatarProps> = ({ users = [] }) => {
  const slicedUsers = users.slice(0, 3); // Slice the first three users

  // Define positions for the avatars
  const positionMap = {
    0: "top-0 left-[12px]",
    1: "bottom-0",
    2: "bottom-0 right-0",
  };

  return (
    <div className="relative h-11 w-11">
      {/* Map through sliced users and display their avatars */}
      {slicedUsers.map((user, index) => (
        <div
          key={user.id}
          className={`
            absolute
            inline-block
            rounded-full
            overflow-hidden
            h-[21px]
            w-[21px]
            ${positionMap[index as keyof typeof positionMap]} // Set position based on index
          `}
        >
          <Image
            fill
            src={user?.image || "/images/placeholder.jpg"} // Set user's image or placeholder
            alt="Avatar"
          />
        </div>
      ))}
    </div>
  );
};

export default GroupAvatar; // Export the GroupAvatar component
