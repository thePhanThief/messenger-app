"use client";

import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

// Define properties for the MessageInput component
interface MessageInputProps {
  // ID for the input element
  id: string; 
  // Placeholder text for the input
  placeholder?: string; 
  // Type of the input element
  type?: string; 
  // Whether the input is required
  required?: boolean; 
  // Register function from react-hook-form
  register: UseFormRegister<FieldValues>; 
  // Validation errors from react-hook-form
  errors: FieldErrors; 
}

// Create the MessageInput component
const MessageInput: React.FC<MessageInputProps> = ({
  id,
  placeholder,
  type,
  required,
  register,
  errors,
}) => {
  return (
    <div className="relative w-full">
      <input
        // Set input ID
        id={id} 
        // Set input type
        type={type} 
        // Set autocomplete attribute
        autoComplete={id} 
        // Register the input with react-hook-form
        {...register(id, { required })} 
        // Set placeholder text
        placeholder={placeholder} 
        className="
          text-black
          font-light
          py-2
          px-4
          bg-neutral-100
          w-full
          rounded-full
          focus:outline-none
        "
      />
    </div>
  );
};

// Export the MessageInput component
export default MessageInput; 
