import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Define an asynchronous DELETE function to handle conversation deletion
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const { conversationId } = params; // Destructure the conversation ID from parameters
    const currentUser = await getCurrentUser(); // Retrieve the current user

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 }); // Return unauthorized if no user is found
    }

    // Find the existing conversation with the given ID, including user details
    const existingConversation = await prisma?.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!existingConversation) {
      return new NextResponse("Invalid ID", { status: 400 }); // Return invalid ID if no conversation is found
    }

    // Delete the conversation if the current user is a participant
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    // Notify all users in the conversation about the deletion
    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:remove", existingConversation);
      }
    });

    return NextResponse.json(deletedConversation); // Return the deleted conversation
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_DELETE"); // Log the error
    return new NextResponse("Internal Error", { status: 500 }); // Return an internal error response
  }
}
