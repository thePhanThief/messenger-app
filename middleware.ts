import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Automatic redirect to login screen
  pages: {
    signIn: "/",  // Specify the login page
  },
});

export const config = {
  // Protects the nested routes of /users and /conversations
  matcher: ["/users/:path*", "/conversations/:path*"],  // Apply middleware to these routes and their subpaths
};
