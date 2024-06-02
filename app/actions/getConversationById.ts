import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

// Function to retrieve a conversation by its ID
const getConversationById = async (conversationId: string) => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user is authenticated and has an email
    if (!currentUser?.email) {
      // Return null if no authenticated user is found or if they lack an email
      return null;
    }

    // Fetch the conversation from the database using the conversation ID
    const conversation = await prisma.conversation.findUnique({
      where: {
        // Condition to find the specific conversation
        id: conversationId, 
      },
      include: {
        // Include related users in the conversation
        users: true, 
      },
    });

    // Return the fetched conversation
    return conversation;
  } catch (error: any) {
    // Return null in case of an error
    return null;
  }
};

// Export the function
export default getConversationById;
