"use client";

import { Toaster } from "react-hot-toast"; 

// Create the ToasterContext component to provide toast notifications context
const ToasterContext = () => {
  return (
    // Render the Toaster component to enable toast notifications
    <Toaster /> 
  );
};

// Export the ToasterContext component
export default ToasterContext; 
