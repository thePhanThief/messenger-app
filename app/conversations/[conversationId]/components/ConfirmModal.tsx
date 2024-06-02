"use client";

// Import necessary components and hooks
import Button from "@/app/components/Button"; 
import Modal from "@/app/components/Modal"; 
import useConversation from "@/app/hooks/useConversation"; 
import { Dialog } from "@headlessui/react"; 
import axios from "axios"; 
import { useRouter } from "next/navigation"; 
import { useCallback, useState } from "react"; 
import { toast } from "react-hot-toast"; 
import { FiAlertTriangle } from "react-icons/fi"; 

// Define properties for the ConfirmModal component
interface ConfirmModalProps {
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
}

// Create the ConfirmModal component
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose
}) => {
  // Initialize useRouter for navigation
  const router = useRouter(); 
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 
  // State to handle loading state
  const [isLoading, setIsLoading] = useState(false); 

  // Handle delete action
  const onDelete = useCallback(() => {
    // Set loading state to true
    setIsLoading(true); 

    // Make delete request to API
    axios.delete(`/api/conversations/${conversationId}`) 
    .then(() => {
      // Close the modal on success
      onClose(); 
      // Navigate to conversations page
      router.push('/conversations'); 
      // Refresh the page
      router.refresh(); 
    })
    // Show error toast on failure
    .catch(() => toast.error('Something went wrong!')) 
    // Reset loading state
    .finally(() => setIsLoading(false)); 
  }, [conversationId, router, onClose]);

  return ( 
    <Modal
      // Pass isOpen prop to Modal component
      isOpen={isOpen} 
      // Pass onClose prop to Modal component
      onClose={onClose} 
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
          // Disable button if loading
          disabled={isLoading} 
          danger
          // Handle delete action on click
          onClick={onDelete} 
        >
          Delete
        </Button>
        <Button
          // Disable button if loading
          disabled={isLoading} 
          secondary
          // Handle close action on click
          onClick={onClose} 
        >
          Cancel
        </Button>
      </div>
    </Modal>
   );
}
 
// Export the ConfirmModal component
export default ConfirmModal; 
