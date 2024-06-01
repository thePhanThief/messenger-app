import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

const getUsers = async () => {
  const session = await getSession(); // Retrieve the current session

  if (!session?.user?.email) {
    return []; // Return an empty array if no session or email is found
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc", // Order users by creation time in descending order
      },
      where: {
        NOT: {
          email: session.user.email // Exclude the current user from the list
        },
      },
    });

    return users; // Return the fetched users
  } catch (error: any) {
    return []; // Return an empty array in case of an error
  }
};

export default getUsers;
