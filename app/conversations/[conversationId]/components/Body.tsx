"use client";

// Import necessary hooks and libraries
import useConversation from "@/app/hooks/useConversation"; // Custom hook to get conversation details
import { FullMessageType } from "@/app/types"; // Import type for messages
import { useEffect, useRef, useState } from "react"; // Import React hooks
import MessageBox from "./MessageBox"; // Import MessageBox component
import axios from "axios"; // Import axios for making HTTP requests
import { pusherClient } from "@/app/libs/pusher"; // Import Pusher client for real-time updates
import { find } from "lodash"; // Import find function from lodash

// Define properties for the Body component
interface BodyProps {
  initialMessages: FullMessageType[]; // Array of initial messages
}

// Create the Body component
const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages); // State to store messages
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the scroll container
  const { conversationId } = useConversation(); // Get conversation ID from custom hook

  // Mark the conversation as seen when component mounts
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // Subscribe to Pusher events for new and updated messages
  useEffect(() => {
    pusherClient.subscribe(conversationId); // Subscribe to Pusher channel for this conversation

    // Handler for new messages
    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`); // Mark conversation as seen

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current; // If message already exists, return current messages
        }
        return [...current, message]; // Add new message to messages
      });
    };

    // Handler for updated messages
    const updatedMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage; // Update message if IDs match
          }
          return currentMessage; // Return current message otherwise
        })
      );
    };

    // Bind handlers to Pusher events
    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updatedMessageHandler);

    // Cleanup: Unsubscribe and unbind handlers on component unmount
    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updatedMessageHandler);
    };
  }, [conversationId]);

  // Scroll to the bottom of the container whenever the messages state updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1} // Check if this is the last message
          key={message.id} // Unique key for each message
          data={message} // Message data passed to MessageBox component
        />
      ))}
    </div>
  );
};

export default Body; // Export the Body component
