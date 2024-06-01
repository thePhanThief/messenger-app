// Import bcrypt for password hashing
import bcrypt from "bcrypt";
// Import NextAuth and related types for authentication
import { AuthOptions } from "next-auth";
// Import credential and social providers for NextAuth
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
// Import PrismaAdapter to integrate Prisma with NextAuth
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// Import the Prisma client instance for database interactions
import prisma from "@/app/libs/prismadb";

// Define the authentication configuration
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma), // Use Prisma adapter for database management
  providers: [
    // Define authentication providers
    GithubProvider({
      // GitHub OAuth provider configuration
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      // Google OAuth provider configuration
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      // Custom credentials provider for email and password
      name: "credentials",
      credentials: {
        // Define the fields required for credentials
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        // Function to authenticate the user with email and password
        if (!credentials?.email || !credentials?.password) {
          // Validate input credentials
          throw new Error("Invalid Credentials");
        }
        const user = await prisma.user.findUnique({
          // Retrieve the user from the database
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.hashedPassword) {
          // Check if user exists and has a hashed password
          throw new Error("Invalid Credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          // Verify the password against the hashed password
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          // Password does not match
          throw new Error("Invalid Credentials");
        }

        return user; // Return user object if authentication succeeds
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  session: {
    // Configure session management
    strategy: "jwt", // Use JWT for session strategy
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for NextAuth to sign tokens
};
