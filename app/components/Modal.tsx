// Using client-side rendering mode to ensure this component only runs on the client side
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoClose } from "react-icons/io5"; 

// Interface to type the props received by the Modal component
interface ModalProps {
  // Boolean to control visibility of the modal, optional
  isOpen?: boolean; 
  // Function to close the modal
  onClose: () => void; 
  // Content of the modal, can be any valid React node
  children: React.ReactNode; 
}

// Functional component for Modal, accepting props defined in ModalProps
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    // Transition.Root component to handle showing and hiding animations
    <Transition.Root
      // Determines if the modal is shown based on the isOpen prop
      show={isOpen} 
      // Uses React Fragment to avoid additional DOM elements
      as={Fragment} 
    >
      {/* Dialog component to create an accessible modal dialog */}
      <Dialog
        // Renders Dialog as a 'div'
        as="div" 
        // CSS for positioning and z-index
        className="relative z-50" 
        // Function called to close the dialog
        onClose={onClose} 
      >
        {/* Transition for fading the background when modal is opened/closed */}
        <Transition.Child
          // No additional DOM element for transition
          as={Fragment} 
          // Ease-out transition when entering
          enter="ease-out duration-300" 
          // Start from transparent
          enterFrom="opacity-0" 
          // End at fully opaque
          enterTo="opacity-100" 
          // Ease-in transition when leaving
          leave="ease-in duration-200" 
          // Start fully opaque
          leaveFrom="opacity-100" 
          // End transparent
          leaveTo="opacity-0" 
        >
          {/* Background overlay div, dark with opacity for modal backdrop */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        {/* Container for the modal content */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
           {/* Transition for modal content appearance */}
            <Transition.Child
              // No additional DOM element for transition
              as={Fragment} 
              // Transition timing and type for enter
              enter="ease-out duration-300" 
              // Start state for enter
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
              // End state for enter
              enterTo="opacity-100 translate-y-0 sm:scale-100" 
              // Transition timing and type for leave
              leave="ease-in duration-200" 
              // Start state for leave
              leaveFrom="opacity-100 translate-y-0 sm:scale-100" 
              // End state for leave
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
            >
              {/* Panel inside the modal for displaying content */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 text-left shadow-xl transition-all w-full sm:my-8 sm:max-w-lg sm:p-6">
                {/* Button to close the modal, positioned absolutely */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    // Calls onClose when clicked
                    onClick={onClose} 
                  >
                    {/* Accessible label for screen readers */}
                    <span className="sr-only">Close</span> 
                    {/* Icon for close button */}
                    <IoClose className="h-6 w-6" /> 
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Export the Modal component for use in other parts of the application
export default Modal;
