import React from 'react';
import { PlataformaOrigen, getPlataformaLabel, getPlataformaColor } from '../../constants/plataformas';

interface PlataformaBadgeProps {
  plataforma: PlataformaOrigen | undefined;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
}

const PlataformaBadge: React.FC<PlataformaBadgeProps> = ({ 
  plataforma, 
  size = 'sm',
  showEmpty = true 
}) => {
  if (!plataforma && !showEmpty) {
    return null;
  }

  if (!plataforma) {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500`}>
        No especificada
      </span>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`${sizeClasses[size]} rounded-full font-medium ${getPlataformaColor(plataforma)}`}>
      {getPlataformaLabel(plataforma)}
    </span>
  );
};

export default PlataformaBadge;