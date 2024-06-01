// Import the PusherServer and PusherClient from the pusher and pusher-js packages
import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Initialize the PusherServer instance with the necessary credentials and configuration
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!, // Pusher app ID from environment variable
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, // Public Pusher key from environment variable
  secret: process.env.PUSHER_SECRET!, // Pusher secret from environment variable
  cluster: "ap2", // Pusher cluster
  useTLS: true, // Use TLS for secure connections
});

// Initialize the PusherClient instance with the necessary credentials and configuration
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, // Public Pusher key from environment variable
  {
    cluster: "ap2", // Pusher cluster
    channelAuthorization: {
      endpoint: "/api/pusher/auth", // Endpoint for channel authorization
      transport: "ajax", // Transport method for authorization requests
    },
  }
);
