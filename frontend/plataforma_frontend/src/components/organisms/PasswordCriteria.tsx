// src/components/organisms/PasswordCriteria.tsx
import React from 'react';

interface PasswordCriteriaProps {
  password: string;
  criteria: { label: string; test: (v: string) => boolean }[];
}

export const PasswordCriteria: React.FC<PasswordCriteriaProps> = ({ password, criteria }) => (
  <ul className="text-xs mb-2">
    {criteria.map((c, i) => (
      <li key={i} className={c.test(password) ? 'text-green-600' : 'text-red-500'}>
        {c.label}
      </li>
    ))}
  </ul>
);
