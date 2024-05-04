// Import the Prisma client instance from a local module for database operations.
import prisma from "@/app/libs/prismadb";

// Import a helper function to get the currently authenticated user.
import getCurrentUser from "./getCurrentUser";

// Define an asynchronous function to retrieve a conversation by its ID.
const getConversationById = async (conversationId: string) => {
  try {
    // Retrieve the current user and ensure they have a valid email.
    const currentUser = await getCurrentUser();
    if (!currentUser?.email) {
      return null; // Return null if no authenticated user is found or if they lack an email.
    }

    // Fetch the conversation from the database that matches the given ID.
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId, // Specify the conversation ID as the condition for the query.
      },
      include: {
        users: true, // Include related user data in the response.
      },
    });

    // Return the fetched conversation.
    return conversation;
  } catch (error: any) {
    return null; // Return null in case of an error.
  }
};

// Export the function to make it available for import in other parts of the application.
export default getConversationById;
