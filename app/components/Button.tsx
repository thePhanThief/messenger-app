"use client";

import clsx from "clsx"; // Import clsx for conditionally joining classNames together
import { FC } from "react"; // Import FC type from React

// Define the button properties interface.
interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined; // Button type, default not explicitly set here.
  fullWidth?: boolean; // Boolean to control if the button should take full width.
  children?: React.ReactNode; // Children to render inside the button.
  onClick?: () => void; // Function to call on button click.
  secondary?: boolean; // Boolean to apply secondary button styles.
  danger?: boolean; // Boolean to apply danger button styles.
  disabled?: boolean; // Boolean to disable the button.
}

// Create the button component.
const Button: FC<ButtonProps> = ({
  type = "button", // Default button type to 'button'.
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
}) => {
  return (
    <button
      type={type} // Set the button type
      onClick={onClick} // Set the onClick handler
      disabled={disabled} // Disable the button if disabled is true
      className={clsx(
        "inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        disabled && "opacity-50 cursor-default", // Apply styles for disabled state
        fullWidth && "w-full", // Apply styles for full width
        secondary ? "text-gray-900" : "text-white", // Apply styles for secondary or primary button
        danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600", // Apply styles for danger button
        !secondary && !danger && "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600" // Apply styles for primary button
      )}
    >
      {children} {/* Render children inside the button */}
    </button>
  );
};

export default Button; // Export the Button component
