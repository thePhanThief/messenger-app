// Using client-side rendering mode to ensure this component only runs on the client side
"use client";

// Import Dialog and Transition components from @headlessui/react for creating accessible dialogs
// Import Fragment from React to use as a component wrapper
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoClose } from "react-icons/io5"; // Importing close icon from react-icons library

// Interface to type the props received by the Modal component
interface ModalProps {
  isOpen?: boolean; // Boolean to control visibility of the modal, optional
  onClose: () => void; // Function to close the modal
  children: React.ReactNode; // Content of the modal, can be any valid React node
}

// Functional component for Modal, accepting props defined in ModalProps
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    // Transition.Root component to handle showing and hiding animations
    <Transition.Root
      show={isOpen} // Determines if the modal is shown based on the isOpen prop
      as={Fragment} // Uses React Fragment to avoid additional DOM elements
    >
      {/*Dialog component to create an accessible modal dialog*/}
      <Dialog
        as="div" // Renders Dialog as a 'div'
        className="relative z-50" // CSS for positioning and z-index
        onClose={onClose} // Function called to close the dialog
      >
        {/*Transition for fading the background when modal is opened/closed */}
        <Transition.Child
          as={Fragment} // No additional DOM element for transition
          enter="ease-out duration-300" // Ease-out transition when entering
          enterFrom="opacity-0" // Start from transparent
          enterTo="opacity-100" // End at fully opaque
          leave="ease-in duration-200" // Ease-in transition when leaving
          leaveFrom="opacity-100" // Start fully opaque
          leaveTo="opacity-0" // End transparent
        >
          {/*Background overlay div, dark with opacity for modal backdrop*/}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        {/*Container for the modal content*/}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
           {/*Transition for modal content appearance */}
            <Transition.Child
              as={Fragment} // No additional DOM element for transition
              enter="ease-out duration-300" // Transition timing and type for enter
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" // Start state for enter
              enterTo="opacity-100 translate-y-0 sm:scale-100" // End state for enter
              leave="ease-in duration-200" // Transition timing and type for leave
              leaveFrom="opacity-100 translate-y-0 sm:scale-100" // Start state for leave
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" // End state for leave
            >
              {/*Panel inside the modal for displaying content */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 text-left shadow-xl transition-all w-full sm:my-8 sm:max-w-lg sm:p-6">
                {/*Button to close the modal, positioned absolutely*/}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    onClick={onClose} // Calls onClose when clicked
                  >
                    <span className="sr-only">Close</span> {/*Accessible label for server only*/}
                    
                    <IoClose className="h-6 w-6" /> {/* Icon for close button*/}
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
