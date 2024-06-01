"use client";

// Import necessary hooks and libraries
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Conversation, Message, User } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";

import { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/GroupAvatar";

// Define the properties for the ConversationBox component
interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean; // Optional boolean to indicate if the conversation is selected
}

// Create the ConversationBox component
const ConversationBox: React.FC<ConversationBoxProps> = ({ data, selected }) => {
  const otherUser = useOtherUser(data); // Get the other user in the conversation
  const session = useSession(); // Get the current session
  const router = useRouter(); // Get the router instance

  // Handle click event to navigate to the conversation
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`);
  }, [data.id, router]);

  // Get the last message in the conversation
  const lastMessage = useMemo(() => {
    const messages = data.messages || [];
    return messages[messages.length - 1];
  }, [data.messages]);

  // Get the current user's email
  const userEmail = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  // Determine if the last message has been seen by the user
  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }
    const seenArray = lastMessage.seen || [];
    if (!userEmail) {
      return false;
    }
    return seenArray.filter((user) => user.email === userEmail).length !== 0;
  }, [userEmail, lastMessage]);

  // Get the text for the last message
  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return 'Sent an image';
    }
    if (lastMessage?.body) {
      return lastMessage.body;
    }
    return "Started a conversation";
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick} // Handle click to navigate to the conversation
      className={clsx(`
        w-full,
        relative
        flex
        items-center
        space-x-3
        hover:bg-neutral-100
        rounded-lg
        transition
        cursor-pointer
        p-3
      `,
        selected ? 'bg-neutral-100' : 'bg-white' // Apply selected styles if the conversation is selected
      )}
    >
      {data.isGroup ? (
        <AvatarGroup users={data.users} /> // Display group avatar if it's a group conversation
      ) : (
        <Avatar user={otherUser} /> // Display user avatar if it's a single conversation
      )}
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
                text-md
                font-medium
                text-gray-900
              "
            >
              {data.name || otherUser.name} {/* Display conversation name or other user's name */}
            </p>
            {lastMessage?.createdAt && (
              <p
                className="
                  text-xs
                  text-gray-400
                  font-light
                "
              >
                {format(new Date(lastMessage.createdAt), 'p')} {/* Display formatted creation time of the last message */}
              </p>
            )}
          </div>
          <p
            className={clsx(`
              truncate
              text-sm
            `,
              hasSeen ? 'text-gray-500' : 'text-black font-medium' // Apply styles based on whether the message has been seen
            )}
          >
            {lastMessageText} {/* Display the last message text */}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConversationBox; // Export the ConversationBox component
