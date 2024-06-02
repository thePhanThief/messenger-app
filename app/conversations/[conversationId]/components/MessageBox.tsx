"use client";

import Avatar from "@/app/components/Avatar"; 
import { FullMessageType } from "@/app/types"; 
import clsx from "clsx"; 
import { useSession } from "next-auth/react"; 
import { format } from "date-fns"; 
import Image from "next/image"; 
import { useState } from "react"; 
import ImageModal from "./ImageModal"; 

// Define properties for the MessageBox component
interface MessageBoxProps {
  // Message data
  data: FullMessageType; 
  // Boolean to check if this is the last message
  isLast?: boolean; 
}

// Create the MessageBox component
const MessageBox: React.FC<MessageBoxProps> = ({
  data,
  isLast
}) => {
  // Get the current session
  const session = useSession(); 
  // State to handle image modal open/close
  const [imageModalOpen, setImageModalOpen] = useState(false); 

  // Check if the message is sent by the current user
  const isOwn = session?.data?.user?.email === data?.sender?.email; 
  // List of users who have seen the message
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(', '); 

  const container = clsx(
    "flex gap-3 p-4",
    // Align message to the right if it's sent by the current user
    isOwn && "justify-end" 
  );

  const avatar = clsx(isOwn && "order-2"); 

  const body = clsx(
    "flex flex-col gap-2",
    // Align message body to the right if it's sent by the current user
    isOwn && "items-end" 
  );

  const message = clsx(
    "text-sm w-fit overflow-hidden",
    // Apply different styles based on the sender
    isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100', 
    // Apply different styles if the message contains an image
    data.image ? 'rounded-md p-0' : 'rounded-full py-2 px-3' 
  );

  return (
    <div className={container}>
      <div className={avatar}>
        {/* Display sender's avatar */}
        <Avatar user={data.sender} /> 
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {/* Display sender's name */}
            {data.sender.name} 
          </div>
          <div className="text-xs text-gray-400">
            {/* Display message timestamp */}
            {format(new Date(data.createdAt), 'p')} 
          </div>
        </div>
        <div className={message}>
          <ImageModal
            // Source URL of the image
            src={data.image} 
            // Control modal open state
            isOpen={imageModalOpen} 
            // Handle modal close
            onClose={() => setImageModalOpen(false)} 
          />
          {data.image ? (
            <Image
              // Handle image click to open modal
              onClick={() => setImageModalOpen(true)} 
              alt="Image"
              height="288"
              width="288"
              src={data.image}
              className="
                object-cover
                cursor-pointer
                hover:scale-110
                transition
                translate
              "
            />
          ) : (
            // Display message body if no image is present
            <div>{data.body}</div> 
          )}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div
            className="
              text-xs
              font-light
              text-gray-500
            "
          >
            {/* Display seen by list */}
            {`Seen by ${seenList}`} 
          </div>
        )}
      </div>
    </div>
  );
};

// Export the MessageBox component
export default MessageBox; 
