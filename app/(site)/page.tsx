import Image from "next/image";
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
          alt="Logo"
          height="65"
          width="65"
          className="mx-auto w-auto"
          src="/images/logo.png"
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
      <AuthForm />
    </div>
  );
}
