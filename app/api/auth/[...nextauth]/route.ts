import { authOptions } from "@/app/api/auth/[...nextauth]/util/authOptions";
import NextAuth from "next-auth/next";

// Create the NextAuth handler with the authentication options
const handler = NextAuth(authOptions);

 // Export the handler for GET and POST requests
export { handler as GET, handler as POST };
