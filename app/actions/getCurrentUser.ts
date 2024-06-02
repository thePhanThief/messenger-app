import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

// Function to retrieve the current user
const getCurrentUser = async () => {
  try {
    // Retrieve the current session
    const session = await getSession();

    // Check if the session has a user email
    if (!session?.user?.email) {
      // Return null if no session or email is found
      return null;
    }

    // Find the user by their email
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    // Return the current user
    return currentUser;
  } catch (error: any) {
    // Return null in case of an error
    return null;
  }
};

// Export the function
export default getCurrentUser;
