"use client"; 

import Avatar from "@/app/components/Avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UserBoxProps {
  data: User; 
}

// Creating the UserBox component.
const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  // Initializing the router object.
  const router = useRouter(); 
  
  // State for loading status.
  const [isLoading, setIsLoading] = useState(false); 

  // Memoized callback for click events.
  const handleClick = useCallback(() => {
    // Set loading status to true.
    setIsLoading(true); 
    // Perform a POST request to start a conversation.
    axios
      .post("/api/conversations", {
         // Send the user's ID in the request body.
        userId: data.id,
      })
      .then((data) => {
        // Navigate to the conversation page.
        router.push(`/conversations/${data.data.id}`); 
      })
      // Reset loading status.
      .finally(() => setIsLoading(false));
  }, [data, router]);

  return (
    <>
      {/* Show loading animation if loading */}
      {isLoading && <LoadingModal />} 
      <div
      // Handle click to start a conversation.
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
        {/* Display the user's avatar */}
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
                {/* Display the user's name */}
                {data.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
