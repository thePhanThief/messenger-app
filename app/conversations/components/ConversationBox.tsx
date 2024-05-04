// Directive to specify that the code should be executed in a client environment.
"use client";

// Importing necessary React hooks and utilities.
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

// TypeScript interface for the properties expected by the ConversationBox component.
interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean;
}

// React functional component to display a conversation in a list or overview.
const ConversationBox: React.FC<ConversationBoxProps> = ({
  data,
  selected,
}) => {
  // Hook to obtain data about the other user in the conversation.
  const otherUser = useOtherUser(data);

  // Hook to manage and access user authentication data.
  const session = useSession();

  // Router hook from Next.js for navigation purposes.
  const router = useRouter();

  // useCallback hook to handle click events and navigate to conversation details.
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`);
  }, [data.id, router]);

  // useMemo hook to determine the last message in the conversation for display.
  const lastMessage = useMemo(() => {
    const messages = data.messages || [];

    return messages[messages.length - 1];
  }, [data.messages]);

  // useMemo hook to fetch the logged-in user's email from session data.
  const userEmail = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data]);

  // useMemo hook to check if the last message has been seen by the logged-in user.
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

  // useMemo hook to generate a text representation of the last message.
  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return "Sent an image";
    }
    if (lastMessage?.body) {
      return lastMessage.body;
    }

    return "Started a conversation";
  }, [lastMessage]);

  // Render the conversation box with conditional styling based on the 'selected' property.
  return (
    <div
      onClick={handleClick}
      className={clsx(
        `
    w-full
    relative
    flex
    items-center
    space-x-3
    hover:bg-neutral-100
    cursor-pointer
    p-3
    `,
        selected ? "bg-neutral-100" : "bg-white"
      )}
    >
      {data.isGroup ? (
        <AvatarGroup users={data.users} />
      ) : (
        <Avatar user={otherUser} />
      )}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-medium text-gray-900">
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p className="text-xs text-gray-400 font-light">
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>
          <p
            className={clsx(
              `
            truncate
            text-sm
          `,
              hasSeen ? "text-gray-500" : "text-black font-medium"
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

// Export the ConversationBox component for use in other parts of the application.
export default ConversationBox;
