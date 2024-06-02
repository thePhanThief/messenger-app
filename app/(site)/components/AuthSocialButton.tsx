import { FC } from "react";
import { IconType } from "react-icons";

// Props for AuthSocialButton component
interface AuthSocialButtonProps {
  // The icon to be displayed in the button
  icon: IconType;
  // The function to be called when the button is clicked
  onClick: () => void;
}

// AuthSocialButton component
const AuthSocialButton: FC<AuthSocialButtonProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        w-full 
        justify-center 
        rounded-md 
        bg-white 
        px-4 
        py-2 
        text-gray-500 
        shadow-sm 
        ring-1 
        ring-inset 
        ring-gray-300 
        hover:bg-gray-50 
        focus:outline-offset-0
      "
    >
      {/* Render the provided icon */}
      <Icon />
    </button>
  );
};

export default AuthSocialButton;
