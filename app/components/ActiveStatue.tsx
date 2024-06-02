"use client";

import useActiveChannel from "../hooks/useActiveChannel"; 

// Create the ActiveStatus component
const ActiveStatus = () => {
  // Use the custom hook to track active channels
  useActiveChannel();

  // The component does not render anything
  return null; 
};

// Export the ActiveStatus component
export default ActiveStatus; 
