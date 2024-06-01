// Import the Image component from Next.js for optimized images
import Image from "next/image";
// Import the AuthForm component for user authentication
import AuthForm from "./components/AuthForm";

// Define the Home component which renders the main page
export default function Home() {
  return (
    <div
      className="
        flex
        min-h-full
        flex-col
        justify-center
        py-12
        sm:px-6
        lg:px-8
        bg-gray-100
      "
    >
      {/* Container for the logo and heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Image
          alt="Logo" // Alt text for accessibility
          height="65" // Height of the logo
          width="65" // Width of the logo
          className="mx-auto w-auto" // Center the logo and ensure it doesn't stretch
          src="/images/logo.png" // Source of the logo image
        />
        {/* Heading */}
        <h2
          className="
            mt-6
            text-center
            text-3xl
            font-bold
            tracking-tight
            text-gray-900
          "
        >
          Sign into your account
        </h2>
      </div>
      {/* Auth Form */}
      <AuthForm /> {/* Component to handle user authentication */}
    </div>
  );
}
