"use client";

// Import necessary hooks and libraries
import useConversation from "@/app/hooks/useConversation"; // Custom hook to get conversation details
import axios from "axios"; // Import axios for making HTTP requests
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; // Import necessary functions and types from react-hook-form
import { HiPhoto, HiPaperAirplane } from "react-icons/hi2"; // Import icons from react-icons/hi2
import MessageInput from "./MessageInput"; // Import MessageInput component
import { CldUploadButton } from "next-cloudinary"; // Import CldUploadButton for handling image uploads with Cloudinary

// Create the Form component
const Form = () => {
  const { conversationId } = useConversation(); // Get conversation ID from custom hook

  // Initialize useForm hook with default values
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "", // Default value for message input
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true }); // Reset the message input field
    axios.post("/api/messages", {
      ...data,
      conversationId, // Include conversation ID in the request data
    });
  };

  // Handle image upload
  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      image: result?.info?.secure_url, // Get the secure URL of the uploaded image
      conversationId // Include conversation ID in the request data
    });
  }

  return (
    <div
      className="
            py-4
            px-4
            bg-white
            border-t
            flex
            items-center
            gap-2
            lg:gap-4
            w-full
        "
    >
      {/* Cloudinary Upload Button */}
      <CldUploadButton
        options={{ maxFiles: 1 }} // Allow only one file to be uploaded
        onUpload={handleUpload} // Handle the upload success
        uploadPreset="th9qnijk"
      >
        <HiPhoto size={30} className="text-sky-500" /> {/* Display photo icon */}
      </CldUploadButton>
      {/* Form for sending messages */}
      <form
        onSubmit={handleSubmit(onSubmit)} // Handle form submission
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message" // Input ID for the message
          register={register} // Register the input with react-hook-form
          errors={errors} // Pass validation errors
          required // Make the input required
          placeholder="Write a message here" // Placeholder text
        />
        <button
          type="submit" // Set button type to submit
          className="
                rounded-full
                p-2
                bg-sky-500
                cursor-pointer
                hover:bg-sky-600
                transition
              "
        >
          <HiPaperAirplane size={18} className="text-white" /> {/* Display send icon */}
        </button>
      </form>
    </div>
  );
};

export default Form; // Export the Form component
