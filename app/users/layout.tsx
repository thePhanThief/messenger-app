// Import necessary functions and components
import getUsers from '../actions/getUsers'; // Import the function to fetch user data
import Sidebar from '../components/sidebar/Sidebar'; // Import the Sidebar component for layout structure
import UserList from './components/UserList'; // Import the UserList component to display the list of users

/**
 * An async function component that fetches data and renders a layout for users.
 * 
 * @param children - ReactNode elements to be rendered as children within the component.
 * @returns A React component structure including a Sidebar, UserList, and any children passed in.
 */
export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode; // TypeScript type for React children props
}) {
  // Fetch users data asynchronously
  const users = await getUsers();

  // Return the component structure
  return (
    <Sidebar> {/* Wrap content in Sidebar component */}
      <div className="h-full"> {/* Full height container */}
        <UserList items={users} /> {/* Pass fetched users data to UserList component */}
        {children} {/* Render children elements passed to this component */}
      </div>
    </Sidebar>
  );
}
