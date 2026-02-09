import { InputHTMLAttributes, ReactNode } from "react";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  leftIcon?: ReactNode;
}
