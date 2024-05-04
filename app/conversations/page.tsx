"use client"; // Directive to use client-side rendering for this Next.js module

// Import required libraries and components
import clsx from "clsx"; // Import clsx for conditional class joining
import useConversation from "../hooks/useConversation"; // Custom hook to determine conversation state
import EmptyState from "../components/EmptyState"; // Import the EmptyState component for displaying when no content is available

/**
 * The Home component that conditionally displays its contents based on the conversation state.
 *
 * @returns A React component that renders UI based on the conversation state.
 */
const Home = () => {
  // Retrieve the isOpen property from the useConversation hook to determine if the conversation UI should be open
  const { isOpen } = useConversation();

  // Render the component with conditional classes and content
  return (
    <div
      className={clsx(
        "lg:pl-80 h-full lg:block", // Apply padding on large screens and ensure it is a block level element with full height
        isOpen ? 'block' : 'hidden' // Dynamically assign 'block' or 'hidden' based on isOpen state
      )}
    >
      <EmptyState /> // Display the EmptyState component within this div
    </div>
  );
};

// Export the Home component for use in other parts of the application
export default Home;
