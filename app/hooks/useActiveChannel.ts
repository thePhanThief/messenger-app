import { Channel, Members } from "pusher-js"; 
import useActiveList from "./useActiveList"; 
import { useEffect, useState } from "react"; 
import { pusherClient } from "../libs/pusher"; 

// Custom hook for managing active channel state
const useActiveChannel = () => {
  // Destructure set, add, and remove functions from useActiveList
  const { set, add, remove } = useActiveList(); 
  // State to manage the active channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null); 

  useEffect(() => {
    // Reference to the active channel
    let channel = activeChannel; 

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
      // Set the initial members list in the active list state
      set(initialMembers); 
    });

    // Handle member added event
    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      // Add the new member to the active list
      add(member.id); 
    });

    // Handle member removed event
    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      // Remove the member from the active list
      remove(member.id); 
    });

    // Cleanup function to unsubscribe from the Pusher channel
    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe('presence-messenger');
        setActiveChannel(null);
      }
    };
  }, [activeChannel, set, add, remove]); // Dependency array for useEffect

  // Return null as this hook does not return a value
  return null; 
};

export default useActiveChannel; // Export the custom hook
