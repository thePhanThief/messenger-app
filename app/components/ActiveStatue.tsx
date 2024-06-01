"use client";

import useActiveChannel from "../hooks/useActiveChannel"; // Import custom hook to track active channels

// Create the ActiveStatus component
const ActiveStatus = () => {
  useActiveChannel(); // Use the custom hook to track active channels

  return null; // The component does not render anything
};

export default ActiveStatus; // Export the ActiveStatus component
