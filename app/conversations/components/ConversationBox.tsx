"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";

import { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/GroupAvatar";

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean; 
}

// Create the ConversationBox component
const ConversationBox: React.FC<ConversationBoxProps> = ({ data, selected }) => {
  // Get the other user in the conversation
  const otherUser = useOtherUser(data); 
  // Get the current session
  const session = useSession(); 
  // Get the router instance
  const router = useRouter(); 

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
    // Handle click to navigate to the conversation
      onClick={handleClick} 
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
      // Apply selected styles if the conversation is selected
        selected ? 'bg-neutral-100' : 'bg-white' 
      )}
    >
      {data.isGroup ? (
        // Display group avatar if it's a group conversation
        <AvatarGroup users={data.users} /> 
      ) : (
        // Display user avatar if it's a single conversation
        <Avatar user={otherUser} /> 
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
               {/* Display conversation name or other user's name */}
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p
                className="
                  text-xs
                  text-gray-400
                  font-light
                "
              >
                {/* Display formatted creation time of the last message */}
                {format(new Date(lastMessage.createdAt), 'p')} 
              </p>
            )}
          </div>
          <p
            className={clsx(`
              truncate
              text-sm
            `,
            // Apply styles based on whether the message has been seen
              hasSeen ? 'text-gray-500' : 'text-black font-medium' 
            )}
          >
            {/* Display the last message text */}
            {lastMessageText} 
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConversationBox; 
