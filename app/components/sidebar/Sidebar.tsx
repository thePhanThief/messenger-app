import getCurrentUser from "@/app/actions/getCurrentUser"; // Import function to get the current user
import MobileFooter from "./MobileFooter"; // Import MobileFooter component
import DesktopSidebar from "./DesktopSidebar"; // Import DesktopSidebar component

// Create the Sidebar component
async function Sidebar({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser(); // Get the current user

  return (
    <div className="h-full">
      <DesktopSidebar currentUser={currentUser!} />
      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
}

export default Sidebar; // Export the Sidebar component
