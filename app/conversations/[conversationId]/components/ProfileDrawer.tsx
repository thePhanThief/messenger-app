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
