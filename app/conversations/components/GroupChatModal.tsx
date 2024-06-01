"use client";

// Import necessary hooks and libraries
import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import Select from "@/app/components/inputs/Select";
import Input from "@/app/components/inputs/input";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Define the properties for the GroupChatModal component
interface GroupChatModalProps {
  users: User[];
  isOpen?: boolean;
  onClose: () => void;
}

// Create the GroupChatModal component
const GroupChatModal: React.FC<GroupChatModalProps> = ({
  users,
  isOpen,
  onClose,
}) => {
  const router = useRouter(); // Get the router instance
  const [isLoading, setIsLoading] = useState(false); // State to manage loading state

  // Set up the form using react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "", // Default value for the group name
      members: [], // Default value for the members array
    },
  });

  const members = watch("members"); // Watch the members field

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // Set loading state to true

    axios
      .post("/api/conversations", {
        ...data,
        isGroup: true, // Indicate that this is a group conversation
      })
      .then(() => {
        router.refresh(); // Refresh the page on success
        onClose(); // Close the modal on success
      })
      .catch(() => toast.error("Something went wrong")) // Show error toast on failure
      .finally(() => {
        setIsLoading(false); // Set loading state to false
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12 ">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a new group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-700">
              Create a chat with more than 2 people.
            </p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                register={register} // Register the input field with react-hook-form
                label="name" // Label for the input field
                id="name" // ID for the input field
                disabled={isLoading} // Disable the input field if loading
                required // Mark the input field as required
                errors={errors} // Pass any validation errors
              />
              <Select
                disabled={isLoading} // Disable the select field if loading
                label="Members" // Label for the select field
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))} // Map users to options for the select field
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                } // Handle value change for the select field
                value={members} // Value of the select field
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-3">
          <Button
            disabled={isLoading}
            type="button"
            secondary
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            type="submit"
          >
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal; // Export the GroupChatModal component
