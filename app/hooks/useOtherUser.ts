// Import necessary hooks and types
import { useSession } from "next-auth/react"; 
import { FullConversationType } from "../types"; 
import { User } from "@prisma/client"; 
import { useMemo } from "react"; 


// A custom React hook to determine the 'other user' in a conversation.
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
  const otherUser = useMemo(() => {
    // Extract the current user's email from the session
    const currentUserEmail = session?.data?.user?.email;

    // Filter out the current user from the conversation's users array to find the other user
    const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail);
  
    // Return the other user found
    return otherUser; 
  }, [session?.data?.user?.email, conversation.users]);

  // Return the memoized other user
  return otherUser[0]; 
};

// Export the useOtherUser hook for use in other parts of the application
export default useOtherUser;