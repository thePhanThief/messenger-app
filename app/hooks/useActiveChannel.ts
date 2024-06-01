// Import necessary hooks and libraries
import { Channel, Members } from "pusher-js"; // Import Channel and Members types from pusher-js
import useActiveList from "./useActiveList"; // Import custom hook for managing the active list
import { useEffect, useState } from "react"; // Import useEffect and useState hooks from React
import { pusherClient } from "../libs/pusher"; // Import pusher client instance

// Custom hook for managing active channel state
const useActiveChannel = () => {
  const { set, add, remove } = useActiveList(); // Destructure set, add, and remove functions from useActiveList
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null); // State to manage the active channel

  useEffect(() => {
    let channel = activeChannel; // Reference to the active channel

    // Subscribe to the Pusher channel if not already subscribed
    if (!channel) {
      channel = pusherClient.subscribe('presence-messenger');
      setActiveChannel(channel);
    }

    // Bind event handlers for the Pusher channel
    channel.bind('pusher:subscription_succeeded', (members: Members) => {
      const initialMembers: string[] = [];

      // Add each member to the initial members list
      members.each((member: Record<string, any>) => initialMembers.push(member.id));
      set(initialMembers); // Set the initial members list in the active list state
    });

    // Handle member added event
    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id); // Add the new member to the active list
    });

    // Handle member removed event
    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id); // Remove the member from the active list
    });

    // Cleanup function to unsubscribe from the Pusher channel
    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe('presence-messenger');
        setActiveChannel(null);
      }
    };
  }, [activeChannel, set, add, remove]); // Dependency array for useEffect

  return null; // Return null as this hook does not return a value
};

export default useActiveChannel; // Export the custom hook
