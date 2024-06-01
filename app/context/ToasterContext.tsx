"use client";

import { Toaster } from "react-hot-toast"; // Import Toaster component from react-hot-toast

// Create the ToasterContext component to provide toast notifications context
const ToasterContext = () => {
  return (
    <Toaster /> // Render the Toaster component to enable toast notifications
  );
};

export default ToasterContext; // Export the ToasterContext component
