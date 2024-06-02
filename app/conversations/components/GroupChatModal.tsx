"use client";

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
  // Get the router instance
  const router = useRouter(); 
  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false); 

  // Set up the form using react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      // Default value for the group name
      name: "", 
      // Default value for the members array
      members: [], 
    },
  });

  // Watch the members field
  const members = watch("members"); 

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Set loading state to true
    setIsLoading(true); 

    axios
      .post("/api/conversations", {
        ...data,
        // Indicate that this is a group conversation
        isGroup: true, 
      })
      .then(() => {
        // Refresh the page on success
        router.refresh(); 
        // Close the modal on success
        onClose(); 
      })
      // Show error toast on failure
      .catch(() => toast.error("Something went wrong")) 
      .finally(() => {
        // Set loading state to false
        setIsLoading(false); 
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
                // Register the input field with react-hook-form
                register={register} 
                // Label for the input field
                label="name" 
                // ID for the input field
                id="name" 
                // Disable the input field if loading
                disabled={isLoading} 
                // Mark the input field as required
                required 
                // Pass any validation errors
                errors={errors} 
              />
              <Select
                // Disable the select field if loading
                disabled={isLoading} 
                // Label for the select field
                label="Members" 
                // Map users to options for the select field
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))} 
                // Handle value change for the select field
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                } 
                // Value of the select field
                value={members} 
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

export default GroupChatModal; 
