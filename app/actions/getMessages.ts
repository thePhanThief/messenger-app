// Import the Prisma client instance from a local module for database operations.
import prisma from "@/app/libs/prismadb";

// Define an asynchronous function to retrieve messages by conversation ID.
const getMessages = async (conversationId: string) => {
  try {
    // Fetch all messages associated with the specified conversation ID from the database.
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId, // Filter messages by conversation ID.
      },
      include: {
        sender: true, // Include details about the sender from the User model.
        seen: true,  // Include information on which users have seen each message.
      },
      orderBy: {
        createdAt: "asc", // Order messages by creation time in ascending order for chronological sorting.
      },
    });

    // Return the fetched messages if the query is successful.
    return messages;
  } catch (error: any) {
    console.error("Failed to retrieve messages:", error); // Log any errors that occur during the fetch operation.
    return []; // Return an empty array if there is an error, to maintain consistent function output type.
  }
};

// Export the getMessages function so it can be used elsewhere in the application.
export default getMessages;
