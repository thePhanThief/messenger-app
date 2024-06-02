// Import necessary functions and components
import getConversations from "../actions/getConversations";
import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import ConversationList from "./components/ConversationList";

//An async function component that fetches data and renders a layout for conversations.
export default async function ConversationsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Fetch conversations data asynchronously
  const conversations = await getConversations();

  // Fetch users data asynchronously
  const users = await getUsers();

  // Return the component structure
  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList
          users={users}
          initialItems={conversations}
        />
        {children}
      </div>
    </Sidebar>
  );
};
