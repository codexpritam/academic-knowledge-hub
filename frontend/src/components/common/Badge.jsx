import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-xs px-3 py-1 rounded-full'
  };

  return (
    <span className={`inline-flex items-center font-medium border ${sizes[size] || sizes.sm} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
