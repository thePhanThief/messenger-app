import { withAuth } from "next-auth/middleware";

export default withAuth({
  //automatic redirect to login screen
  pages: {
    signIn: "/",
  },
});

export const config = {
  //Protects the nested routs of /users and /conversations
  matcher: ["/users/:path*", "/conversations/:path*"],
};
