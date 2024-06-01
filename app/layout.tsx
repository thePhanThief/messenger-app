// Import necessary types and components from Next.js and other libraries
import type { Metadata } from "next"; // Import the Metadata type from Next.js
import { Inter } from "next/font/google"; // Import the Inter font from Google Fonts
import "./globals.css"; // Import global CSS styles
import ToasterContext from "./context/ToasterContext"; // Import ToasterContext for managing toast notifications
import AuthContext from "./context/AuthContext"; // Import AuthContext for managing authentication context
import ActiveStatus from "./components/ActiveStatue"; // Import ActiveStatus component for managing user activity status

// Initialize the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  title: "Messenger", // Title of the application
  description: "Messenger", // Description of the application
};

// Define the RootLayout component which wraps the entire application
export default function RootLayout({
  children, // ReactNode elements to be rendered as children within the component
}: Readonly<{
  children: React.ReactNode; // TypeScript type for React children props
}>) {
  return (
    <html lang="en"> {/* Set the language attribute for the HTML document */}
      <body className={inter.className}> {/* Apply the Inter font to the body */}
        <AuthContext> {/* Wrap the application in AuthContext for authentication management */}
          <ToasterContext /> {/* Include ToasterContext for managing toast notifications */}
          <ActiveStatus /> {/* Include ActiveStatus to manage user activity status */}
          {children} {/* Render children elements passed to this component */}
        </AuthContext>
      </body>
    </html>
  );
}
