"use client"; // Directive to indicate that the file is intended for client-side execution only.

import Avatar from "@/app/components/Avatar"; // Importing the Avatar component.
import LoadingModal from "@/app/components/LoadingModal"; // Importing the LoadingModal component for loading animations.
import { User } from "@prisma/client"; // Importing the User type from Prisma.
import axios from "axios"; // Importing axios for making HTTP requests.
import { useRouter } from "next/navigation"; // Importing useRouter from Next.js for navigation.
import { useCallback, useState } from "react"; // Importing React hooks.

// Defining props type for UserBox component.
interface UserBoxProps {
  data: User; // User data to be passed as a prop.
}

// Creating the UserBox component.
const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  const router = useRouter(); // Initializing the router object.
  const [isLoading, setIsLoading] = useState(false); // State for loading status.

  // Memoized callback for click events.
  const handleClick = useCallback(() => {
    setIsLoading(true); // Set loading status to true.

    // Perform a POST request to start a conversation.
    axios
      .post("/api/conversations", {
        userId: data.id, // Send the user's ID in the request body.
      })
      .then((data) => {
        router.push(`/conversations/${data.data.id}`); // Navigate to the conversation page.
      })
      .finally(() => setIsLoading(false)); // Reset loading status.
  }, [data, router]);

  return (
    <>
      {isLoading && <LoadingModal />} {/* Show loading animation if loading */}
      <div
        onClick={handleClick} // Handle click to start a conversation.
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
        <Avatar user={data} /> {/* Display the user's avatar */}
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
                {data.name} {/* Display the user's name */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox; // Export the UserBox component.
