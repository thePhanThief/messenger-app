import EmptyState from "../components/EmptyState";

// Create the Users component
const Users = () => {
  return (
    <div className="hidden lg:block lg:pl-80 h-full">
      {/* Display the EmptyState component */}
      <EmptyState /> 
    </div>
  );
};

export default Users; 
