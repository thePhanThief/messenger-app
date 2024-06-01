"use client";

// Import necessary types from react-hook-form
import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

// Define properties for the MessageInput component
interface MessageInputProps {
  id: string; // ID for the input element
  placeholder?: string; // Placeholder text for the input
  type?: string; // Type of the input element
  required?: boolean; // Whether the input is required
  register: UseFormRegister<FieldValues>; // Register function from react-hook-form
  errors: FieldErrors; // Validation errors from react-hook-form
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
        id={id} // Set input ID
        type={type} // Set input type
        autoComplete={id} // Set autocomplete attribute
        {...register(id, { required })} // Register the input with react-hook-form
        placeholder={placeholder} // Set placeholder text
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

export default MessageInput; // Export the MessageInput component
