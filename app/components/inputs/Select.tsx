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
          isDisabled={disabled} // Disables the select if the disabled prop is true.
          value={value} // Sets the current value of the select.
          onChange={onChange} // Function to handle value change.
          isMulti // Allows multiple selections.
          options={options} // Options to display in the select.
          menuPortalTarget={document.body} // Ensures the select menu portal is appended to the body.
          styles={{
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999, // Ensures the select menu has a high z-index.
            }),
          }}
          classNames={{
            control: () => "text-sm", // Adds custom styling to the control.
          }}
        />
      </div>
    </div>
  );
};

export default Select; // Export the Select component for use in other parts of the application.
