// Import zustand for state management
import { create } from "zustand";

// Define the store interface
interface ActiveListStore {
  members: string[]; // Array of active members' IDs
  add: (id: string) => void; // Function to add a member to the list
  remove: (id: string) => void; // Function to remove a member from the list
  set: (ids: string[]) => void; // Function to set the list of members
}

// Create the store using zustand
const useActiveList = create<ActiveListStore>((set) => ({
  members: [], // Initialize the members array as empty
  add: (id) => set((state) => ({ members: [...state.members, id] })), // Add a member to the list
  remove: (id) => set((state) => ({ members: state.members.filter((memberId) => memberId !== id) })), // Remove a member from the list
  set: (ids) => set({ members: ids }) // Set the list of members
}));

export default useActiveList; // Export the custom hook
