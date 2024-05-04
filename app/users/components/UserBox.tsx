"use client"; // Directive to indicate that the file is intended for client-side execution only.

import Avatar from "@/app/components/Avatar"; // Importing the Avatar component.
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client";
import axios from "axios"; // Importing axios for making HTTP requests.
import { useRouter } from "next/navigation"; // Importing useRouter from next.js for navigation.
import { useCallback, useState } from "react"; // Importing React hooks.

interface UserBoxProps {
  // Defining props type for UserBox component.
  data: User;
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  const router = useRouter(); // Initializing the router object.
  const [isLoading, setIsLoading] = useState(false); // State for loading status.

  const handleClick = useCallback(() => {
    // Memoized callback for click events.
    setIsLoading(true); // Set loading status to true.

    axios
      .post("/api/conversations", {
        // Perform a POST request to start a conversation.
        userId: data.id,
      })
      .then((data) => {
        router.push(`/conversations/${data.data.id}`); // Navigate to the conversation page.
      })
      .finally(() => setIsLoading(false)); // Reset loading status.
  }, [data, router]);

  return (
    <>
    {isLoading && ( <LoadingModal />)} {/* adds loading animation if loading */}
      <div
        onClick={handleClick}
        className="
      w-full
      relative
      flex
      items-center
      space-x-3
      bg-white
      p-3
      hover:bg-neutral-100
      rounded-lg
      cursor-pointer
      "
      >
        <Avatar user={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div
              className="
                  flex
                  justify-between
                  items-center
                  mb-1
                "
            >
              <p
                className="
                    text-sm
                    font-medium
                    text-gray-900
                  "
              >
                {data.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox; // Export the UserBox component.
