"use client"

import { User } from "@prisma/client"; 
import UserBox from "./UserBox"; 

interface UserListProps {
  items: User[]; 
}

// Creating the UserList component.
const UserList: React.FC<UserListProps> = ({ items }) => {
  return (
    <aside
      className="
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block
        overflow-y-auto
        border-r
        border-gray-200
        block
        w-full
        left-0
      "
    >
      <div className="px-5">
        <div className="flex-col">
          <div
            className="
              text-3xl
              font-bold
              text-neutral-800
              py-4
            "
          >
            {/* Title for the user list */}
            People 
          </div>
        </div>
        {items.map((item) => (
          <UserBox
            // Unique key for each user
            key={item.id}
            // Pass user data to the UserBox component
            data={item}
          />
        ))}
      </div>
    </aside>
  );
};

export default UserList; 
