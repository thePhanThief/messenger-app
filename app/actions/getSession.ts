import { getServerSession } from "next-auth";

import { authOptions } from "@/util/authOptions";

// Define an asynchronous function to get the server session.
export default async function getSession() {
  return await getServerSession(authOptions); // Return the server session based on authentication options
}
