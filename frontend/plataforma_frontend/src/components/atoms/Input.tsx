import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-tourism-navy">{label}</label>
      )}
      <input
        ref={ref}
        className={`border border-gray-200 rounded-md px-3 py-2 h-12 focus:border-tourism-teal focus:ring-tourism-teal bg-white ${className}`}
        {...props}
      />
    </div>
  )
);
Input.displayName = "Input";
