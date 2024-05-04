// Importing required modules and functions
import getCurrentUser from "@/app/actions/getCurrentUser"; // Import the getCurrentUser function from a local module
import { NextResponse } from "next/server"; // Import NextResponse for handling responses in Next.js API routes
import prisma from "@/app/libs/prismadb"; // Import prisma client for database interactions
import { pusherServer } from "@/app/libs/pusher";

// Asynchronous POST function to handle API requests
export async function POST(request: Request) {
  try {
    // Get the current user details
    const currentUser = await getCurrentUser();
    // Parse the JSON body from the request
    const body = await request.json();
    // Destructure necessary properties from the body
    const { userId, isGroup, members, name } = body;

    // Check if the current user is authenticated
    if (!currentUser?.id || !currentUser?.email) {
      // If not authenticated, return a 401 Unauthorized response
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the request is to create a group without valid data
    if (isGroup && (!members || members.length < 2 || !name)) {
      // Return a 400 Bad Request response if data validation fails
      return new NextResponse("Invalid data", { status: 400 });
    }

    // If the request is to create a group
    if (isGroup) {
      // Create a new conversation in the database
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });
      newConversation.users.forEach((user)=> {
        if(user.email) {
          pusherServer.trigger(user.email, 'conversation:new' , newConversation)
        }
      })

      // Return the newly created conversation as JSON
      return NextResponse.json(newConversation);
    }

    // If the request is to create a single conversation, first find existing ones
    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    // Check if there is already an existing conversation
    const singleConversation = existingConversations[0];
    if (singleConversation) {
      // If it exists, return it
      return NextResponse.json(singleConversation);
    }

    // If no existing conversation, create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    newConversation.users.map((user)=> {
      if(user.email) {
        pusherServer.trigger(user.email, 'conversation:new' , newConversation)
      } 
    })

    // Return the newly created conversation as JSON
    return NextResponse.json(newConversation);
  } catch (error: any) {
    // Handle any errors during the process
    return new NextResponse("InternalError", { status: 500 });
  }
}
