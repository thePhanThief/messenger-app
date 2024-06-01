"use client";

// Import necessary components and hooks
import Avatar from "@/app/components/Avatar"; // Import Avatar component
import { FullMessageType } from "@/app/types"; // Import FullMessageType type
import clsx from "clsx"; // Import clsx for conditional class names
import { useSession } from "next-auth/react"; // Import useSession from next-auth/react for session management
import { format } from "date-fns"; // Import format from date-fns for date formatting
import Image from "next/image"; // Import Image component from Next.js
import { useState } from "react"; // Import useState hook from React
import ImageModal from "./ImageModal"; // Import ImageModal component

// Define properties for the MessageBox component
interface MessageBoxProps {
  data: FullMessageType; // Message data
  isLast?: boolean; // Boolean to check if this is the last message
}

// Create the MessageBox component
const MessageBox: React.FC<MessageBoxProps> = ({
  data,
  isLast
}) => {
  const session = useSession(); // Get the current session
  const [imageModalOpen, setImageModalOpen] = useState(false); // State to handle image modal open/close

  const isOwn = session?.data?.user?.email === data?.sender?.email; // Check if the message is sent by the current user
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(', '); // List of users who have seen the message

  const container = clsx(
    "flex gap-3 p-4",
    isOwn && "justify-end" // Align message to the right if it's sent by the current user
  );

  const avatar = clsx(isOwn && "order-2"); // Position avatar based on the sender

  const body = clsx(
    "flex flex-col gap-2",
    isOwn && "items-end" // Align message body to the right if it's sent by the current user
  );

  const message = clsx(
    "text-sm w-fit overflow-hidden",
    isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100', // Apply different styles based on the sender
    data.image ? 'rounded-md p-0' : 'rounded-full py-2 px-3' // Apply different styles if the message contains an image
  );

  return (
    <div className={container}>
      <div className={avatar}>
        <Avatar user={data.sender} /> {/* Display sender's avatar */}
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {data.sender.name} {/* Display sender's name */}
          </div>
          <div className="text-xs text-gray-400">
            {format(new Date(data.createdAt), 'p')} {/* Display message timestamp */}
          </div>
        </div>
        <div className={message}>
          <ImageModal
            src={data.image} // Source URL of the image
            isOpen={imageModalOpen} // Control modal open state
            onClose={() => setImageModalOpen(false)} // Handle modal close
          />
          {data.image ? (
            <Image
              onClick={() => setImageModalOpen(true)} // Handle image click to open modal
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
            <div>{data.body}</div> // Display message body if no image is present
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
            {`Seen by ${seenList}`} {/* Display seen by list */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox; // Export the MessageBox component
