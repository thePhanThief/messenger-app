"use client";

// Import necessary components and hooks
import Button from "@/app/components/Button"; // Import Button component
import Modal from "@/app/components/Modal"; // Import Modal component
import useConversation from "@/app/hooks/useConversation"; // Custom hook to get conversation details
import { Dialog } from "@headlessui/react"; // Import Dialog from headlessui
import axios from "axios"; // Import axios for making HTTP requests
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { useCallback, useState } from "react"; // Import React hooks
import { toast } from "react-hot-toast"; // Import toast for notifications
import { FiAlertTriangle } from "react-icons/fi"; // Import alert icon from react-icons

// Define properties for the ConfirmModal component
interface ConfirmModalProps {
  isOpen?: boolean; // Boolean to control if the modal is open
  onClose: () => void; // Function to handle closing the modal
}

// Create the ConfirmModal component
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose
}) => {
  const router = useRouter(); // Initialize useRouter for navigation
  const { conversationId } = useConversation(); // Get conversation ID from custom hook
  const [isLoading, setIsLoading] = useState(false); // State to handle loading state

  // Handle delete action
  const onDelete = useCallback(() => {
    setIsLoading(true); // Set loading state to true

    axios.delete(`/api/conversations/${conversationId}`) // Make delete request to API
    .then(() => {
      onClose(); // Close the modal on success
      router.push('/conversations'); // Navigate to conversations page
      router.refresh(); // Refresh the page
    })
    .catch(() => toast.error('Something went wrong!')) // Show error toast on failure
    .finally(() => setIsLoading(false)); // Reset loading state
  }, [conversationId, router, onClose]);

  return ( 
    <Modal
      isOpen={isOpen} // Pass isOpen prop to Modal component
      onClose={onClose} // Pass onClose prop to Modal component
    >
      <div className="sm:flex sm:items-start">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-red-100
            sm:mx-0
            sm:h-10
            sm:w-10
          "
        >
          <FiAlertTriangle
            className="h-6 w-6 text-red-600" // Alert icon with red color
          />
        </div>
        <div
          className="
            mt-3
            text-center
            sm:ml-4
            sm:mt-0
            sm:text-left
          "
        >
          <Dialog.Title
            as="h3"
            className="
              text-base
              font-semibold
              leading-6
              text-gray-900
            "
          >
            Delete conversation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <div
        className="
          mt-5
          sm:mt-4
          sm:flex
          sm:flex-row-reverse
        "
      >
        <Button
          disabled={isLoading} // Disable button if loading
          danger
          onClick={onDelete} // Handle delete action on click
        >
          Delete
        </Button>
        <Button
          disabled={isLoading} // Disable button if loading
          secondary
          onClick={onClose} // Handle close action on click
        >
          Cancel
        </Button>
      </div>
    </Modal>
   );
}
 
export default ConfirmModal; // Export the ConfirmModal component
