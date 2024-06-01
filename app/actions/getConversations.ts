import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConversations = async () => {
  const currentUser = await getCurrentUser(); // Retrieve the current user

  if (!currentUser?.id) {
    return []; // Return an empty array if no authenticated user is found
  }

  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc' // Order by the last message time in descending order
      },
      where: {
        userIds: {
          has: currentUser.id // Include conversations where the current user is a participant
        }
      },
      include: {
        users: true, // Include related user data
        messages: {
          include: {
            sender: true, // Include the sender of each message
            seen: true // Include users who have seen each message
          }
        }
      }
    });

    return conversations; // Return the fetched conversations
  } catch (error: any) {
    return []; // Return an empty array in case of an error
  }
};

export default getConversations;
