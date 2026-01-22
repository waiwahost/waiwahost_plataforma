import { Eye, EyeOff } from "lucide-react";
import { usePasswordVisibility } from "./PasswordVisility";
import { PasswordInputProps } from "./PasswordInput.types";
import clsx from "clsx";

const PasswordInput = ({
  label,
  leftIcon,
  className,
  ...inputProps
}: PasswordInputProps) => {
  const { isVisible, toggleVisibility } = usePasswordVisibility();

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputProps.id}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </span>
        )}

        <input
          {...inputProps}
          type={isVisible ? "text" : "password"}
          className={clsx(
            "h-12 w-full rounded-md border border-gray-200 pr-10 focus:outline-none focus:ring-1",
            leftIcon && "pl-10",
            className
          )}
        />

        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
