// Import necessary types from @prisma/client
import { Conversation, User, Message } from "@prisma/client";

// Define a type that extends the Message type to include additional fields
export type FullMessageType = Message & {
  sender: User; // The user who sent the message
  seen: User[]; // Array of users who have seen the message
};

// Define a type that extends the Conversation type to include additional fields
export type FullConversationType = Conversation & {
  users: User[]; // Array of users involved in the conversation
  messages: FullMessageType[]; // Array of messages in the conversation, with each message including sender and seen fields
};
