"use client";

// Import necessary components
import Modal from "@/app/components/Modal"; 
import Image from "next/image"; 

// Define properties for the ImageModal component
interface ImageModalProps {
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
  // Source URL of the image
  src?: string | null; 
}

// Create the ImageModal component
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src }) => {
  if (!src) {
    // Return null if no source URL is provided
    return null; 
  }

  return (
    // Render Modal component
    <Modal isOpen={isOpen} onClose={onClose}> 
      <div className="w-full h-full flex justify-center items-center p-4">
        <Image
          alt="Image"
          layout="responsive"
          width={700}
          height={700}
          objectFit="contain"
          // Source URL of the image
          src={src} 
        />
      </div>
    </Modal>
  );
};

// Export the ImageModal component
export default ImageModal; 
