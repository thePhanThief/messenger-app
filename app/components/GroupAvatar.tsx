"use client";

import { User } from "@prisma/client"; 
import Image from "next/image";

// Define the properties for the GroupAvatar component
interface GroupAvatarProps {
  // Define users property which is an array of User objects
  users?: User[]; 
}

// Create the GroupAvatar component
const GroupAvatar: React.FC<GroupAvatarProps> = ({ users = [] }) => {
  // Slice the first three users
  const slicedUsers = users.slice(0, 3); 

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
            // Set user's image or placeholder
            src={user?.image || "/images/placeholder.jpg"} 
            alt="Avatar"
          />
        </div>
      ))}
    </div>
  );
};

// Export the GroupAvatar component
export default GroupAvatar; 
