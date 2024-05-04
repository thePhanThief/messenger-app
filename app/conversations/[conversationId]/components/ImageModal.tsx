"use client";

import Modal from "@/app/components/Modal";
import Image from "next/image";

interface ImageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  src?: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src }) => {
  if (!src) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full flex justify-center items-center p-4">
        <Image alt="Image" layout="responsive" width={700} height={700} objectFit="contain" src={src} />
      </div>
    </Modal>
  );
};

export default ImageModal;
