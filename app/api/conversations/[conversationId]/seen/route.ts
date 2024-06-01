import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { connect } from "http2";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Define an asynchronous POST function to mark messages as seen in a conversation
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser(); // Retrieve the current user
    const { conversationId } = params; // Destructure the conversation ID from parameters

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 }); // Return unauthorized if no user is found
    }

    // Find the conversation with the given ID, including messages and users
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true, // Include information on users who have seen each message
          },
        },
        users: true, // Include user details
      },
    });

    if (!conversation) {
      return new NextResponse("Invalid ID", { status: 400 }); // Return invalid ID if no conversation is found
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1]; // Get the last message in the conversation

    if (!lastMessage) {
      return NextResponse.json(conversation); // Return the conversation if there are no messages
    }

    // Update the last message to mark it as seen by the current user
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true, // Include sender details
        seen: true, // Include seen information
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id, // Connect the current user's ID to the seen field
          },
        },
      },
    });

    // Trigger a Pusher event to update the conversation for the current user
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation); // Return the conversation if the message was already seen by the user
    }

    // Trigger a Pusher event to update the message for the conversation
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    return NextResponse.json(updatedMessage); // Return the updated message
  } catch (error: any) {
    console.log(error, "ERROR_MESSAGES_SEEN"); // Log the error
    return new NextResponse("Internal Error", { status: 500 }); // Return an internal error response
  }
}
