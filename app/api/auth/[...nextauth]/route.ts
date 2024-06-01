import {authOptions} from "@/util/authOptions"
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions); // Create the NextAuth handler with the authentication options

export { handler as GET, handler as POST }; // Export the handler for GET and POST requests