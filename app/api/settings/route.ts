import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"

// Asynchronous POST function to handle user settings update
export async function POST(request: Request) {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();
    
    // Parse the request body
    const body = await request.json(); 
    
    // Destructure the necessary fields from the body
    const { name, image } = body;

    // Check if the user is authenticated
    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
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
    
    // Return the updated user
    return NextResponse.json(updatedUser); 
  } catch (error: any) {
    console.log(error, 'SETTINGS_ERROR');
    return new NextResponse('Internal Error', { status: 500 });
  }
}
