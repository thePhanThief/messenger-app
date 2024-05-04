"use client";

import clsx from "clsx"; // Import clsx for conditionally joining classNames together.
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"; // Import types from react-hook-form.

// Interface for the properties of the input component.
interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>; // Function to register input in react-hook-form.
  errors: FieldErrors; // Object containing any errors for the fields in the form.
  disabled?: boolean;
}

// Create the input component.
const Input: React.FC<InputProps> = ({
  label,
  id,
  type = "text", // Default input type to text if not specified.
  required,
  register,
  errors,
  disabled,
}) => {
  return (
    <div>
      <label
        className="
            block
            text-sm
            font-medium 
            leading-6 
            text-gray-900
        "
        htmlFor={id} // Associates the label with the input field using the id.
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          autoComplete={id} // Uses the id for autoComplete attribute to match label.
          disabled={disabled} // Disables input if disabled prop is true.
          {...register(id, { required })} // Registers the input for validation and form data management, marking it as required if necessary.
          className={clsx(`
          form-input
          block
          w-full
          rounded-md
          border-0
          py-1.5
          text-gray-900
          shadow-sm
          ring-1
          ring-inset
          ring-gray-300
          placeholder:text-gray-400
          focus:ring-2
          focus:ring-inset
          focus:ring-sky-600
          sm:text-sm
          sm:leading-6`,
            errors[id] && "focus:ring-rose-500", // Adds error styling if there's an error for this field.
            disabled && "opacity-50 cursor-default" // Adjusts styling if input is disabled.
          )}
        />
      </div>
    </div>
  );
};

export default Input; // Export the Input component for use in other parts of the application.
