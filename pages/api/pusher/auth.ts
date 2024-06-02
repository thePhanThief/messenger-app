import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { pusherServer } from "@/app/libs/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/util/authOptions";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const session = await getServerSession(request, response, authOptions);

  if (!session?.user?.email) {
    // Unauthorized if no session or email
    return response.status(401); 
  }
  // Retrieve socket ID from the request body
  const socketId = request.body.socket_id; 
  // Retrieve channel name from the request body
  const channel = request.body.channel_name; 
  const data = {
    // Set user_id to the email from the session
    user_id: session.user.email 
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, data); // Authorize the channel with Pusher

  // Send the authorization response
  return response.send(authResponse); 
}
