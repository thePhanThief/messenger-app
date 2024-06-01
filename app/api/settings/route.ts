// Import helper function to get the currently authenticated user
import getCurrentUser from "@/app/actions/getCurrentUser";
// Import NextResponse for API response handling
import { NextResponse } from "next/server";
// Import the Prisma client instance for database interactions
import prisma from "@/app/libs/prismadb"

// Define an asynchronous POST function to handle user settings update
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser(); // Retrieve the current user
    const body = await request.json(); // Parse the request body
    const {
      name,
      image
    } = body; // Destructure the necessary fields from the body

    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 }); // Return unauthorized if no user is found
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image: image,
        name: name,
      },
    });

    return NextResponse.json(updatedUser); // Return the updated user
  } catch (error: any) {
    console.log(error, 'SETTINGS_ERROR');
    return new NextResponse('Internal Error', { status: 500 }); // Return an internal error response
  }
}
