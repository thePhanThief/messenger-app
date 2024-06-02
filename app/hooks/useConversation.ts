import { useParams } from "next/navigation"; 
import { useMemo } from "react";

 
//A custom hook for managing and accessing conversation data based on URL parameters.
const useConversation = () => {
  // Retrieve route parameters using useParams hook from Next.js
  const params = useParams();

  // Memoize the extraction of conversation ID from route parameters to avoid unnecessary computations
  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      // Return an empty string if no conversation ID is found
      return ""; 
    }
    // If found, cast it to a string and return
    return params.conversationId as string; 
  }, [params?.conversationId]);

  // Memoize a boolean indicating whether the conversation ID is present (true if present)
  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  // Return the computed values wrapped in another useMemo for optimal performance
  return useMemo(() => ({
    // Boolean indicating if the conversation screen should be open
    isOpen, 
    // The actual conversation ID from parameters
    conversationId 
  }), [isOpen, conversationId]);
};

// Export the useConversation hook for use elsewhere in the application
export default useConversation;