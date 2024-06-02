import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Asynchronous POST function to handle user registration
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    // Destructure the necessary fields from the body
    const { email, name, password } = body;

    // Check if any fields are missing
    if (!email || !name || !password) {
      // Return an error if any fields are missing
      return new NextResponse("Missing info", { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Return the newly created user
    return NextResponse.json(user);
  } catch (error: any) {
    // Log the error message and stack trace
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.log("REGISTRATION_ERROR");
    // Return an internal error response
    return new NextResponse("Internal Error", { status: 500 });
  }
}
