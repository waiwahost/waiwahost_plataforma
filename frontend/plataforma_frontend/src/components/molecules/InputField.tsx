import React from 'react';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

export interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />
  </div>
);
