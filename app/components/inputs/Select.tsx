"use client";

import ReactSelect from "react-select";

// Interface for the properties of the Select component.
interface SelectProps {
  disabled?: boolean;
  label: string;
  options: Record<string, any>[];
  onChange: (value: Record<string, any>) => void;
  value?: Record<string, any>;
}

// Create the Select component.
const Select: React.FC<SelectProps> = ({
  disabled,
  label,
  options,
  onChange,
  value,
}) => {
  return (
    <div className="z-[100]">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          // Disables the select if the disabled prop is true.
          isDisabled={disabled}
          // Sets the current value of the select.
          value={value}
          // Function to handle value change.
          onChange={onChange}
          // Allows multiple selections.
          isMulti
          // Options to display in the select.
          options={options}
          // Ensures the select menu portal is appended to the body.
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({
              ...base,
              // Ensures the select menu has a high z-index.
              zIndex: 9999,
            }),
          }}
          classNames={{
            // Adds custom styling to the control.
            control: () => "text-sm",
          }}
        />
      </div>
    </div>
  );
};

// Export the Select component for use in other parts of the application.
export default Select;
