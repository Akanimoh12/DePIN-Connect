import React from 'react';

interface SkeletonProps {
  variant?: 'rectangle' | 'circle' | 'text';
  width?: string;
  height?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'rectangle', 
  width, 
  height, 
  className = '' 
}) => {
  const baseStyles = 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer';
  
  const variantStyles = {
    rectangle: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };
  
  const style = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circle' ? '40px' : '100px'),
  };
  
  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
export { Skeleton };
