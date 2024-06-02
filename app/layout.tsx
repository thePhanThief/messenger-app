import type { Metadata } from "next"; 
import { Inter } from "next/font/google"; 
import "./globals.css"; 
import ToasterContext from "./context/ToasterContext";
import AuthContext from "./context/AuthContext"; 
import ActiveStatus from "./components/ActiveStatue"; 

// Initialize the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  // Title of the application
  title: "Messenger", 
  // Description of the application
  description: "Messenger", 
};

// Define the RootLayout component which wraps the entire application
export default function RootLayout({
  // ReactNode elements to be rendered as children within the component
  children, 
}: Readonly<{
  // TypeScript type for React children props
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en"> {/* Set the language attribute for the HTML document */}
    {/* Apply the Inter font to the body */}
      <body className={inter.className}> 
         {/* Wrap the application in AuthContext for authentication management */}
        <AuthContext>
          {/* Include ToasterContext for managing toast notifications */}
          <ToasterContext /> 
          {/* Include ActiveStatus to manage user activity status */}
          <ActiveStatus /> 
          {/* Render childreapp\layout.tsxn elements passed to this component */}
          {children} 
        </AuthContext>
      </body>
    </html>
  );
}
