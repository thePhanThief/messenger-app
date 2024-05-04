'use client'

import clsx from 'clsx' 
import { FC } from 'react' 

// Define the button properties interface.
interface ButtonProps {
  type?: 'button' | 'submit' | 'reset' | undefined; // Button type, default not explicitly set here.
  fullWidth?: boolean; 
  children?: React.ReactNode; 
  onClick?:()=> void; // Function to call on button click.
  secondary?: boolean; 
  danger?: boolean; 
  disabled?: boolean; 
}

// Create the button component.
const Button: FC<ButtonProps> = ({
    type = 'button', // Default button type to 'button'.
    fullWidth,
    children,
    onClick,
    secondary,
    danger,
    disabled
}) => {
  return(
    <button
    onClick={onClick} // Assign onClick handler.
    type={type} // Set the button's type attribute.
    disabled={disabled} // Disable button if disabled prop is true.
    className={clsx(`
    flex 
    justify-center 
    rounded-md 
    px-3 
    py-2 
    text-sm 
    font-semibold 
    focus-visible:outline 
    focus-visible:outline-2 
    focus-visible:outline-offset-2 
    `, 
    disabled && 'opacity-50 cursor-default', // Apply disabled styles if button is disabled.
    fullWidth && 'w-full', // Make button full width if fullWidth prop is true.
    secondary ? 'text-gray-900' : 'text-white', // Apply secondary or default text color.
    danger && 'bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600', // Apply danger styles if danger prop is true.
    !secondary && !danger && 'bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600' // Default non-danger, non-secondary button styles.
  )}
  >
    {children} {/* Render button children. */}
  </button>
    )
}

export default Button; // Export the Button component for use in other parts of the application.
