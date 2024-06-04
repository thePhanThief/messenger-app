### C:\Users\נדב\messenger-app\app\globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body,
:root{
  height: 100%;
}

```
### C:\Users\נדב\messenger-app\app\layout.tsx

```tsx
import type { Metadata } from "next"; 
import { Inter } from "next/font/google"; 
import "./globals.css"; 
import ToasterContext from "./context/ToasterContext";
import AuthContext from "./context/AuthContext"; 
import ActiveStatus from "./components/ActiveStatue"; 

// Initialize the Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the application
export const metadata: Metadata = {
  // Title of the application
  title: "Messenger", 
  // Description of the application
  description: "Messenger", 
};

// Define the RootLayout component which wraps the entire application
export default function RootLayout({
  // ReactNode elements to be rendered as children within the component
  children, 
}: Readonly<{
  // TypeScript type for React children props
  children: React.ReactNode; 
}>) {
  return (
    <html lang="en"> {/* Set the language attribute for the HTML document */}
    {/* Apply the Inter font to the body */}
      <body className={inter.className}> 
         {/* Wrap the application in AuthContext for authentication management */}
        <AuthContext>
          {/* Include ToasterContext for managing toast notifications */}
          <ToasterContext /> 
          {/* Include ActiveStatus to manage user activity status */}
          <ActiveStatus /> 
          {/* Render childreapp\layout.tsxn elements passed to this component */}
          {children} 
        </AuthContext>
      </body>
    </html>
  );
}

```
### C:\Users\נדב\messenger-app\app\(site)\page.tsx

```tsx
import Image from "next/image";
import AuthForm from "./components/AuthForm";

// Define the Home component which renders the main page
export default function Home() {
  return (
    <div
      className="
        flex
        min-h-full
        flex-col
        justify-center
        py-12
        sm:px-6
        lg:px-8
        bg-gray-100
      "
    >
      {/* Container for the logo and heading */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Image
          alt="Logo"
          height="65"
          width="65"
          className="mx-auto w-auto"
          src="/images/logo.png"
        />
        {/* Heading */}
        <h2
          className="
            mt-6
            text-center
            text-3xl
            font-bold
            tracking-tight
            text-gray-900
          "
        >
          Sign into your account
        </h2>
      </div>
      <AuthForm />
    </div>
  );
}

```
### C:\Users\נדב\messenger-app\app\(site)\components\AuthForm.tsx

```tsx
"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/input";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { BsGithub, BsGoogle } from "react-icons/bs";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define the possible form variants
type Variant = "LOGIN" | "REGISTER";

// Main component for authentication form
const AuthForm = () => {
  // Get current session
  const session = useSession();
  // Get router for navigation
  const router = useRouter();
  // Variant of form (login/register)
  const [variant, setVariant] = useState<Variant>("LOGIN");
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Redirect authenticated users to the /users page
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  // Toggle form variant between login and register
  const toggleVariant = useCallback(() => {
    setVariant((prevVariant) => (prevVariant === "LOGIN" ? "REGISTER" : "LOGIN"));
  }, []);

  // Form handler using react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Form submission function
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    // Handle registration
    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() => {
          toast.success("Account created successfully!");
          signIn("credentials", {
            ...data,
            redirect: false,
          });
        })
        .catch(() => toast.error("Something went wrong!"))
        .finally(() => setIsLoading(false));
    }

    // Handle login
    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials!");
          }

          if (callback?.ok && !callback?.error) {
            toast.success("Logged in successfully!");
            router.push("/users");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  // Social login action
  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials!");
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Logged in successfully!");
          router.push("/users");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Name input, displayed only in register variant */}
          {variant === "REGISTER" && (
            <Input
              id="name"
              label="Name"
              register={register}
              errors={errors}
              disabled={isLoading}
            />
          )}
          {/* Email input */}
          <Input
            id="email"
            label="Email address"
            type="email"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          {/* Password input */}
          <Input
            id="password"
            label="Password"
            type="password"
            register={register}
            errors={errors}
            disabled={isLoading}
          />
          {/* Submit button */}
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

```
### C:\Users\נדב\messenger-app\app\(site)\components\AuthSocialButton.tsx

```tsx
import { FC } from "react";
import { IconType } from "react-icons";

// Props for AuthSocialButton component
interface AuthSocialButtonProps {
  // The icon to be displayed in the button
  icon: IconType;
  // The function to be called when the button is clicked
  onClick: () => void;
}

// AuthSocialButton component
const AuthSocialButton: FC<AuthSocialButtonProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        w-full 
        justify-center 
        rounded-md 
        bg-white 
        px-4 
        py-2 
        text-gray-500 
        shadow-sm 
        ring-1 
        ring-inset 
        ring-gray-300 
        hover:bg-gray-50 
        focus:outline-offset-0
      "
    >
      {/* Render the provided icon */}
      <Icon />
    </button>
  );
};

export default AuthSocialButton;

```
### C:\Users\נדב\messenger-app\app\actions\getConversationById.ts

```ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

// Function to retrieve a conversation by its ID
const getConversationById = async (conversationId: string) => {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();

    // Check if the user is authenticated and has an email
    if (!currentUser?.email) {
      // Return null if no authenticated user is found or if they lack an email
      return null;
    }

    // Fetch the conversation from the database using the conversation ID
    const conversation = await prisma.conversation.findUnique({
      where: {
        // Condition to find the specific conversation
        id: conversationId, 
      },
      include: {
        // Include related users in the conversation
        users: true, 
      },
    });

    // Return the fetched conversation
    return conversation;
  } catch (error: any) {
    // Return null in case of an error
    return null;
  }
};

// Export the function
export default getConversationById;

```
### C:\Users\נדב\messenger-app\app\actions\getConversations.ts

```ts
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

// Function to retrieve all conversations of the current user
const getConversations = async () => {
  // Retrieve the current user
  const currentUser = await getCurrentUser();

  // Return an empty array if no authenticated user is found
  if (!currentUser?.id) {
    return [];
  }

  try {
    // Fetch the conversations from the database
    const conversations = await prisma.conversation.findMany({
      orderBy: {
        // Order by the last message time in descending order
        lastMessageAt: 'desc' 
      },
      where: {
        userIds: {
          // Include conversations where the current user is a participant
          has: currentUser.id 
        }
      },
      include: {
        // Include related user data
        users: true, 
        messages: {
          include: {
            // Include the sender of each message
            sender: true, 
            // Include users who have seen each message
            seen: true 
          }
        }
      }
    });

    // Return the fetched conversations
    return conversations; 
  } catch (error: any) {
    // Return an empty array in case of an error
    return [];
  }
};

export default getConversations;

```
### C:\Users\נדב\messenger-app\app\actions\getCurrentUser.ts

```ts
import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

// Function to retrieve the current user
const getCurrentUser = async () => {
  try {
    // Retrieve the current session
    const session = await getSession();

    // Check if the session has a user email
    if (!session?.user?.email) {
      // Return null if no session or email is found
      return null;
    }

    // Find the user by their email
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    // Return the current user
    return currentUser;
  } catch (error: any) {
    // Return null in case of an error
    return null;
  }
};

// Export the function
export default getCurrentUser;

```
### C:\Users\נדב\messenger-app\app\actions\getMessages.ts

```ts
import prisma from "@/app/libs/prismadb";

// Function to retrieve messages by conversation ID
const getMessages = async (conversationId: string) => {
  try {
    // Fetch all messages associated with the specified conversation ID from the database
    const messages = await prisma.message.findMany({
      where: {
        // Filter messages by conversation ID
        conversationId: conversationId,
      },
      include: {
        // Include details about the sender from the User model
        sender: true,
        // Include information on which users have seen each message
        seen: true,
      },
      orderBy: {
        // Order messages by creation time in ascending order for chronological sorting
        createdAt: "asc",
      },
    });

    // Return the fetched messages if the query is successful
    return messages;
  } catch (error: any) {
    // Log any errors that occur during the fetch operation
    console.error("Failed to retrieve messages:", error);
    // Return an empty array if there is an error, to maintain consistent function output type
    return [];
  }
};

// Export the getMessages function
export default getMessages;

```
### C:\Users\נדב\messenger-app\app\actions\getSession.ts

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/util/authOptions";

// Function to get the server session
export default async function getSession() {
  // Return the server session based on authentication options
  return await getServerSession(authOptions);
}

```
### C:\Users\נדב\messenger-app\app\actions\getUsers.ts

```ts
import prisma from "@/app/libs/prismadb";
import getSession from "./getSession";

// Function to retrieve all users excluding the current user
const getUsers = async () => {
  // Retrieve the current session
  const session = await getSession();

  // Return an empty array if no session or email is found
  if (!session?.user?.email) {
    return [];
  }

  try {
    // Fetch all users from the database excluding the current user
    const users = await prisma.user.findMany({
      orderBy: {
        // Order users by creation time in descending order
        createdAt: "desc",
      },
      where: {
        NOT: {
          // Exclude the current user from the list
          email: session.user.email,
        },
      },
    });

    // Return the fetched users
    return users;
  } catch (error: any) {
    // Return an empty array in case of an error
    return [];
  }
};

// Export the function
export default getUsers;

```
### C:\Users\נדב\messenger-app\app\api\auth\[...nextauth]\route.ts

```ts
import { authOptions } from "@/app/api/auth/[...nextauth]/util/authOptions";
import NextAuth from "next-auth/next";

// Create the NextAuth handler with the authentication options
const handler = NextAuth(authOptions);

 // Export the handler for GET and POST requests
export { handler as GET, handler as POST };

```
### C:\Users\נדב\messenger-app\app\api\auth\[...nextauth]\util\authOptions.ts

```ts
import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/app/libs/prismadb";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid Credentials');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      }
    })
  ],
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```
### C:\Users\נדב\messenger-app\app\api\conversations\route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser"; 
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"; 
import { pusherServer } from "@/app/libs/pusher";

// Asynchronous POST function to handle API requests
export async function POST(request: Request) {
  try {
    // Get the current user details
    const currentUser = await getCurrentUser();
    
    // Parse the JSON body from the request
    const body = await request.json();
    
    // Destructure necessary properties from the body
    const { userId, isGroup, members, name } = body;

    // Check if the current user is authenticated
    if (!currentUser?.id || !currentUser?.email) {
      // If not authenticated, return a 401 Unauthorized response
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the request is to create a group without valid data
    if (isGroup && (!members || members.length < 2 || !name)) {
      // Return a 400 Bad Request response if data validation fails
      return new NextResponse("Invalid data", { status: 400 });
    }

    // If the request is to create a group
    if (isGroup) {
      // Create a new conversation in the database
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
        },
      });

      // Notify users in the new group about the new conversation
      newConversation.users.forEach((user) => {
        if (user.email) {
          pusherServer.trigger(user.email, 'conversation:new', newConversation);
        }
      });

      // Return the newly created conversation as JSON
      return NextResponse.json(newConversation);
    }

    // If the request is to create a single conversation, first find existing ones
    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
    });

    // Check if there is already an existing conversation
    const singleConversation = existingConversations[0];
    if (singleConversation) {
      // If it exists, return it
      return NextResponse.json(singleConversation);
    }

    // If no existing conversation, create a new one
    const newConversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id,
            },
            {
              id: userId,
            },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    // Notify users in the new conversation about the new conversation
    newConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, 'conversation:new', newConversation);
      }
    });

    // Return the newly created conversation as JSON
    return NextResponse.json(newConversation);
  } catch (error: any) {
    // Handle any errors during the process
    console.log(error, 'ERROR_CREATING_CONVERSATION');
    return new NextResponse("Internal Error", { status: 500 });
  }
}

```
### C:\Users\נדב\messenger-app\app\api\conversations\[conversationId]\route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Function to handle conversation deletion
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const { conversationId } = params; 
    const currentUser = await getCurrentUser(); 

    // Check if the user is authenticated
    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the existing conversation with the given ID
    const existingConversation = await prisma?.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    // Check if the conversation exists
    if (!existingConversation) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    // Delete the conversation if the current user is a participant
    const deletedConversation = await prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    // Notify all users in the conversation about the deletion
    existingConversation.users.forEach((user) => {
      if (user.email) {
        pusherServer.trigger(user.email, "conversation:remove", existingConversation);
      }
    });

    // Return the deleted conversation
    return NextResponse.json(deletedConversation); 
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_DELETE"); 
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}

```
### C:\Users\נדב\messenger-app\app\api\conversations\[conversationId]\seen\route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

interface IParams {
  conversationId?: string;
}

// Function to mark messages as seen in a conversation
export async function POST(request: Request, { params }: { params: IParams }) {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();
    const { conversationId } = params;

    // Check if the user is authenticated and has an email
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the conversation with the given ID, including messages and users
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    // Check if the conversation exists
    if (!conversation) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    // Return the conversation if there are no messages
    if (!lastMessage) {
      return NextResponse.json(conversation);
    }

    // Update the last message to mark it as seen by the current user
    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        sender: true,
        seen: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    // Trigger a Pusher event to update the conversation for the current user
    await pusherServer.trigger(currentUser.email, "conversation:update", {
      id: conversationId,
      messages: [updatedMessage],
    });

    // Return the conversation if the message was already seen by the user
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
      return NextResponse.json(conversation);
    }

    // Trigger a Pusher event to update the message for the conversation
    await pusherServer.trigger(conversationId!, 'message:update', updatedMessage);

    // Return the updated message
    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    console.log(error, "ERROR_MESSAGES_SEEN");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

```
### C:\Users\נדב\messenger-app\app\api\messages\route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { pusherServer } from "@/app/libs/pusher";

// Asynchronous POST function to handle API requests for creating a new message
export async function POST(request: Request) {
  try {
    // Get the current user details
    const currentUser = await getCurrentUser();
    
    // Parse the JSON body from the request
    const body = await request.json();
    
    // Destructure necessary properties from the body
    const {
      message,
      image,
      conversationId
    } = body;

    // If the current user is not authenticated, return a 401 Unauthorized response
    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a new message in the database
    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: {
          connect: {
            id: conversationId
          }
        },
        sender: {
          connect: {
            id: currentUser.id
          }
        },
        seen: {
          connect: {
            id: currentUser.id
          }
        }
      },
      include: {
        seen: true,
        sender: true,
      }
    });

    // Update the conversation with the new message
    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id
          }
        }
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true
          }
        }
      }
    });

    // Trigger a Pusher event for the new message
    await pusherServer.trigger(conversationId, 'messages:new', newMessage);

    // Get the last message in the updated conversation
    const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

    // Trigger a Pusher event for each user in the conversation to update the conversation
    updatedConversation.users.forEach((user) => {
      pusherServer.trigger(user.email!, 'conversation:update', {
        id: conversationId,
        messages: [lastMessage]
      });
    });

    // Return the newly created message as JSON
    return NextResponse.json(newMessage);
  } catch (error: any) {
    // Handle any errors during the process
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Internal Error', { status: 500 });
  }
}

```
### C:\Users\נדב\messenger-app\app\api\register\route.ts

```ts
import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

// Asynchronous POST function to handle user registration
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    // Destructure the necessary fields from the body
    const { email, name, password } = body;

    // Check if any fields are missing
    if (!email || !name || !password) {
      // Return an error if any fields are missing
      return new NextResponse("Missing info", { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user in the database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // Return the newly created user
    return NextResponse.json(user);
  } catch (error: any) {
    // Log the error message and stack trace
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);
    console.log("REGISTRATION_ERROR");
    // Return an internal error response
    return new NextResponse("Internal Error", { status: 500 });
  }
}

```
### C:\Users\נדב\messenger-app\app\api\settings\route.ts

```ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb"

// Asynchronous POST function to handle user settings update
export async function POST(request: Request) {
  try {
    // Retrieve the current user
    const currentUser = await getCurrentUser();
    
    // Parse the request body
    const body = await request.json(); 
    
    // Destructure the necessary fields from the body
    const { name, image } = body;

    // Check if the user is authenticated
    if (!currentUser?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image: image,
        name: name,
      },
    });
    
    // Return the updated user
    return NextResponse.json(updatedUser); 
  } catch (error: any) {
    console.log(error, 'SETTINGS_ERROR');
    return new NextResponse('Internal Error', { status: 500 });
  }
}

```
### C:\Users\נדב\messenger-app\app\components\ActiveStatue.tsx

```tsx
"use client";

import useActiveChannel from "../hooks/useActiveChannel"; 

// Create the ActiveStatus component
const ActiveStatus = () => {
  // Use the custom hook to track active channels
  useActiveChannel();

  // The component does not render anything
  return null; 
};

// Export the ActiveStatus component
export default ActiveStatus; 

```
### C:\Users\נדב\messenger-app\app\components\Avatar.tsx

```tsx
"use client";

import Image from "next/image"; 
import { User } from "@prisma/client"; 
import useActiveList from "../hooks/useActiveList"; 

// Interface for the properties of the Avatar component.
interface AvatarProps {
  // Define user property which is optional
  user?: User; 
}

// Create the Avatar component
const Avatar: React.FC<AvatarProps> = ({ user }) => {
  // Get list of active members
  const { members } = useActiveList(); 
  // Check if the user is active
  const isActive = members.indexOf(user?.email!) !== -1; 

  return (
    <div className="relative">
      <div
        className="
          relative
          inline-block
          rounded-full
          overflow-hidden
          h-9
          w-9
          md:h-11
          md:w-11
        "
      >
        <Image
          alt="Avatar"
          // Set user's image or placeholder
          src={user?.image || "/images/placeholder.jpg"} 
          fill
        />
      </div>
      {isActive && (
        <span
          className="
            absolute
            block
            rounded-full
            bg-green-500
            ring-2
            ring-white
            top-0
            right-0
            h-2
            w-2
            md:h-3
            md:w-3
          "
        />
      )}
    </div>
  );
};

// Export the Avatar component
export default Avatar; 

```
### C:\Users\נדב\messenger-app\app\components\Button.tsx

```tsx
"use client";

import clsx from "clsx"; 
import { FC } from "react"; 

// Define the button properties interface.
interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined; 
  fullWidth?: boolean; 
  children?: React.ReactNode; 
  onClick?: () => void; 
  secondary?: boolean; 
  danger?: boolean; 
  disabled?: boolean; 
}

// Create the button component.
const Button: FC<ButtonProps> = ({
  type = "button", 
  fullWidth,
  children,
  onClick,
  secondary,
  danger,
  disabled,
}) => {
  return (
    <button
      // Set the button type
      type={type} 
      // Set the onClick handler
      onClick={onClick} 
      // Disable the button if disabled is true
      disabled={disabled} 
      className={clsx(
        "inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        // Apply styles for disabled state
        disabled && "opacity-50 cursor-default", 
        // Apply styles for full width
        fullWidth && "w-full", 
        // Apply styles for secondary or primary button
        secondary ? "text-gray-900" : "text-white", 
        // Apply styles for danger button
        danger && "bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600", 
        // Apply styles for primary button
        !secondary && !danger && "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600" 
      )}
    >
      {children} 
    </button>
  );
};

// Export the Button component
export default Button; 

```
### C:\Users\נדב\messenger-app\app\components\EmptyState.tsx

```tsx
// Create the EmptyState component
const EmptyState = () => {
  return (
    <div
      className="
        px-4 
        py-10 
        sm:px-6 
        lg:px-8 
        h-full 
        flex 
        justify-center 
        items-center 
        bg-gray-100 
      "
    >
      <div className="text-center items-center flex flex-col">
        <h3 className="mt-2 text-2xl font-semibold text-gray-900">Select chat or start a new conversation</h3>
      </div>
    </div>
  );
};

// Export the EmptyState component
export default EmptyState; 

```
### C:\Users\נדב\messenger-app\app\components\GroupAvatar.tsx

```tsx
"use client";

import { User } from "@prisma/client"; 
import Image from "next/image";

// Define the properties for the GroupAvatar component
interface GroupAvatarProps {
  // Define users property which is an array of User objects
  users?: User[]; 
}

// Create the GroupAvatar component
const GroupAvatar: React.FC<GroupAvatarProps> = ({ users = [] }) => {
  // Slice the first three users
  const slicedUsers = users.slice(0, 3); 

  // Define positions for the avatars
  const positionMap = {
    0: "top-0 left-[12px]",
    1: "bottom-0",
    2: "bottom-0 right-0",
  };

  return (
    <div className="relative h-11 w-11">
      {/* Map through sliced users and display their avatars */}
      {slicedUsers.map((user, index) => (
        <div
          key={user.id}
          className={`
            absolute
            inline-block
            rounded-full
            overflow-hidden
            h-[21px]
            w-[21px]
            ${positionMap[index as keyof typeof positionMap]} // Set position based on index
          `}
        >
          <Image
            fill
            // Set user's image or placeholder
            src={user?.image || "/images/placeholder.jpg"} 
            alt="Avatar"
          />
        </div>
      ))}
    </div>
  );
};

// Export the GroupAvatar component
export default GroupAvatar; 

```
### C:\Users\נדב\messenger-app\app\components\LoadingModal.tsx

```tsx
"use client";

// Import necessary modules and components
import React, { Fragment } from "react"; 
import { Dialog, Transition } from "@headlessui/react"; 
import { ClipLoader } from "react-spinners"; 

// LoadingModal component definition
const LoadingModal = () => {
  return (
    // Transition.Root provides a root transition context
    <Transition.Root show as={Fragment}>
      {/* Dialog component to display the modal */}
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Transition.Child handles the enter and leave transitions */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" 
          enterFrom="opacity-0" 
          enterTo="opacity-100" 
          leave="ease-in duration-200" 
          leaveFrom="ease-in duration-200" 
          leaveTo="opacity-0" 
        >
          {/* Background overlay */}
          <div
            className="
              fixed
              inset-0
              bg-gray-100
              bg-opacity-50
              transition-opacity
            "
          />
        </Transition.Child>

        {/* Container for the modal content */}
        <div
          className="
            fixed
            inset-0
            z-10
            overflow-y-auto
          "
        >
          <div
            className="
              flex
              min-h-full
              items-center
              justify-center
              p-3
              text-center
            "
          >
            {/* Dialog panel for the loader */}
            <Dialog.Panel>
              {/* Spinner loader */}
              <ClipLoader size={40} color="#0284c7" /> 
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Exporting the LoadingModal component
export default LoadingModal; 

```
### C:\Users\נדב\messenger-app\app\components\Modal.tsx

```tsx
// Using client-side rendering mode to ensure this component only runs on the client side
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { IoClose } from "react-icons/io5"; 

// Interface to type the props received by the Modal component
interface ModalProps {
  // Boolean to control visibility of the modal, optional
  isOpen?: boolean; 
  // Function to close the modal
  onClose: () => void; 
  // Content of the modal, can be any valid React node
  children: React.ReactNode; 
}

// Functional component for Modal, accepting props defined in ModalProps
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    // Transition.Root component to handle showing and hiding animations
    <Transition.Root
      // Determines if the modal is shown based on the isOpen prop
      show={isOpen} 
      // Uses React Fragment to avoid additional DOM elements
      as={Fragment} 
    >
      {/* Dialog component to create an accessible modal dialog */}
      <Dialog
        // Renders Dialog as a 'div'
        as="div" 
        // CSS for positioning and z-index
        className="relative z-50" 
        // Function called to close the dialog
        onClose={onClose} 
      >
        {/* Transition for fading the background when modal is opened/closed */}
        <Transition.Child
          // No additional DOM element for transition
          as={Fragment} 
          // Ease-out transition when entering
          enter="ease-out duration-300" 
          // Start from transparent
          enterFrom="opacity-0" 
          // End at fully opaque
          enterTo="opacity-100" 
          // Ease-in transition when leaving
          leave="ease-in duration-200" 
          // Start fully opaque
          leaveFrom="opacity-100" 
          // End transparent
          leaveTo="opacity-0" 
        >
          {/* Background overlay div, dark with opacity for modal backdrop */}
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        {/* Container for the modal content */}
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
           {/* Transition for modal content appearance */}
            <Transition.Child
              // No additional DOM element for transition
              as={Fragment} 
              // Transition timing and type for enter
              enter="ease-out duration-300" 
              // Start state for enter
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
              // End state for enter
              enterTo="opacity-100 translate-y-0 sm:scale-100" 
              // Transition timing and type for leave
              leave="ease-in duration-200" 
              // Start state for leave
              leaveFrom="opacity-100 translate-y-0 sm:scale-100" 
              // End state for leave
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
            >
              {/* Panel inside the modal for displaying content */}
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 text-left shadow-xl transition-all w-full sm:my-8 sm:max-w-lg sm:p-6">
                {/* Button to close the modal, positioned absolutely */}
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block z-10">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    // Calls onClose when clicked
                    onClick={onClose} 
                  >
                    {/* Accessible label for screen readers */}
                    <span className="sr-only">Close</span> 
                    {/* Icon for close button */}
                    <IoClose className="h-6 w-6" /> 
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Export the Modal component for use in other parts of the application
export default Modal;

```
### C:\Users\נדב\messenger-app\app\components\inputs\input.tsx

```tsx
"use client";

import clsx from "clsx"; 
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"; 

// Interface for the properties of the input component.
interface InputProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  // Function to register input in react-hook-form.
  register: UseFormRegister<FieldValues>; 
  // Object containing any errors for the fields in the form.
  errors: FieldErrors;
  disabled?: boolean;
}

// Create the input component.
const Input: React.FC<InputProps> = ({
  label,
  id,
  // Default input type to text if not specified.
  type = "text", 
  required,
  register,
  errors,
  disabled,
}) => {
  return (
    <div>
      <label
        className="
            block
            text-sm
            font-medium 
            leading-6 
            text-gray-900
        "
        // Associates the label with the input field using the id.
        htmlFor={id} 
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          id={id}
          type={type}
          // Uses the id for autoComplete attribute to match label.
          autoComplete={id} 
          // Disables input if disabled prop is true.
          disabled={disabled} 
          // Registers the input for validation and form data management, marking it as required if necessary.
          {...register(id, { required })} 
          className={clsx(`
          form-input
          block
          w-full
          rounded-md
          border-0
          py-1.5
          text-gray-900
          shadow-sm
          ring-1
          ring-inset
          ring-gray-300
          placeholder:text-gray-400
          focus:ring-2
          focus:ring-inset
          focus:ring-sky-600
          sm:text-sm
          sm:leading-6`,
            // Adds error styling if there's an error for this field.
            errors[id] && "focus:ring-rose-500", 
            // Adjusts styling if input is disabled.
            disabled && "opacity-50 cursor-default" 
          )}
        />
      </div>
    </div>
  );
};

// Export the Input component for use in other parts of the application.
export default Input; 

```
### C:\Users\נדב\messenger-app\app\components\inputs\Select.tsx

```tsx
"use client";

import ReactSelect from "react-select";

// Interface for the properties of the Select component.
interface SelectProps {
  disabled?: boolean;
  label: string;
  options: Record<string, any>[];
  onChange: (value: Record<string, any>) => void;
  value?: Record<string, any>;
}

// Create the Select component.
const Select: React.FC<SelectProps> = ({
  disabled,
  label,
  options,
  onChange,
  value,
}) => {
  return (
    <div className="z-[100]">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          // Disables the select if the disabled prop is true.
          isDisabled={disabled}
          // Sets the current value of the select.
          value={value}
          // Function to handle value change.
          onChange={onChange}
          // Allows multiple selections.
          isMulti
          // Options to display in the select.
          options={options}
          // Ensures the select menu portal is appended to the body.
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({
              ...base,
              // Ensures the select menu has a high z-index.
              zIndex: 9999,
            }),
          }}
          classNames={{
            // Adds custom styling to the control.
            control: () => "text-sm",
          }}
        />
      </div>
    </div>
  );
};

// Export the Select component for use in other parts of the application.
export default Select;

```
### C:\Users\נדב\messenger-app\app\components\sidebar\DesktopItem.tsx

```tsx
"use client";

 // Import clsx for conditionally joining classNames together
import clsx from "clsx";
// Import Link component from Next.js
import Link from "next/link"; 

interface DesktopItemProps {
  label: string;
  icon: any;
  href: string;
  onClick?: () => void;
  active?: boolean;
}

// Create the DesktopItem component
const DesktopItem: React.FC<DesktopItemProps> = ({
  label,
  icon: Icon,
  href,
  onClick,
  active,
}) => {
  const handleClick = () => {
    if (onClick) {
      return onClick(); // Call the onClick handler if provided
    }
  };

  return (
    <li onClick={handleClick}>
      <Link
        href={href}
        className={clsx(
          `
          group
          flex
          gap-x-3
          rounded-md
          p-3
          text-sm
          leading-6
          font-semibold
          text-gray-500
          hover:text-black
          hover:bg-gray-100
  `,
          active && "bg-gray-100 text-black" // Apply active styles if the item is active
        )}
      >
        <Icon className="h-6 w-6 shrink-0" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem; // Export the DesktopItem component

```
### C:\Users\נדב\messenger-app\app\components\sidebar\DesktopSidebar.tsx

```tsx
"use client";

// Import custom hook to get routes
import useRoutes from "@/app/hooks/useRoutes";
// Import useState hook from React
import { useState } from "react";
// Import DesktopItem component
import DesktopItem from "./DesktopItem";
// Import Avatar component
import Avatar from "../Avatar";
// Import User type from Prisma client
import { User } from "@prisma/client";
// Import SettingsModal component
import SettingsModal from "./SettingsModal";

interface DesktopSidebarProps {
  currentUser: User;
}

// Create the DesktopSidebar component
const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
 // State to handle the visibility of the settings modal
 const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <div
        className="
          hidden 
          lg:fixed 
          lg:inset-y-0 
          lg:left-0 
          lg:z-40 
          lg:w-20 
          xl:px-6
          lg:overflow-y-auto 
          lg:bg-white 
          lg:border-r-[1px]
          lg:pb-4
          lg:flex
          lg:flex-col
          justify-between
      "
      >
        {/* Navigation for desktop items */}
        <nav className="mt-4 flex flex-col justify-between">
          <ul role="list" className="flex flex-col items-center space-y-1">
            {routes.map((item) => (
              <DesktopItem
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
                onClick={item.onClick}
              />
            ))}
          </ul>
        </nav>
        <nav className="mt-4 flex flex-col justify-between items-center">
          <div
            onClick={() => setIsOpen(true)}
            className="cursor-pointer hover:opacity-75 transition"
          >
            <Avatar user={currentUser} />
          </div>
        </nav>
      </div>
    </>
  );
};

export default DesktopSidebar;

```
### C:\Users\נדב\messenger-app\app\components\sidebar\MobileFooter.tsx

```tsx
"use client";

import useConversation from "@/app/hooks/useConversation"; 
import useRoutes from "@/app/hooks/useRoutes"; 
import MobileItem from "./MobileItem"; 

// Create the MobileFooter component
const MobileFooter = () => {
  const routes = useRoutes(); 
   // Get conversation open state using the custom hook
  const { isOpen } = useConversation();

  if (isOpen) {
    // If a conversation is open, do not render the footer
    return null; 
  }

  return (
    <div
      className="
        fixed
        justify-between
        w-full
        bottom-0
        z-40
        flex
        items-center
        bg-white
        border-t-[1px]
        lg:hidden
    "
    >
      {routes.map((route) => (
        <MobileItem
          key={route.label}
          href={route.href}
          active={route.active}
          icon={route.icon}
          onClick={route.onClick}
        />
      ))}
    </div>
  );
};

export default MobileFooter; 

```
### C:\Users\נדב\messenger-app\app\components\sidebar\MobileItem.tsx

```tsx
"use client";

import Link from "next/link"; 
import clsx from "clsx"; 

interface MobileItemProps {
  href: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
}

// Create the MobileItem component
const MobileItem: React.FC<MobileItemProps> = ({
  href,
  icon: Icon,
  active,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      // Call the onClick handler if provided
      return onClick(); 
    }
  };

  return (
    <Link
      onClick={handleClick}
      href={href}
      className={clsx(
        `
        group
        flex
        gap-x-3
        text-sm
        leading-6
        font-semibold
        w-full
        justify-center
        p-4
        text-gray-500
        hover:text-black
        hover:bg-gray-100
      `,// Apply active styles if the item is active
        active && "bg-gray-100 text-black" 
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
};

export default MobileItem; 

```
### C:\Users\נדב\messenger-app\app\components\sidebar\SettingsModal.tsx

```tsx
"use client";

import { User } from "@prisma/client"; 
import axios from "axios"; 
import { useRouter } from "next/navigation"; 
import { useState } from "react"; 
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; 
import toast from "react-hot-toast"; 
import Modal from "../Modal"; 
import Input from "../inputs/input"; 
import Image from "next/image"; 
import { CldUploadButton } from "next-cloudinary";
import Button from "../Button"; 

// Define the properties for the SettingsModal component
interface SettingsModalProps {
  // The current user object
  currentUser: User; 
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
}

// Create the SettingsModal component
const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const router = useRouter(); // Initialize useRouter hook for client-side navigation
  const [isLoading, setIsLoading] = useState(false); // State to handle loading state

  // Initialize useForm hook with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name, // Set default value for name
      image: currentUser?.image, // Set default value for image
    },
  });

  const image = watch("image"); // Watch the image field for changes

  // Handle the image upload and set the image value in the form
  const handleUpload = (result: any) => {
    setValue("image", result?.info?.secure_url, {
      shouldValidate: true, // Validate the field after setting the value
    });
  };

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // Set loading state to true

    axios
      // Post the data to the API
      .post("/api/settings", data) 
      .then(() => {
        // Refresh the page on success
        router.refresh(); 
        // Close the modal on success
        onClose(); 
      })
      // Show error toast on failure
      .catch(() => toast.error("Something went wrong")) 
      // Reset loading state
      .finally(() => setIsLoading(false)); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Form to handle settings */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Edit your public information.
            </p>

            <div className="mt-10 flex flex-col gap-y-8">
              {/* Input for name */}
              <Input
                disabled={isLoading}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />

              <div>
                <label
                  className="
                    block
                    text-sm
                    font-medium
                    leading-6 
                  text-gray-900
                  "
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    width={48}
                    height={48}
                    className="rounded-full"
                    src={
                      image || currentUser?.image || "/images/placeholder.jpg"
                    }
                    alt="Avatar"
                  />
                  {/* Upload button for the photo */}
                  <CldUploadButton
                    options={{ maxFiles: 1 }}
                    onSuccess={handleUpload}
                    uploadPreset="th9qnijk"
                  >
                    <Button disabled={isLoading} secondary type="button">
                      Change
                    </Button>
                  </CldUploadButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button disabled={isLoading} secondary onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal; 

```
### C:\Users\נדב\messenger-app\app\components\sidebar\Sidebar.tsx

```tsx
import getCurrentUser from "@/app/actions/getCurrentUser"; 
import MobileFooter from "./MobileFooter"; 
import DesktopSidebar from "./DesktopSidebar"; 

// Create the Sidebar component
async function Sidebar({ children }: { children: React.ReactNode }) {
  // Get the current user
  const currentUser = await getCurrentUser(); 

  return (
    <div className="h-full">
      <DesktopSidebar currentUser={currentUser!} />
      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
}

export default Sidebar; 

```
### C:\Users\נדב\messenger-app\app\context\AuthContext.tsx

```tsx
"use client";

import { SessionProvider } from "next-auth/react"; 

// Define the properties for the AuthContext component
interface AuthContextProps {
  // Children elements to be rendered inside the context
  children: React.ReactNode; 
}

// Create the AuthContext component to provide authentication context
export default function AuthContext({ children }: AuthContextProps) {
  // Wrap children with SessionProvider to provide session context
  return <SessionProvider>{children}</SessionProvider>; 
}

```
### C:\Users\נדב\messenger-app\app\context\ToasterContext.tsx

```tsx
"use client";

import { Toaster } from "react-hot-toast"; 

// Create the ToasterContext component to provide toast notifications context
const ToasterContext = () => {
  return (
    // Render the Toaster component to enable toast notifications
    <Toaster /> 
  );
};

// Export the ToasterContext component
export default ToasterContext; 

```
### C:\Users\נדב\messenger-app\app\conversations\layout.tsx

```tsx
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

```
### C:\Users\נדב\messenger-app\app\conversations\loading.tsx

```tsx
import LoadingModal from "../components/LoadingModal";

// Define the Loading component
const Loading = () => {
  // Use the LoadingModal component for /conversations
  return <LoadingModal />;
};

// Export the Loading component
export default Loading;


```
### C:\Users\נדב\messenger-app\app\conversations\page.tsx

```tsx
"use client"; 

import clsx from "clsx"; 
import useConversation from "../hooks/useConversation"; 
import EmptyState from "../components/EmptyState"; 

// Define the Home component
const Home = () => {
  // Retrieve the isOpen property from the useConversation hook to determine if the conversation UI should be open
  const { isOpen } = useConversation();

  // Render the component with conditional classes and content
  return (
    <div
      className={clsx(
        "lg:pl-80 h-full lg:block", 
        isOpen ? 'block' : 'hidden' 
      )}
    >
      <EmptyState /> 
    </div>
  );
};

export default Home;

```
### C:\Users\נדב\messenger-app\app\conversations\components\ConversationBox.tsx

```tsx
"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";

import { FullConversationType } from "@/app/types";
import useOtherUser from "@/app/hooks/useOtherUser";
import Avatar from "@/app/components/Avatar";
import AvatarGroup from "@/app/components/GroupAvatar";

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean; 
}

// Create the ConversationBox component
const ConversationBox: React.FC<ConversationBoxProps> = ({ data, selected }) => {
  // Get the other user in the conversation
  const otherUser = useOtherUser(data); 
  // Get the current session
  const session = useSession(); 
  // Get the router instance
  const router = useRouter(); 

  // Handle click event to navigate to the conversation
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`);
  }, [data.id, router]);

  // Get the last message in the conversation
  const lastMessage = useMemo(() => {
    const messages = data.messages || [];
    return messages[messages.length - 1];
  }, [data.messages]);

  // Get the current user's email
  const userEmail = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  // Determine if the last message has been seen by the user
  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }
    const seenArray = lastMessage.seen || [];
    if (!userEmail) {
      return false;
    }
    return seenArray.filter((user) => user.email === userEmail).length !== 0;
  }, [userEmail, lastMessage]);

  // Get the text for the last message
  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      return 'Sent an image';
    }
    if (lastMessage?.body) {
      return lastMessage.body;
    }
    return "Started a conversation";
  }, [lastMessage]);

  return (
    <div
    // Handle click to navigate to the conversation
      onClick={handleClick} 
      className={clsx(`
        w-full,
        relative
        flex
        items-center
        space-x-3
        hover:bg-neutral-100
        rounded-lg
        transition
        cursor-pointer
        p-3
      `,
      // Apply selected styles if the conversation is selected
        selected ? 'bg-neutral-100' : 'bg-white' 
      )}
    >
      {data.isGroup ? (
        // Display group avatar if it's a group conversation
        <AvatarGroup users={data.users} /> 
      ) : (
        // Display user avatar if it's a single conversation
        <Avatar user={otherUser} /> 
      )}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div
            className="
              flex
              justify-between
              items-center
              mb-1
            "
          >
            <p
              className="
                text-md
                font-medium
                text-gray-900
              "
            >
               {/* Display conversation name or other user's name */}
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p
                className="
                  text-xs
                  text-gray-400
                  font-light
                "
              >
                {/* Display formatted creation time of the last message */}
                {format(new Date(lastMessage.createdAt), 'p')} 
              </p>
            )}
          </div>
          <p
            className={clsx(`
              truncate
              text-sm
            `,
            // Apply styles based on whether the message has been seen
              hasSeen ? 'text-gray-500' : 'text-black font-medium' 
            )}
          >
            {/* Display the last message text */}
            {lastMessageText} 
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConversationBox; 

```
### C:\Users\נדב\messenger-app\app\conversations\components\ConversationList.tsx

```tsx
"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineGroupAdd } from "react-icons/md";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";

import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

// Create the ConversationList component
const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  const session = useSession(); 
  // State to manage conversation items
  const [items, setItems] = useState(initialItems); 
  // State to manage the modal open/close
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const router = useRouter(); // Get the router instance

  // Custom hook to get the current conversation state
  const { conversationId, isOpen } = useConversation(); 

  // Get the pusher key based on the user's email
  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  // UseEffect hook to subscribe to Pusher events
  useEffect(() => {
    if (!pusherKey) {
      return;
    }

    pusherClient.subscribe(pusherKey);

    // Handle new conversation event
    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        }
        return [conversation, ...current];
      });
    };

    // Handle update conversation event
    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          if (currentConversation.id === conversation.id) {
            return {
              ...currentConversation,
              messages: conversation.messages,
            };
          }
          return currentConversation;
        })
      );
    };

    // Handle remove conversation event
    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)];
      });

      if (conversationId === conversation.id) {
        router.push("/conversations");
      }
    };

    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:remove", removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind("conversation:new", newHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:remove", removeHandler);
    };
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <GroupChatModal
        // Pass users to the GroupChatModal
        users={users}
        // Pass modal open state to the GroupChatModal
        isOpen={isModalOpen}
        // Function to close the modal
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={clsx(
          `
          fixed
          inset-y-0
          pb-20
          lg:pb-0
          lg:left-20
          lg:w-80
          lg:block
          overflow-y-auto
          border-r
          border-gray-200
        `,
          // Apply styles based on whether the conversation is open
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div
              className="
              text-2xl
              font-bold
              text-neutral-800
            "
            >
              Messages
            </div>
            <div
              // Open the modal on click
              onClick={() => setIsModalOpen(true)}
              className="
                rounded-full
                p-2
                bg-gray-100
                text-gray-600
                cursor-pointer
                hover:opacity-75
                transition
              "
            >
              {/* Icon for adding a group */}
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              // Unique key for each conversation
              key={item.id}
              // Pass conversation data to ConversationBox
              data={item}
              // Pass selected state to ConversationBox
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList; 
```
### C:\Users\נדב\messenger-app\app\conversations\components\GroupChatModal.tsx

```tsx
"use client";

import Button from "@/app/components/Button";
import Modal from "@/app/components/Modal";
import Select from "@/app/components/inputs/Select";
import Input from "@/app/components/inputs/input";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Define the properties for the GroupChatModal component
interface GroupChatModalProps {
  users: User[];
  isOpen?: boolean;
  onClose: () => void;
}

// Create the GroupChatModal component
const GroupChatModal: React.FC<GroupChatModalProps> = ({
  users,
  isOpen,
  onClose,
}) => {
  // Get the router instance
  const router = useRouter(); 
  // State to manage loading state
  const [isLoading, setIsLoading] = useState(false); 

  // Set up the form using react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      // Default value for the group name
      name: "", 
      // Default value for the members array
      members: [], 
    },
  });

  // Watch the members field
  const members = watch("members"); 

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Set loading state to true
    setIsLoading(true); 

    axios
      .post("/api/conversations", {
        ...data,
        // Indicate that this is a group conversation
        isGroup: true, 
      })
      .then(() => {
        // Refresh the page on success
        router.refresh(); 
        // Close the modal on success
        onClose(); 
      })
      // Show error toast on failure
      .catch(() => toast.error("Something went wrong")) 
      .finally(() => {
        // Set loading state to false
        setIsLoading(false); 
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12 ">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Create a new group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-700">
              Create a chat with more than 2 people.
            </p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                // Register the input field with react-hook-form
                register={register} 
                // Label for the input field
                label="name" 
                // ID for the input field
                id="name" 
                // Disable the input field if loading
                disabled={isLoading} 
                // Mark the input field as required
                required 
                // Pass any validation errors
                errors={errors} 
              />
              <Select
                // Disable the select field if loading
                disabled={isLoading} 
                // Label for the select field
                label="Members" 
                // Map users to options for the select field
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))} 
                // Handle value change for the select field
                onChange={(value) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                } 
                // Value of the select field
                value={members} 
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-3">
          <Button
            disabled={isLoading}
            type="button"
            secondary
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            type="submit"
          >
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\page.tsx

```tsx
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

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\Body.tsx

```tsx
"use client";

import useConversation from "@/app/hooks/useConversation"; 
import { FullMessageType } from "@/app/types"; 
import { useEffect, useRef, useState } from "react"; 
import MessageBox from "./MessageBox"; 
import axios from "axios"; 
import { pusherClient } from "@/app/libs/pusher"; 
import { find } from "lodash"; 

// Define properties for the Body component
interface BodyProps {
  initialMessages: FullMessageType[]; // Array of initial messages
}

// Create the Body component
const Body: React.FC<BodyProps> = ({ initialMessages }) => {
  // State to store messages
  const [messages, setMessages] = useState(initialMessages); 
  // Reference to the scroll container
  const containerRef = useRef<HTMLDivElement>(null); 
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 

  // Mark the conversation as seen when component mounts
  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  // Subscribe to Pusher events for new and updated messages
  useEffect(() => {
    // Subscribe to Pusher channel for this conversation
    pusherClient.subscribe(conversationId); 

    // Handler for new messages
    const messageHandler = (message: FullMessageType) => {
      // Mark conversation as seen
      axios.post(`/api/conversations/${conversationId}/seen`); 

      setMessages((current) => {
        if (find(current, { id: message.id })) {
          // If message already exists, return current messages
          return current; 
        }
        // Add new message to messages
        return [...current, message]; 
      });
    };

    // Handler for updated messages
    const updatedMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            // Update message if IDs match
            return newMessage; 
          }
          // Return current message otherwise
          return currentMessage; 
        })
      );
    };

    // Bind handlers to Pusher events
    pusherClient.bind("messages:new", messageHandler);
    pusherClient.bind("message:update", updatedMessageHandler);

    // Cleanup: Unsubscribe and unbind handlers on component unmount
    return () => {
      pusherClient.unsubscribe(conversationId);
      pusherClient.unbind("messages:new", messageHandler);
      pusherClient.unbind("message:update", updatedMessageHandler);
    };
  }, [conversationId]);

  // Scroll to the bottom of the container whenever the messages state updates
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          // Check if this is the last message
          isLast={i === messages.length - 1} 
          // Unique key for each message
          key={message.id} 
          // Message data passed to MessageBox component
          data={message} 
        />
      ))}
    </div>
  );
};

// Export the Body component
export default Body; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\ConfirmModal.tsx

```tsx
"use client";

// Import necessary components and hooks
import Button from "@/app/components/Button"; 
import Modal from "@/app/components/Modal"; 
import useConversation from "@/app/hooks/useConversation"; 
import { Dialog } from "@headlessui/react"; 
import axios from "axios"; 
import { useRouter } from "next/navigation"; 
import { useCallback, useState } from "react"; 
import { toast } from "react-hot-toast"; 
import { FiAlertTriangle } from "react-icons/fi"; 

// Define properties for the ConfirmModal component
interface ConfirmModalProps {
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
}

// Create the ConfirmModal component
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose
}) => {
  // Initialize useRouter for navigation
  const router = useRouter(); 
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 
  // State to handle loading state
  const [isLoading, setIsLoading] = useState(false); 

  // Handle delete action
  const onDelete = useCallback(() => {
    // Set loading state to true
    setIsLoading(true); 

    // Make delete request to API
    axios.delete(`/api/conversations/${conversationId}`) 
    .then(() => {
      // Close the modal on success
      onClose(); 
      // Navigate to conversations page
      router.push('/conversations'); 
      // Refresh the page
      router.refresh(); 
    })
    // Show error toast on failure
    .catch(() => toast.error('Something went wrong!')) 
    // Reset loading state
    .finally(() => setIsLoading(false)); 
  }, [conversationId, router, onClose]);

  return ( 
    <Modal
      // Pass isOpen prop to Modal component
      isOpen={isOpen} 
      // Pass onClose prop to Modal component
      onClose={onClose} 
    >
      <div className="sm:flex sm:items-start">
        <div
          className="
            mx-auto
            flex
            h-12
            w-12
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            bg-red-100
            sm:mx-0
            sm:h-10
            sm:w-10
          "
        >
          <FiAlertTriangle
            className="h-6 w-6 text-red-600" // Alert icon with red color
          />
        </div>
        <div
          className="
            mt-3
            text-center
            sm:ml-4
            sm:mt-0
            sm:text-left
          "
        >
          <Dialog.Title
            as="h3"
            className="
              text-base
              font-semibold
              leading-6
              text-gray-900
            "
          >
            Delete conversation
          </Dialog.Title>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <div
        className="
          mt-5
          sm:mt-4
          sm:flex
          sm:flex-row-reverse
        "
      >
        <Button
          // Disable button if loading
          disabled={isLoading} 
          danger
          // Handle delete action on click
          onClick={onDelete} 
        >
          Delete
        </Button>
        <Button
          // Disable button if loading
          disabled={isLoading} 
          secondary
          // Handle close action on click
          onClick={onClose} 
        >
          Cancel
        </Button>
      </div>
    </Modal>
   );
}
 
// Export the ConfirmModal component
export default ConfirmModal; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\Form.tsx

```tsx
"use client";

// Import necessary hooks and libraries
import useConversation from "@/app/hooks/useConversation"; 
import axios from "axios"; 
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"; 
import { HiPhoto, HiPaperAirplane } from "react-icons/hi2"; 
import MessageInput from "./MessageInput"; 
import { CldUploadButton } from "next-cloudinary"; 

// Create the Form component
const Form = () => {
  // Get conversation ID from custom hook
  const { conversationId } = useConversation(); 

  // Initialize useForm hook with default values
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      // Default value for message input
      message: "", 
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    // Reset the message input field
    setValue("message", "", { shouldValidate: true }); 
    axios.post("/api/messages", {
      ...data,
      // Include conversation ID in the request data
      conversationId, 
    });
  };

  // Handle image upload
  const handleUpload = (result: any) => {
    axios.post('/api/messages', {
      // Get the secure URL of the uploaded image
      image: result?.info?.secure_url, 
      // Include conversation ID in the request data
      conversationId 
    });
  }

  return (
    <div
      className="
        py-4
        px-4
        bg-white
        border-t
        flex
        items-center
        gap-2
        lg:gap-4
        w-full
      "
    >
      {/* Cloudinary Upload Button */}
      <CldUploadButton
        // Allow only one file to be uploaded
        options={{ maxFiles: 1 }} 
        // Handle the upload success
        onSuccess={handleUpload} 
        uploadPreset="th9qnijk"
      >
        {/* Display photo icon */}
        <HiPhoto size={30} className="text-sky-500" /> 
      </CldUploadButton>
      {/* Form for sending messages */}
      <form
        // Handle form submission
        onSubmit={handleSubmit(onSubmit)} 
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          // Input ID for the message
          id="message" 
          // Register the input with react-hook-form
          register={register} 
          // Pass validation errors
          errors={errors} 
          // Make the input required
          required 
          // Placeholder text
          placeholder="Write a message here" 
        />
        <button
          // Set button type to submit
          type="submit" 
          className="
            rounded-full
            p-2
            bg-sky-500
            cursor-pointer
            hover:bg-sky-600
            transition
          "
        >
          {/* Display send icon */}
          <HiPaperAirplane size={18} className="text-white" /> 
        </button>
      </form>
    </div>
  );
};

// Export the Form component
export default Form; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\Header.tsx

```tsx
"use client";

import { Conversation, User } from "@prisma/client"; 
import useOtherUser from "@/app/hooks/useOtherUser"; 
import { useMemo, useState } from "react"; 
import Link from "next/link"; 
import { HiChevronLeft, HiEllipsisHorizontal } from "react-icons/hi2"; 
import Avatar from "@/app/components/Avatar"; 
import AvatarGroup from "@/app/components/GroupAvatar"; 
import ProfileDrawer from "./ProfileDrawer"; 
import useActiveList from "@/app/hooks/useActiveList"; 

// Define properties for the Header component
interface HeaderProps {
  // Extend Conversation type to include an array of users
  conversation: Conversation & {
    users: User[]; 
  };
}

// Create the Header component
const Header: React.FC<HeaderProps> = ({ conversation }) => {
  // Get other user details
  const otherUser = useOtherUser(conversation); 
  // State to handle drawer open/close
  const [drawerOpen, setDrawerOpen] = useState(false); 

  // Get list of active members
  const { members } = useActiveList(); 
  // Check if the other user is active
  const isActive = members.indexOf(otherUser?.email!) !== -1; 

  // Determine the status text based on the conversation type and user activity
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      // Show the number of members if it's a group conversation
      return `${conversation.users.length} members`; 
    }
    // Show active or offline status for individual conversation
    return isActive ? 'Active' : 'Offline'; 
  }, [conversation, isActive]);

  return (
    <>
      {/* ProfileDrawer component for viewing user profile */}
      <ProfileDrawer
        // Pass conversation data
        data={conversation} 
        // Pass drawer open state
        isOpen={drawerOpen} 
        // Handle drawer close
        onClose={() => setDrawerOpen(false)} 
      />
      <div
        className="
          bg-white
          w-full
          flex
          border-b-[1px]
          sm:px-4
          py-3
          px-4
          lg:px-6
          justify-between
          items-center
          shadow-sm
        "
      >
        <div className="flex gap-3 items-center">
          <Link
            className="
              lg:hidden
              block
              text-sky-500
              hover:text-sky-600
              transition
              cursor-pointer
            "
            // Link to conversations page
            href="/conversations" 
          >
            {/* Display back icon */}
            <HiChevronLeft size={32} /> 
          </Link>
          {conversation.isGroup ? (
            // Display group avatar for group conversation
            <AvatarGroup users={conversation.users} /> 
          ) : (
            // Display avatar for individual conversation
            <Avatar user={otherUser} /> 
          )}
          <div className="flex flex-col">
            <div>
              {/* Display conversation name or other user's name */}
              {conversation.name || otherUser.name} 
            </div>
            <div
              className="
                text-sm
                font-light
                text-neutral-500
              "
            >
              {/* Display status text */}
              {statusText} 
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          size={32}
          // Handle drawer open
          onClick={() => setDrawerOpen(true)} 
          className="
            text-sky-500
            cursor-pointer
            hover:text-sky-600
            transition
          "
        />
      </div>
    </>
  );
};

// Export the Header component
export default Header; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\ImageModal.tsx

```tsx
"use client";

// Import necessary components
import Modal from "@/app/components/Modal"; 
import Image from "next/image"; 

// Define properties for the ImageModal component
interface ImageModalProps {
  // Boolean to control if the modal is open
  isOpen?: boolean; 
  // Function to handle closing the modal
  onClose: () => void; 
  // Source URL of the image
  src?: string | null; 
}

// Create the ImageModal component
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src }) => {
  if (!src) {
    // Return null if no source URL is provided
    return null; 
  }

  return (
    // Render Modal component
    <Modal isOpen={isOpen} onClose={onClose}> 
      <div className="w-full h-full flex justify-center items-center p-4">
        <Image
          alt="Image"
          layout="responsive"
          width={700}
          height={700}
          objectFit="contain"
          // Source URL of the image
          src={src} 
        />
      </div>
    </Modal>
  );
};

// Export the ImageModal component
export default ImageModal; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\MessageBox.tsx

```tsx
"use client";

import Avatar from "@/app/components/Avatar"; 
import { FullMessageType } from "@/app/types"; 
import clsx from "clsx"; 
import { useSession } from "next-auth/react"; 
import { format } from "date-fns"; 
import Image from "next/image"; 
import { useState } from "react"; 
import ImageModal from "./ImageModal"; 

// Define properties for the MessageBox component
interface MessageBoxProps {
  // Message data
  data: FullMessageType; 
  // Boolean to check if this is the last message
  isLast?: boolean; 
}

// Create the MessageBox component
const MessageBox: React.FC<MessageBoxProps> = ({
  data,
  isLast
}) => {
  // Get the current session
  const session = useSession(); 
  // State to handle image modal open/close
  const [imageModalOpen, setImageModalOpen] = useState(false); 

  // Check if the message is sent by the current user
  const isOwn = session?.data?.user?.email === data?.sender?.email; 
  // List of users who have seen the message
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(', '); 

  const container = clsx(
    "flex gap-3 p-4",
    // Align message to the right if it's sent by the current user
    isOwn && "justify-end" 
  );

  const avatar = clsx(isOwn && "order-2"); 

  const body = clsx(
    "flex flex-col gap-2",
    // Align message body to the right if it's sent by the current user
    isOwn && "items-end" 
  );

  const message = clsx(
    "text-sm w-fit overflow-hidden",
    // Apply different styles based on the sender
    isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100', 
    // Apply different styles if the message contains an image
    data.image ? 'rounded-md p-0' : 'rounded-full py-2 px-3' 
  );

  return (
    <div className={container}>
      <div className={avatar}>
        {/* Display sender's avatar */}
        <Avatar user={data.sender} /> 
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">
            {/* Display sender's name */}
            {data.sender.name} 
          </div>
          <div className="text-xs text-gray-400">
            {/* Display message timestamp */}
            {format(new Date(data.createdAt), 'p')} 
          </div>
        </div>
        <div className={message}>
          <ImageModal
            // Source URL of the image
            src={data.image} 
            // Control modal open state
            isOpen={imageModalOpen} 
            // Handle modal close
            onClose={() => setImageModalOpen(false)} 
          />
          {data.image ? (
            <Image
              // Handle image click to open modal
              onClick={() => setImageModalOpen(true)} 
              alt="Image"
              height="288"
              width="288"
              src={data.image}
              className="
                object-cover
                cursor-pointer
                hover:scale-110
                transition
                translate
              "
            />
          ) : (
            // Display message body if no image is present
            <div>{data.body}</div> 
          )}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div
            className="
              text-xs
              font-light
              text-gray-500
            "
          >
            {/* Display seen by list */}
            {`Seen by ${seenList}`} 
          </div>
        )}
      </div>
    </div>
  );
};

// Export the MessageBox component
export default MessageBox; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\MessageInput.tsx

```tsx
"use client";

import {
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormRegister,
} from "react-hook-form";

// Define properties for the MessageInput component
interface MessageInputProps {
  // ID for the input element
  id: string; 
  // Placeholder text for the input
  placeholder?: string; 
  // Type of the input element
  type?: string; 
  // Whether the input is required
  required?: boolean; 
  // Register function from react-hook-form
  register: UseFormRegister<FieldValues>; 
  // Validation errors from react-hook-form
  errors: FieldErrors; 
}

// Create the MessageInput component
const MessageInput: React.FC<MessageInputProps> = ({
  id,
  placeholder,
  type,
  required,
  register,
  errors,
}) => {
  return (
    <div className="relative w-full">
      <input
        // Set input ID
        id={id} 
        // Set input type
        type={type} 
        // Set autocomplete attribute
        autoComplete={id} 
        // Register the input with react-hook-form
        {...register(id, { required })} 
        // Set placeholder text
        placeholder={placeholder} 
        className="
          text-black
          font-light
          py-2
          px-4
          bg-neutral-100
          w-full
          rounded-full
          focus:outline-none
        "
      />
    </div>
  );
};

// Export the MessageInput component
export default MessageInput; 

```
### C:\Users\נדב\messenger-app\app\conversations\[conversationId]\components\ProfileDrawer.tsx

```tsx
"use client"
// Import necessary hooks and components
import useOtherUser from "@/app/hooks/useOtherUser"; 
import { Conversation, User } from "@prisma/client"; 
import { Fragment, useMemo, useState } from "react"; 
import { format } from "date-fns"; 
import { Dialog, Transition } from "@headlessui/react"; 
import { IoClose, IoTrash } from "react-icons/io5"; 
import Avatar from "@/app/components/Avatar"; 
import ConfirmModal from "./ConfirmModal"; 
import AvatarGroup from "@/app/components/GroupAvatar"; 
import useActiveList from "@/app/hooks/useActiveList"; 

// Define properties for the ProfileDrawer component
interface ProfileDrawerProps {
  // Boolean to control if the drawer is open
  isOpen: boolean; 
  // Function to handle closing the drawer
  onClose: () => void; 
  // Extend Conversation type to include an array of users
  data: Conversation & {
    users: User[]; 
  };
}

// Create the ProfileDrawer component
const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  // Get other user details
  const otherUser = useOtherUser(data); 
  // State to handle confirm modal open/close
  const [confirmOpen, setConfirmOpen] = useState(false); 
  // Get list of active members
  const { members } = useActiveList(); 
  // Check if the other user is active
  const isActive = members.indexOf(otherUser?.email!) !== -1; 

  // Format the joined date of the other user
  const joinedDate = useMemo(() => {
    // Format date as 'PP'
    return format(new Date(otherUser.createdAt), "PP"); 
  }, [otherUser.createdAt]);

  // Determine the title based on the conversation or other user's name
  const title = useMemo(() => {
    // Return conversation name or other user's name
    return data.name || otherUser.name; 
  }, [data.name, otherUser.name]);

  // Determine the status text based on the conversation type and user activity
  const statusText = useMemo(() => {
    if (data.isGroup) {
      // Show the number of members if it's a group conversation
      return `${data.users.length} members`; 
    }
    // Show active or offline status for individual conversation
    return isActive ? "Active" : "Offline"; 
  }, [data, isActive]);

  return (
    <>
      {/* ConfirmModal component for confirming deletion */}
      <ConfirmModal
        // Pass confirm modal open state
        isOpen={confirmOpen} 
        // Handle confirm modal close
        onClose={() => setConfirmOpen(false)} 
      />
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500" 
            enterFrom="opacity-0" 
            enterTo="opacity-100" 
            leave="ease-in duration-500" 
            leaveFrom="opacity-100" 
            leaveTo="opacity-0" 
          >
            <div
              className="
                fixed
                inset-0
                bg-black
                bg-opacity-40
              "
            />
          </Transition.Child>

          <div
            className="
              fixed
              inset-0
              overflow-hidden
            "
          >
            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
            >
              <div
                className="
                pointer-events-none
                fixed
                inset-y-0
                right-0
                flex
                max-w-full
                pl-10
              "
              >
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500" 
                  enterFrom="translate-x-full" 
                  enterTo="translate-x-0" 
                  leave="transform transition ease-in-out duration-500" 
                  leaveTo="translate-x-full" 
                >
                  <Dialog.Panel
                    className="
                      pointer-events-auto
                      w-screen
                      max-w-md
                    "
                  >
                    <div
                      className="
                        flex
                        h-full
                        flex-col
                        overflow-y-scroll
                        bg-white
                        py-6
                        shadow-xl
                      "
                    >
                      <div className="px-4 sm:px-6">
                        <div
                          className="
                            flex
                            items-start
                            justify-end
                          "
                        >
                          <div
                            className="
                            ml-3
                            flex
                            h-7
                            items-center
                          "
                          >
                            <button
                              // Handle drawer close
                              onClick={onClose} 
                              type="button"
                              className="
                                rounded-md
                                bg-white
                                text-gray-400
                                hover:text-gray-500
                                focus:outline-none
                                focus:ring-2
                                focus:ring-sky-500
                                focus:ring-offset-2
                              "
                            >
                              <span className="sr-only">Close panel</span>
                              {/* Display close icon */}
                              <IoClose size={24} /> 
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="
                        relative mt-6
                        flex-1 px-4
                        sm:px-6
                      "
                      >
                        <div
                          className="
                          flex flex-col items-center
                        "
                        >
                          <div className="mb-2">
                            {data.isGroup ? (
                              // Display group avatar for group conversation
                              <AvatarGroup users={data.users} /> 
                            ) : (
                              // Display avatar for individual conversation
                              <Avatar user={otherUser} /> 
                            )}
                          </div>
                          <div>{title}</div> {/* Display conversation title */}
                          <div
                            className="
                            text-sm text-gray-500
                          "
                          >
                            {/* Display status text */}
                            {statusText} 
                          </div>
                          <div className="flex gap-10 my-8">
                            <div
                              // Handle confirm modal open
                              onClick={() => setConfirmOpen(true)} 
                              className="
                                flex
                                flex-col
                                gap-3
                                items-center
                                cursor-pointer
                                hover:opacity-75
                              "
                            >
                              <div
                                className="
                                  w-10
                                  h-10
                                  bg-neutral-100
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                "
                              >
                                <IoTrash size={20} />{" "}
                                {/* Display delete icon */}
                              </div>
                              <div
                                className="
                                  text-sm
                                  font-light
                                  text-neutral-600
                                "
                              >
                                Delete
                              </div>
                            </div>
                          </div>
                          <div
                            className="
                              w-full
                              pb-5
                              pt-5
                              sm:px-0
                              sm:pt-0
                            "
                          >
                            <dl
                              className="
                                space-y-8
                                px-4
                                sm:space-y-6
                                sm:px-6
                              "
                            >
                              {data.isGroup && (
                                <div>
                                  <dt
                                    className="
                                      text-sm
                                      font-medium
                                      text-gray-500
                                      sm:w-40
                                      sm:flex-shrink-0
                                    "
                                  >
                                    Emails
                                  </dt>
                                  <dd
                                    className="
                                        mt-1
                                        text-sm
                                        text-gray-900
                                        sm:col-span-2
                                      "
                                  >
                                    {data.users.map((user) => (
                                      <div className="pt-1" key={user.email}>{user.email}</div>
                                    ))}{" "}
                                    {/* Display emails of group members */}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <div>
                                  <dt
                                    className="
                                      text-sm
                                      font-medium
                                      text-gray-500
                                      sm:w-40
                                      sm:flex-shrink-0
                                    "
                                  >
                                    Email
                                  </dt>
                                  <dd
                                    className="
                                      mt-1
                                      text-sm
                                      text-gray-900
                                      sm:col-span-2
                                    "
                                  >
                                    {otherUser.email}{" "}
                                    {/* Display email of the other user */}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <>
                                  <hr />
                                  <div>
                                    <dt
                                      className="
                                        text-sm
                                        font-medium
                                        text-gray-500
                                        sm:w-40
                                        sm:flex-shrink-0
                                      "
                                    >
                                      Joined
                                    </dt>
                                    <dd
                                      className="
                                        mt-1
                                        text-sm
                                        text-gray-900
                                        sm:col-span-2
                                      "
                                    >
                                      <time dateTime={joinedDate}>
                                        {joinedDate} {/* Display joined date */}
                                      </time>
                                    </dd>
                                  </div>
                                </>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default ProfileDrawer; // Export the ProfileDrawer component

```
### C:\Users\נדב\messenger-app\app\hooks\useActiveChannel.ts

```ts
import { Channel, Members } from "pusher-js"; 
import useActiveList from "./useActiveList"; 
import { useEffect, useState } from "react"; 
import { pusherClient } from "../libs/pusher"; 

// Custom hook for managing active channel state
const useActiveChannel = () => {
  // Destructure set, add, and remove functions from useActiveList
  const { set, add, remove } = useActiveList(); 
  // State to manage the active channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null); 

  useEffect(() => {
    // Reference to the active channel
    let channel = activeChannel; 

    // Subscribe to the Pusher channel if not already subscribed
    if (!channel) {
      channel = pusherClient.subscribe('presence-messenger');
      setActiveChannel(channel);
    }

    // Bind event handlers for the Pusher channel
    channel.bind('pusher:subscription_succeeded', (members: Members) => {
      const initialMembers: string[] = [];

      // Add each member to the initial members list
      members.each((member: Record<string, any>) => initialMembers.push(member.id));
      // Set the initial members list in the active list state
      set(initialMembers); 
    });

    // Handle member added event
    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      // Add the new member to the active list
      add(member.id); 
    });

    // Handle member removed event
    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      // Remove the member from the active list
      remove(member.id); 
    });

    // Cleanup function to unsubscribe from the Pusher channel
    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe('presence-messenger');
        setActiveChannel(null);
      }
    };
  }, [activeChannel, set, add, remove]); // Dependency array for useEffect

  // Return null as this hook does not return a value
  return null; 
};

export default useActiveChannel; // Export the custom hook

```
### C:\Users\נדב\messenger-app\app\hooks\useActiveList.ts

```ts
import { create } from "zustand";

// Define the store interface for active members management
interface ActiveListStore {
   // Array of active member IDs
  members: string[];
  // Function to add a member to the list
  add: (id: string) => void; 
  // Function to remove a member from the list
  remove: (id: string) => void; 
  // Function to set the list of members
  set: (ids: string[]) => void; 
}

// Create the store using zustand
const useActiveList = create<ActiveListStore>((set) => ({
  members: [], // Initialize the members array as empty

  // Add a member to the list
  add: (id) => set((state) => ({ members: [...state.members, id] })), 

  // Remove a member from the list
  remove: (id) => set((state) => ({ members: state.members.filter((memberId) => memberId !== id) })), 

  // Set the list of members
  set: (ids) => set({ members: ids }) 
}));

export default useActiveList; 

```
### C:\Users\נדב\messenger-app\app\hooks\useConversation.ts

```ts
import { useParams } from "next/navigation"; 
import { useMemo } from "react";

 
//A custom hook for managing and accessing conversation data based on URL parameters.
const useConversation = () => {
  // Retrieve route parameters using useParams hook from Next.js
  const params = useParams();

  // Memoize the extraction of conversation ID from route parameters to avoid unnecessary computations
  const conversationId = useMemo(() => {
    if (!params?.conversationId) {
      // Return an empty string if no conversation ID is found
      return ""; 
    }
    // If found, cast it to a string and return
    return params.conversationId as string; 
  }, [params?.conversationId]);

  // Memoize a boolean indicating whether the conversation ID is present (true if present)
  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  // Return the computed values wrapped in another useMemo for optimal performance
  return useMemo(() => ({
    // Boolean indicating if the conversation screen should be open
    isOpen, 
    // The actual conversation ID from parameters
    conversationId 
  }), [isOpen, conversationId]);
};

// Export the useConversation hook for use elsewhere in the application
export default useConversation;
```
### C:\Users\נדב\messenger-app\app\hooks\useOtherUser.ts

```ts
// Import necessary hooks and types
import { useSession } from "next-auth/react"; 
import { FullConversationType } from "../types"; 
import { User } from "@prisma/client"; 
import { useMemo } from "react"; 


// A custom React hook to determine the 'other user' in a conversation.
const useOtherUser = (
  conversation:
    | FullConversationType
    | {
        users: User[];
      }
) => {
  // Retrieve the current session, including user data if logged in
  const session = useSession();

  // Memoize calculation of the other user in the conversation to avoid unnecessary re-computations
  const otherUser = useMemo(() => {
    // Extract the current user's email from the session
    const currentUserEmail = session?.data?.user?.email;

    // Filter out the current user from the conversation's users array to find the other user
    const otherUser = conversation.users.filter((user) => user.email !== currentUserEmail);
  
    // Return the other user found
    return otherUser; 
  }, [session?.data?.user?.email, conversation.users]);

  // Return the memoized other user
  return otherUser[0]; 
};

// Export the useOtherUser hook for use in other parts of the application
export default useOtherUser;
```
### C:\Users\נדב\messenger-app\app\hooks\useRoutes.ts

```ts
// Imports: React and Next.js hooks, authentication functions, icons, and custom hooks
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import useConversations from "./useConversation";

// Custom hook for managing navigation routes
const useRoutes = () => {
  // Use Next.js and custom hooks to get current path and conversation context
  const pathname = usePathname();
  const { conversationId } = useConversations();

  // Routes definition, memoized to optimize performance
  const routes = useMemo(
    () => [
      {
        // Chat route: dynamic activation based on path or conversation presence
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathname === "/conversations" || !!conversationId,
      },
      {
        // Users route: active when the users page is the current view
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathname === "/users",
      },
      {
        // Logout action: triggers sign out
        label: "Logout",
        href: "#",
        onClick: () => signOut(),
        icon: HiArrowLeftOnRectangle,
      },
    ],
    // Dependencies for useMemo to control re-computation
    [conversationId, pathname]
  );

  // Return the configured routes
  return routes;
};

export default useRoutes;

```
### C:\Users\נדב\messenger-app\app\libs\prismadb.ts

```ts
import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the PrismaClient instance
// Use the existing instance if it exists, otherwise create a new one
const client = globalThis.prisma || new PrismaClient();

// In development mode, assign the PrismaClient instance to the global variable
if (process.env.NODE_ENV !== "production") global.prisma = client;

// Export the PrismaClient instance for use in other parts of the application
export default client;

```
### C:\Users\נדב\messenger-app\app\libs\pusher.ts

```ts
import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Initialize the PusherServer instance with the necessary credentials and configuration
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!, 
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
  secret: process.env.PUSHER_SECRET!, 
  cluster: "ap2", 
  useTLS: true, 
});

// Initialize the PusherClient instance with the necessary credentials and configuration
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, 
  {
    cluster: "ap2", 
    channelAuthorization: {
      endpoint: "/api/pusher/auth", 
      transport: "ajax", 
    },
  }
);

```
### C:\Users\נדב\messenger-app\app\types\index.ts

```ts
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

```
### C:\Users\נדב\messenger-app\app\users\layout.tsx

```tsx

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

```
### C:\Users\נדב\messenger-app\app\users\loading.tsx

```tsx
import LoadingModal from "../components/LoadingModal";

// Create the Loading component
const Loading = () => {
  /// Use the LoadingModal for /users
  return <LoadingModal />; 
};

// Export the Loading component
export default Loading; 

```
### C:\Users\נדב\messenger-app\app\users\page.tsx

```tsx
import EmptyState from "../components/EmptyState";

// Create the Users component
const Users = () => {
  return (
    <div className="hidden lg:block lg:pl-80 h-full">
      {/* Display the EmptyState component */}
      <EmptyState /> 
    </div>
  );
};

export default Users; 

```
### C:\Users\נדב\messenger-app\app\users\components\UserBox.tsx

```tsx
"use client"; 

import Avatar from "@/app/components/Avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UserBoxProps {
  data: User; 
}

// Creating the UserBox component.
const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  // Initializing the router object.
  const router = useRouter(); 
  
  // State for loading status.
  const [isLoading, setIsLoading] = useState(false); 

  // Memoized callback for click events.
  const handleClick = useCallback(() => {
    // Set loading status to true.
    setIsLoading(true); 
    // Perform a POST request to start a conversation.
    axios
      .post("/api/conversations", {
         // Send the user's ID in the request body.
        userId: data.id,
      })
      .then((data) => {
        // Navigate to the conversation page.
        router.push(`/conversations/${data.data.id}`); 
      })
      // Reset loading status.
      .finally(() => setIsLoading(false));
  }, [data, router]);

  return (
    <>
      {/* Show loading animation if loading */}
      {isLoading && <LoadingModal />} 
      <div
      // Handle click to start a conversation.
        onClick={handleClick} 
        className="
          w-full
          relative
          flex
          items-center
          space-x-3
          bg-white
          p-3
          hover:bg-neutral-100
          rounded-lg
          cursor-pointer
        "
      >
        {/* Display the user's avatar */}
        <Avatar user={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div
              className="
                flex
                justify-between
                items-center
                mb-1
              "
            >
              <p
                className="
                  text-sm
                  font-medium
                  text-gray-900
                "
              >
                {/* Display the user's name */}
                {data.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;

```
### C:\Users\נדב\messenger-app\app\users\components\UserList.tsx

```tsx
"use client"

import { User } from "@prisma/client"; 
import UserBox from "./UserBox"; 

interface UserListProps {
  items: User[]; 
}

// Creating the UserList component.
const UserList: React.FC<UserListProps> = ({ items }) => {
  return (
    <aside
      className="
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block
        overflow-y-auto
        border-r
        border-gray-200
        block
        w-full
        left-0
      "
    >
      <div className="px-5">
        <div className="flex-col">
          <div
            className="
              text-3xl
              font-bold
              text-neutral-800
              py-4
            "
          >
            {/* Title for the user list */}
            People 
          </div>
        </div>
        {items.map((item) => (
          <UserBox
            // Unique key for each user
            key={item.id}
            // Pass user data to the UserBox component
            data={item}
          />
        ))}
      </div>
    </aside>
  );
};

export default UserList; 

```
### C:\Users\נדב\messenger-app\pages\api\pusher\auth.ts

```ts
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

```
