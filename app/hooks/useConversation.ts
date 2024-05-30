// Import necessary hooks from libraries
import { useParams } from "next/navigation"; // Import useParams to access route parameters in Next.js applications
import { useMemo } from "react"; // Import useMemo to optimize performance by memorizing expensive computations

/**
 * A custom hook for managing and accessing conversation data based on URL parameters.
 *
 * @returns An object containing the conversation ID if present and a boolean indicating if the conversation is open.
 */
const useConversation = () => {
  // Retrieve route parameters using useParams hook from Next.js
  const params = useParams();

  // Memoize the extraction of conversation ID from route parameters to avoid unnecessary computations
  const conversationId = useMemo(() => {
    // Check if the conversationId parameter is present
    if (!params?.conversationId) {
      return ""; // Return an empty string if no conversation ID is found
    }

    // If found, cast it to a string and return
    return params.conversationId as string;
  }, [params?.conversationId]); // Depend on params.conversationId for re-computation

  // Memoize a boolean indicating whether the conversation ID is present (true if present)
  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  // Return the computed values wrapped in another useMemo for optimal performance
  return useMemo(() => ({
    isOpen, // Boolean indicating if the conversation screen should be open
    conversationId // The actual conversation ID from parameters
  }), [isOpen, conversationId]); // Depend on isOpen and conversationId for re-computation
};

// Export the useConversation hook for use elsewhere in the application
export default useConversation;
