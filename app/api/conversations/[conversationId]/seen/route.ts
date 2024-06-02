import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Function to mark messages as seen in a conversation
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    // Check if the user is authenticated and has an email
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the conversation with the given ID, including messages and users
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    // Check if the conversation exists
    if (!conversation) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // Return the conversation if there are no messages
    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // Update the last message to mark it as seen by the current user
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Trigger a Pusher event to update the conversation for the current user
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    // Return the conversation if the message was already seen by the user
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    // Trigger a Pusher event to update the message for the conversation
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    // Return the updated message
    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.log(error, "ERROR_MESSAGES_SEEN");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
