"use client";

import clsx from "clsx"; 
import { FC } from "react"; 

// Define the button properties interface.
interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined; 
  fullWidth?: boolean; 
  children?: React.ReactNode; 
  onClick?: () => void; 
  secondary?: boolean; 
  danger?: boolean; 
  disabled?: boolean; 
}

// Create the button component.
const Button: FC<ButtonProps> = ({
  type = "button", 
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
}) => {
  return (
    <button
      // Set the button type
      type={type} 
      // Set the onClick handler
      onClick={onClick} 
      // Disable the button if disabled is true
      disabled={disabled} 
      className={clsx(
        "inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        // Apply styles for disabled state
        disabled && "opacity-50 cursor-default", 
        // Apply styles for full width
        fullWidth && "w-full", 
        // Apply styles for secondary or primary button
        secondary ? "text-gray-900" : "text-white", 
        // Apply styles for danger button
        danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600", 
        // Apply styles for primary button
        !secondary && !danger && "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600" 
      )}
    >
      {children} 
    </button>
  );
};

// Export the Button component
export default Button; 
