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
