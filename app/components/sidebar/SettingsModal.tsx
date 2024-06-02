"use client";

import { User } from "@prisma/client"; 
import axios from "axios"; 
import { useRouter } from "next/navigation"; 
import { useState } from "react"; 
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; 
import toast from "react-hot-toast"; 
import Modal from "../Modal"; 
import Input from "../inputs/input"; 
import Image from "next/image"; 
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button"; 

// Define the properties for the SettingsModal component
interface SettingsModalProps {
  // The current user object
  currentUser: User; 
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
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
      // Post the data to the API
      .post("/api/settings", data) 
      .then(() => {
        // Refresh the page on success
        router.refresh(); 
        // Close the modal on success
        onClose(); 
      })
      // Show error toast on failure
      .catch(() => toast.error("Something went wrong")) 
      // Reset loading state
      .finally(() => setIsLoading(false)); 
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

export default SettingsModal; 
