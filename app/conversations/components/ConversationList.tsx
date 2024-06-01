"use client";

// Import necessary libraries and hooks
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineGroupAdd } from "react-icons/md";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";

import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

// Define the properties for the ConversationList component
interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

// Create the ConversationList component
const ConversationList: React.FC<ConversationListProps> = ({ initialItems, users }) => {
  const session = useSession(); // Get the current session
  const [items, setItems] = useState(initialItems); // State to manage conversation items
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal open/close

  const router = useRouter(); // Get the router instance

  const { conversationId, isOpen } = useConversation(); // Custom hook to get the current conversation state

  // Get the pusher key based on the user's email
  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  // UseEffect hook to subscribe to Pusher events
  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }
        return [conversation, ...current];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) => current.map((currentConversation) => {
        if (currentConversation.id === conversation.id) {
          return {
            ...currentConversation,
            messages: conversation.messages,
          };
        }
        return currentConversation;
      }));
    };

    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)];
      });

      if (conversationId === conversation.id) {
        router.push('/conversations');
      }
    };

    pusherClient.bind('conversation:new', newHandler);
    pusherClient.bind('conversation:update', updateHandler);
    pusherClient.bind('conversation:remove', removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind('conversation:new', newHandler);
      pusherClient.unbind('conversation:update', updateHandler);
      pusherClient.unbind('conversation:remove', removeHandler);
    };
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <GroupChatModal
        users={users} // Pass users to the GroupChatModal
        isOpen={isModalOpen} // Pass modal open state to the GroupChatModal
        onClose={() => setIsModalOpen(false)} // Function to close the modal
      />
      <aside
        className={clsx(`
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
        `,
          isOpen ? 'hidden' : 'block w-full left-0' // Apply styles based on whether the conversation is open
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="
              text-2xl
              font-bold
              text-neutral-800
            ">
              Messages
            </div>
            <div
              onClick={() => setIsModalOpen(true)} // Open the modal on click
              className="
                rounded-full
                p-2
                bg-gray-100
                text-gray-600
                cursor-pointer
                hover:opacity-75
                transition
              "
            >
              <MdOutlineGroupAdd size={20} /> {/* Icon for adding a group */}
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              key={item.id} // Unique key for each conversation
              data={item} // Pass conversation data to ConversationBox
              selected={conversationId === item.id} // Pass selected state to ConversationBox
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList; // Export the ConversationList component
