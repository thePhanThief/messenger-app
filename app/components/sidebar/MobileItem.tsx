"use client";

import Link from "next/link"; // Import Link component from Next.js
import clsx from "clsx"; // Import clsx for conditionally joining classNames together

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
      return onClick(); // Call the onClick handler if provided
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
      `,
        active && "bg-gray-100 text-black" // Apply active styles if the item is active
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
};

export default MobileItem; // Export the MobileItem component
