// Import necessary functions and components
import getConversationById from "@/app/actions/getConversationById"; 
import getMessages from "@/app/actions/getMessages"; 
import EmptyState from "@/app/components/EmptyState"; 
import Header from "./components/Header"; 
import Body from "./components/Body"; 
import Form from "./components/Form"; 

// Define properties for the page component
interface IParams {
  // Conversation ID parameter
  conversationId: string; 
}

// Create the page component to display a conversation
const ConversationId = async ({ params }: { params: IParams }) => {
  // Get conversation details by ID
  const conversation = await getConversationById(params.conversationId); 
  // Get messages for the conversation
  const messages = await getMessages(params.conversationId); 

  // If no conversation is found, display the EmptyState component
  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          {/* Display EmptyState component */}
          <EmptyState /> 
        </div>
      </div>
    );
  }

  // If conversation is found, display the conversation details
  return (
    <div className="lg:pl-80 h-full">
      <div className="h-full flex flex-col">
        {/* Display Header component */}
        <Header conversation={conversation} /> 
        {/* Display Body component with initial messages */}
        <Body initialMessages={messages} /> 
        {/* Display Form component */}
        <Form /> 
      </div>
    </div>
  );
};

// Export the page component
export default ConversationId; 
