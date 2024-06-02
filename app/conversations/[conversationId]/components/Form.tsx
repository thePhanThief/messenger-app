"use client";

// Import necessary hooks and libraries
import useConversation from "@/app/hooks/useConversation"; 
import axios from "axios"; 
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; 
import { HiPhoto, HiPaperAirplane } from "react-icons/hi2"; 
import MessageInput from "./MessageInput"; 
import { CldUploadButton } from "next-cloudinary"; 

// Create the Form component
const Form = () => {
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 

  // Initialize useForm hook with default values
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      // Default value for message input
      message: "", 
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Reset the message input field
    setValue("message", "", { shouldValidate: true }); 
    axios.post("/api/messages", {
      ...data,
      // Include conversation ID in the request data
      conversationId, 
    });
  };

  // Handle image upload
  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      // Get the secure URL of the uploaded image
      image: result?.info?.secure_url, 
      // Include conversation ID in the request data
      conversationId 
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
        // Allow only one file to be uploaded
        options={{ maxFiles: 1 }} 
        // Handle the upload success
        onSuccess={handleUpload} 
        uploadPreset="th9qnijk"
      >
        {/* Display photo icon */}
        <HiPhoto size={30} className="text-sky-500" /> 
      </CldUploadButton>
      {/* Form for sending messages */}
      <form
        // Handle form submission
        onSubmit={handleSubmit(onSubmit)} 
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          // Input ID for the message
          id="message" 
          // Register the input with react-hook-form
          register={register} 
          // Pass validation errors
          errors={errors} 
          // Make the input required
          required 
          // Placeholder text
          placeholder="Write a message here" 
        />
        <button
          // Set button type to submit
          type="submit" 
          className="
            rounded-full
            p-2
            bg-sky-500
            cursor-pointer
            hover:bg-sky-600
            transition
          "
        >
          {/* Display send icon */}
          <HiPaperAirplane size={18} className="text-white" /> 
        </button>
      </form>
    </div>
  );
};

// Export the Form component
export default Form; 
