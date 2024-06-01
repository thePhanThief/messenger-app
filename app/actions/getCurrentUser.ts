import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

const getCurrentUser = async () => {
  try {
    const session = await getSession(); // Retrieve the current session

    if (!session?.user?.email) {
      return null; // Return null if no session or email is found
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email, // Find the user by their email
      },
    });

    return currentUser; // Return the current user
  } catch (error: any) {
    return null; // Return null in case of an error
  }
};

export default getCurrentUser;
