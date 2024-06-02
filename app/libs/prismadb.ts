import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the PrismaClient instance
// Use the existing instance if it exists, otherwise create a new one
const client = globalThis.prisma || new PrismaClient();

// In development mode, assign the PrismaClient instance to the global variable
if (process.env.NODE_ENV !== "production") global.prisma = client;

// Export the PrismaClient instance for use in other parts of the application
export default client;
