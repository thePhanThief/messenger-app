"use client";

import useConversation from "@/app/hooks/useConversation"; 
import { FullMessageType } from "@/app/types"; 
import { useEffect, useRef, useState } from "react"; 
import MessageBox from "./MessageBox"; 
import axios from "axios"; 
import { pusherClient } from "@/app/libs/pusher"; 
import { find } from "lodash"; 

// Define properties for the Body component
interface BodyProps {
  initialMessages: FullMessageType[]; // Array of initial messages
}

// Create the Body component
const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  // State to store messages
  const [messages, setMessages] = useState(initialMessages); 
  // Reference to the scroll container
  const containerRef = useRef<HTMLDivElement>(null); 
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 

  // Mark the conversation as seen when component mounts
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // Subscribe to Pusher events for new and updated messages
  useEffect(() => {
    // Subscribe to Pusher channel for this conversation
    pusherClient.subscribe(conversationId); 

    // Handler for new messages
    const messageHandler = (message: FullMessageType) => {
      // Mark conversation as seen
      axios.post(`/api/conversations/${conversationId}/seen`); 

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          // If message already exists, return current messages
          return current; 
        }
        // Add new message to messages
        return [...current, message]; 
      });
    };

    // Handler for updated messages
    const updatedMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            // Update message if IDs match
            return newMessage; 
          }
          // Return current message otherwise
          return currentMessage; 
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
          // Check if this is the last message
          isLast={i === messages.length - 1} 
          // Unique key for each message
          key={message.id} 
          // Message data passed to MessageBox component
          data={message} 
        />
      ))}
    </div>
  );
};

// Export the Body component
export default Body; 
