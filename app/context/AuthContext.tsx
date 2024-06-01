"use client";

import { SessionProvider } from "next-auth/react"; // Import SessionProvider from next-auth/react to provide session context

// Define the properties for the AuthContext component
interface AuthContextProps {
  children: React.ReactNode; // Children elements to be rendered inside the context
}

// Create the AuthContext component to provide authentication context
export default function AuthContext({ children }: AuthContextProps) {
  return <SessionProvider>{children}</SessionProvider>; // Wrap children with SessionProvider to provide session context
}
