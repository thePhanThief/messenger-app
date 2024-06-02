"use client";

import { SessionProvider } from "next-auth/react"; 

// Define the properties for the AuthContext component
interface AuthContextProps {
  // Children elements to be rendered inside the context
  children: React.ReactNode; 
}

// Create the AuthContext component to provide authentication context
export default function AuthContext({ children }: AuthContextProps) {
  // Wrap children with SessionProvider to provide session context
  return <SessionProvider>{children}</SessionProvider>; 
}
