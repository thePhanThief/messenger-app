"use client"; 

import clsx from "clsx"; 
import useConversation from "../hooks/useConversation"; 
import EmptyState from "../components/EmptyState"; 

// Define the Home component
const Home = () => {
  // Retrieve the isOpen property from the useConversation hook to determine if the conversation UI should be open
  const { isOpen } = useConversation();

  // Render the component with conditional classes and content
  return (
    <div
      className={clsx(
        "lg:pl-80 h-full lg:block", 
        isOpen ? 'block' : 'hidden' 
      )}
    >
      <EmptyState /> 
    </div>
  );
};

export default Home;
