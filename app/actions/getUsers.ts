import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

// Function to retrieve all users excluding the current user
const getUsers = async () => {
  // Retrieve the current session
  const session = await getSession();

  // Return an empty array if no session or email is found
  if (!session?.user?.email) {
    return [];
  }

  try {
    // Fetch all users from the database excluding the current user
    const users = await prisma.user.findMany({
      orderBy: {
        // Order users by creation time in descending order
        createdAt: "desc",
      },
      where: {
        NOT: {
          // Exclude the current user from the list
          email: session.user.email,
        },
      },
    });

    // Return the fetched users
    return users;
  } catch (error: any) {
    // Return an empty array in case of an error
    return [];
  }
};

// Export the function
export default getUsers;
