"use client"; // Directive to indicate that the file is intended for client-side execution only.

import { User } from "@prisma/client"; // Importing the User type from Prisma.
import UserBox from "./UserBox"; // Importing the UserBox component.

interface UserListProps {
  // Defining props type for UserList component.
  items: User[]; // Array of User items to be passed as a prop.
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
            People {/* Title for the user list */}
          </div>
        </div>
        {items.map((item) => (
          <UserBox
            key={item.id} // Unique key for each user
            data={item} // Pass user data to the UserBox component
          />
        ))}
      </div>
    </aside>
  );
};

export default UserList; // Export the UserList component.
