"use client";

// Import necessary modules and components
import { User } from "@prisma/client"; // Import User type from Prisma client
import axios from "axios"; // Import axios for making HTTP requests
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation for client-side routing
import { useState } from "react"; // Import useState hook from React
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; // Import necessary functions and types from react-hook-form
import toast from "react-hot-toast"; // Import toast for displaying notifications
import Modal from "../Modal"; // Import Modal component
import Input from "../inputs/input"; // Import Input component
import Image from "next/image"; // Import Image component from Next.js
import { CldUploadButton } from "next-cloudinary"; // Import CldUploadButton for handling image uploads with Cloudinary
import Button from "../Button"; // Import Button component

// Define the properties for the SettingsModal component
interface SettingsModalProps {
  currentUser: User; // The current user object
  isOpen?: boolean; // Boolean to control if the modal is open
  onClose: () => void; // Function to handle closing the modal
}

// Create the SettingsModal component
const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const router = useRouter(); // Initialize useRouter hook for client-side navigation
  const [isLoading, setIsLoading] = useState(false); // State to handle loading state

  // Initialize useForm hook with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name, // Set default value for name
      image: currentUser?.image, // Set default value for image
    },
  });

  const image = watch("image"); // Watch the image field for changes

  // Handle the image upload and set the image value in the form
  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true, // Validate the field after setting the value
    });
  };

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // Set loading state to true

    axios
      .post("/api/settings", data) // Post the data to the API
      .then(() => {
        router.refresh(); // Refresh the page on success
        onClose(); // Close the modal on success
      })
      .catch(() => toast.error("Something went wrong")) // Show error toast on failure
      .finally(() => setIsLoading(false)); // Reset loading state
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Form to handle settings */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Edit your public information.
            </p>

            <div className="mt-10 flex flex-col gap-y-8">
              {/* Input for name */}
              <Input
                disabled={isLoading}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-medium
                    leading-6 
                  text-gray-900
                  "
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    width={48}
                    height={48}
                    className="rounded-full"
                    src={
                      image || currentUser?.image || "/images/placeholder.jpg"
                    }
                    alt="Avatar"
                  />
                  {/* Upload button for the photo */}
                  <CldUploadButton
                    options={{ maxFiles: 1 }}
                    onSuccess={handleUpload}
                    uploadPreset="th9qnijk"
                  >
                    <Button disabled={isLoading} secondary type="button">
                      Change
                    </Button>
                  </CldUploadButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button disabled={isLoading} secondary onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal; // Export the SettingsModal component
