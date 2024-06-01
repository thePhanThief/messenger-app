"use client";

// Import necessary components
import Modal from "@/app/components/Modal"; // Import Modal component
import Image from "next/image"; // Import Image component from Next.js

// Define properties for the ImageModal component
interface ImageModalProps {
  isOpen?: boolean; // Boolean to control if the modal is open
  onClose: () => void; // Function to handle closing the modal
  src?: string | null; // Source URL of the image
}

// Create the ImageModal component
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src }) => {
  if (!src) {
    return null; // Return null if no source URL is provided
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}> {/* Render Modal component */}
      <div className="w-full h-full flex justify-center items-center p-4">
        <Image
          alt="Image"
          layout="responsive"
          width={700}
          height={700}
          objectFit="contain"
          src={src} // Source URL of the image
        />
      </div>
    </Modal>
  );
};

export default ImageModal; // Export the ImageModal component
