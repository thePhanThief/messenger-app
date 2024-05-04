// Import necessary hooks and types
import { useSession } from "next-auth/react"; // Import useSession from next-auth for session management
import { FullConversationType } from "../types"; // Import a type that presumably includes conversation specifics
import { User } from "@prisma/client"; // Import the User type from Prisma's client
import { useMemo } from "react"; // Import useMemo to optimize performance by memoizing values

/**
 * A custom React hook to determine the 'other user' in a conversation.
 * 
 * @param conversation - A conversation object that either fully fits the FullConversationType or
 *                       has at least a users array containing User objects.
 * @returns - The user object of the conversation partner other than the logged-in user.
 */
const useOtherUser = (
  conversation:
    | FullConversationType
    | {
        users: User[];
      }
) => {
  // Retrieve the current session, including user data if logged in
  const session = useSession();

  // Memoize calculation of the other user in the conversation to avoid unnecessary re-computations
  const OtherUser = useMemo(() => {
    // Extract the current user's email from the session
    const currentUserEmail = session?.data?.user?.email;

    // Filter out the current user from the conversation's users array to find the other user
    const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail)
  
    return otherUser; // Return the other user found
  }, [session?.data?.user?.email, conversation.users]); // Dependencies for memoization

  return OtherUser[0]; // Return the memoized other user
};

// Export the useOtherUser hook for use in other parts of the application
export default useOtherUser;
