import { useState } from "react";

export const usePasswordVisibility = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((prev: any) => !prev);
  };

  return { isVisible, toggleVisibility };
};
