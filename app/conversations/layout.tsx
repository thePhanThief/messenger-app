// Import necessary functions and components
import getConversations from "../actions/getConversations" // Import the function to fetch conversation data
import getUsers from "../actions/getUsers"; // Import the function to fetch user data
import Sidebar from "../components/sidebar/Sidebar" // Import the Sidebar component for layout structure
import ConversationList from "./components/ConversationList" // Import the ConversationList component to display list of conversations

/**
 * An async function component that fetches data and renders a layout for conversations.
 * 
 * @param children - ReactNode elements to be rendered as children within the component.
 * @returns A React component structure including a Sidebar, ConversationList, and any children passed in.
 */
export default async function ConversationsLayout({
  children
}: {
  children: React.ReactNode // TypeScript type for React children props
}) {
  // Fetch conversations data asynchronously
  const conversations = await getConversations();
  // Fetch users data asynchronously
  const users = await getUsers();

  // Return the component structure
  return (
    <Sidebar> {/* Wrap content in Sidebar component */}
      <div className="h-full"> {/* Full height container */}
        <ConversationList
          users = {users} // Pass users data to the ConversationList component
          initialItems={conversations} // Pass conversations data to the ConversationList component
        />
        {children} {/* Render children elements passed to this component */}
      </div>
    </Sidebar>
  )
};
