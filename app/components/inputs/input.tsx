"use client";

import clsx from "clsx"; 
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"; 

// Interface for the properties of the input component.
interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  // Function to register input in react-hook-form.
  register: UseFormRegister<FieldValues>; 
  // Object containing any errors for the fields in the form.
  errors: FieldErrors;
  disabled?: boolean;
}

// Create the input component.
const Input: React.FC<InputProps> = ({
  label,
  id,
  // Default input type to text if not specified.
  type = "text", 
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
        // Associates the label with the input field using the id.
        htmlFor={id} 
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          // Uses the id for autoComplete attribute to match label.
          autoComplete={id} 
          // Disables input if disabled prop is true.
          disabled={disabled} 
          // Registers the input for validation and form data management, marking it as required if necessary.
          {...register(id, { required })} 
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
            // Adds error styling if there's an error for this field.
            errors[id] && "focus:ring-rose-500", 
            // Adjusts styling if input is disabled.
            disabled && "opacity-50 cursor-default" 
          )}
        />
      </div>
    </div>
  );
};

// Export the Input component for use in other parts of the application.
export default Input; 
