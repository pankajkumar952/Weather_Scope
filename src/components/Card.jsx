import React from 'react';

const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-surface-container-low rounded-xl',
    elevated: 'bg-surface-container rounded-xl shadow-lg',
    outline: 'bg-surface-container-low rounded-xl border border-outline-variant/20',
    solid: 'bg-surface-container-high rounded-xl',
  };

  return (
    <div
      className={`${variants[variant] || variants.default} transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;