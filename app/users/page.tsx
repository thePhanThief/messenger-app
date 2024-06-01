// Import the EmptyState component for displaying an empty state
import EmptyState from "../components/EmptyState";

// Create the Users component
const Users = () => {
  return (
    <div className="hidden lg:block lg:pl-80 h-full">
      <EmptyState /> {/* Display the EmptyState component */}
    </div>
  );
};

export default Users; // Export the Users component
