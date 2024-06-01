"use client";

// Import necessary hooks and components
import useOtherUser from "@/app/hooks/useOtherUser"; // Custom hook to get other user details
import { Conversation, User } from "@prisma/client"; // Import Conversation and User types from Prisma client
import { Fragment, useMemo, useState } from "react"; // Import React hooks
import { format } from "date-fns"; // Import format function from date-fns for date formatting
import { Dialog, Transition } from "@headlessui/react"; // Import Dialog and Transition components from headlessui
import { IoClose, IoTrash } from "react-icons/io5"; // Import icons from react-icons/io5
import Avatar from "@/app/components/Avatar"; // Import Avatar component
import ConfirmModal from "./ConfirmModal"; // Import ConfirmModal component
import AvatarGroup from "@/app/components/GroupAvatar"; // Import GroupAvatar component
import useActiveList from "@/app/hooks/useActiveList"; // Custom hook to get active users list

// Define properties for the ProfileDrawer component
interface ProfileDrawerProps {
  isOpen: boolean; // Boolean to control if the drawer is open
  onClose: () => void; // Function to handle closing the drawer
  data: Conversation & {
    users: User[]; // Extend Conversation type to include an array of users
  };
}

// Create the ProfileDrawer component
const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const otherUser = useOtherUser(data); // Get other user details
  const [confirmOpen, setConfirmOpen] = useState(false); // State to handle confirm modal open/close
  const { members } = useActiveList(); // Get list of active members
  const isActive = members.indexOf(otherUser?.email!) !== -1; // Check if the other user is active

  // Format the joined date of the other user
  const joinedDate = useMemo(() => {
    return format(new Date(otherUser.createdAt), "PP"); // Format date as 'PP'
  }, [otherUser.createdAt]);

  // Determine the title based on the conversation or other user's name
  const title = useMemo(() => {
    return data.name || otherUser.name; // Return conversation name or other user's name
  }, [data.name, otherUser.name]);

  // Determine the status text based on the conversation type and user activity
  const statusText = useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`; // Show the number of members if it's a group conversation
    }
    return isActive ? "Active" : "Offline"; // Show active or offline status for individual conversation
  }, [data, isActive]);

  return (
    <>
      {/* ConfirmModal component for confirming deletion */}
      <ConfirmModal
        isOpen={confirmOpen} // Pass confirm modal open state
        onClose={() => setConfirmOpen(false)} // Handle confirm modal close
      />
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500" // Define enter transition
            enterFrom="opacity-0" // Start state of enter transition
            enterTo="opacity-100" // End state of enter transition
            leave="ease-in duration-500" // Define leave transition
            leaveFrom="opacity-100" // Start state of leave transition
            leaveTo="opacity-0" // End state of leave transition
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
                  enter="transform transition ease-in-out duration-500" // Define enter transition
                  enterFrom="translate-x-full" // Start state of enter transition
                  enterTo="translate-x-0" // End state of enter transition
                  leave="transform transition ease-in-out duration-500" // Define leave transition
                  leaveTo="translate-x-full" // End state of leave transition
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
                              onClick={onClose} // Handle drawer close
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
                              <IoClose size={24} /> {/* Display close icon */}
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
                              <AvatarGroup users={data.users} /> // Display group avatar for group conversation
                            ) : (
                              <Avatar user={otherUser} /> // Display avatar for individual conversation
                            )}
                          </div>
                          <div>{title}</div> {/* Display conversation title */}
                          <div
                            className="
                            text-sm text-gray-500
                          "
                          >
                            {statusText} {/* Display status text */}
                          </div>
                          <div className="flex gap-10 my-8">
                            <div
                              onClick={() => setConfirmOpen(true)} // Handle confirm modal open
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
