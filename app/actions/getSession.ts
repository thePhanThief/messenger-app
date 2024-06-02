import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/util/authOptions";

// Function to get the server session
export default async function getSession() {
  // Return the server session based on authentication options
  return await getServerSession(authOptions);
}
