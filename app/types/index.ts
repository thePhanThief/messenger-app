import { Conversation, User, Message } from "@prisma/client";

// Define a type that extends the Message type to include additional fields
export type FullMessageType = Message & {
  // The user who sent the message
  sender: User; 
  // Array of users who have seen the message
  seen: User[]; 
};

// Define a type that extends the Conversation type to include additional fields
export type FullConversationType = Conversation & {
  // Array of users involved in the conversation
  users: User[]; 
  // Array of messages in the conversation, with each message including sender and seen fields
  messages: FullMessageType[]; 
};
