import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Automatic redirect to login screen
  pages: {
    // Specify the login page
    signIn: "/",  
  },
});

export const config = {
  // Protects the nested routes of /users and /conversations
  matcher: ["/users/:path*", "/conversations/:path*"],
};
