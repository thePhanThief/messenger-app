import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { pusherServer } from "@/app/libs/pusher";
import { authOptions } from "@/util/authOptions";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const session = await getServerSession(request, response, authOptions);

  if (!session?.user?.email) {
    return response.status(401); // Unauthorized if no session or email
  }

  const socketId = request.body.socket_id; // Retrieve socket ID from the request body
  const channel = request.body.channel_name; // Retrieve channel name from the request body
  const data = {
    user_id: session.user.email // Set user_id to the email from the session
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, data); // Authorize the channel with Pusher

  return response.send(authResponse); // Send the authorization response
}
