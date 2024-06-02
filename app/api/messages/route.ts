import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

// Asynchronous POST function to handle API requests for creating a new message
export async function POST(request: Request) {
  try {
    // Get the current user details
    const currentUser = await getCurrentUser();
    
    // Parse the JSON body from the request
    const body = await request.json();
    
    // Destructure necessary properties from the body
    const {
      message,
      image,
      conversationId
    } = body;

    // If the current user is not authenticated, return a 401 Unauthorized response
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a new message in the database
    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: {
          connect: {
            id: conversationId
          }
        },
        sender: {
          connect: {
            id: currentUser.id
          }
        },
        seen: {
          connect: {
            id: currentUser.id
          }
        }
      },
      include: {
        seen: true,
        sender: true,
      }
    });

    // Update the conversation with the new message
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id
          }
        }
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true
          }
        }
      }
    });

    // Trigger a Pusher event for the new message
    await pusherServer.trigger(conversationId, 'messages:new', newMessage);

    // Get the last message in the updated conversation
    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    // Trigger a Pusher event for each user in the conversation to update the conversation
    updatedConversation.users.forEach((user) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage]
      });
    });

    // Return the newly created message as JSON
    return NextResponse.json(newMessage);
  } catch (error: any) {
    // Handle any errors during the process
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Internal Error', { status: 500 });
  }
}
