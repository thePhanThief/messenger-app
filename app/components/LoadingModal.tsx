"use client";

// Import necessary modules and components
import React, { Fragment } from "react"; // Importing React and Fragment
import { Dialog, Transition } from "@headlessui/react"; // Importing Dialog and Transition from headlessui
import { ClipLoader } from "react-spinners"; // Importing ClipLoader from react-spinners

// LoadingModal component definition
const LoadingModal = () => {
  return (
    // Transition.Root provides a root transition context
    <Transition.Root show as={Fragment}>
      {/* Dialog component to display the modal */}
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Transition.Child handles the enter and leave transitions */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" // Transition on entering
          enterFrom="opacity-0" // Start state of entering transition
          enterTo="opacity-100" // End state of entering transition
          leave="ease-in duration-200" // Transition on leaving
          leaveFrom="ease-in duration-200" // Start state of leaving transition
          leaveTo="opacity-0" // End state of leaving transition
        >
          {/* Background overlay */}
          <div
            className="
                    fixed
                    inset-0
                    bg-gray-100
                    bg-opacity-50
                    transition-opacity
                    "
          />
        </Transition.Child>

        {/* Container for the modal content */}
        <div
          className="
            fixed
            inset-0
            z-10
            overflow-y-auto
            "
        >
          <div
            className="
              flex
              min-h-full
              items-center
              justify-center
              p-3
              text-center
              "
          >
            {/* Dialog panel for the loader */}
            <Dialog.Panel >
              <ClipLoader size={40} color="#0284c7" /> {/* Spinner loader */}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LoadingModal; // Exporting the LoadingModal component
