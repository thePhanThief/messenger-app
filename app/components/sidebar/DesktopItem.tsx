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
