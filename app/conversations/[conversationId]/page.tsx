// Import necessary functions and components
import getConversationById from "@/app/actions/getConversationById"; // Import function to get conversation by ID
import getMessages from "@/app/actions/getMessages"; // Import function to get messages
import EmptyState from "@/app/components/EmptyState"; // Import EmptyState component
import Header from "./components/Header"; // Import Header component
import Body from "./components/Body"; // Import Body component
import Form from "./components/Form"; // Import Form component

// Define properties for the page component
interface IParams {
  conversationId: string; // Conversation ID parameter
}

// Create the page component to display a conversation
const ConversationId = async ({ params }: { params: IParams }) => {
  const conversation = await getConversationById(params.conversationId); // Get conversation details by ID
  const messages = await getMessages(params.conversationId); // Get messages for the conversation

  // If no conversation is found, display the EmptyState component
  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState /> {/* Display EmptyState component */}
        </div>
      </div>
    );
  }

  // If conversation is found, display the conversation details
  return (
    <div className="lg:pl-80 h-full">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} /> {/* Display Header component */}
        <Body initialMessages={messages} /> {/* Display Body component with initial messages */}
        <Form /> {/* Display Form component */}
      </div>
    </div>
  );
};

export default ConversationId; // Export the page component
