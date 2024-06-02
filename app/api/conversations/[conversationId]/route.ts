import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Function to handle conversation deletion
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const { conversationId } = params; 
    const currentUser = await getCurrentUser(); 

    // Check if the user is authenticated
    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the existing conversation with the given ID
    const existingConversation = await prisma?.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    // Check if the conversation exists
    if (!existingConversation) {
      return new NextResponse("Invalid ID", { status: 400 });
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

    // Return the deleted conversation
    return NextResponse.json(deletedConversation); 
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_DELETE"); 
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}
