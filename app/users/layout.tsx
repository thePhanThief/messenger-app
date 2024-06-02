
import getUsers from '../actions/getUsers'; 
import Sidebar from '../components/sidebar/Sidebar';
import UserList from './components/UserList'; 

 //An async function component that fetches data and renders a layout for users.
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
     {/* Full height container */}
      <div className="h-full">
        {/* Pass fetched users data to UserList component */}
        <UserList items={users} /> 
        {/* Render children elements passed to this component */}
        {children} 
      </div>
    </Sidebar>
  );
}
