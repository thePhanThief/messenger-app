import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

// Function to retrieve all conversations of the current user
const getConversations = async () => {
  // Retrieve the current user
  const currentUser = await getCurrentUser();

  // Return an empty array if no authenticated user is found
  if (!currentUser?.id) {
    return [];
  }

  try {
    // Fetch the conversations from the database
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        // Order by the last message time in descending order
        lastMessageAt: 'desc' 
      },
      where: {
        userIds: {
          // Include conversations where the current user is a participant
          has: currentUser.id 
        }
      },
      include: {
        // Include related user data
        users: true, 
        messages: {
          include: {
            // Include the sender of each message
            sender: true, 
            // Include users who have seen each message
            seen: true 
          }
        }
      }
    });

    // Return the fetched conversations
    return conversations; 
  } catch (error: any) {
    // Return an empty array in case of an error
    return [];
  }
};

export default getConversations;
