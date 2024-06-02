import prisma from "@/app/libs/prismadb";

// Function to retrieve messages by conversation ID
const getMessages = async (conversationId: string) => {
  try {
    // Fetch all messages associated with the specified conversation ID from the database
    const messages = await prisma.message.findMany({
      where: {
        // Filter messages by conversation ID
        conversationId: conversationId,
      },
      include: {
        // Include details about the sender from the User model
        sender: true,
        // Include information on which users have seen each message
        seen: true,
      },
      orderBy: {
        // Order messages by creation time in ascending order for chronological sorting
        createdAt: "asc",
      },
    });

    // Return the fetched messages if the query is successful
    return messages;
  } catch (error: any) {
    // Log any errors that occur during the fetch operation
    console.error("Failed to retrieve messages:", error);
    // Return an empty array if there is an error, to maintain consistent function output type
    return [];
  }
};

// Export the getMessages function
export default getMessages;
