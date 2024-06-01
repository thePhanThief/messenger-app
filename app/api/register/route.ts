// Import bcrypt for password hashing
import bcrypt from "bcrypt";

// Import the Prisma client instance for database interactions
import prisma from "@/app/libs/prismadb";
// Import NextResponse for API response handling
import { NextResponse } from "next/server";

// Define an asynchronous POST function to handle user registration
export async function POST(request: Request) {
  try {
    console.log("We're in")
    const body = await request.json(); // Parse the request body
    const { email, name, password } = body; // Destructure the necessary fields from the body

    if (!email || !name || !password) {
      return new NextResponse("Missing info", { status: 400 }); // Return an error if any fields are missing
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Hash the password

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });
    return NextResponse.json(user); // Return the newly created user
  } catch (error: any) {
    console.error("Error message:", error.message); // Log the error message
    console.error("Stack trace:", error.stack); // Log the stack trace
    console.log("REGISTRATION_ERROR");
    return new NextResponse("Internal Error", { status: 500 }); // Return an internal error response
  }
}
