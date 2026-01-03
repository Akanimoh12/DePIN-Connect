import { ReactNode, HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = false, padding = 'md', ...rest }, ref) => {
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const hoverClass = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer' : '';
    
    return (
      <div
        ref={ref}
        className={`bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl ${paddingClasses[padding]} ${hoverClass} transition-all duration-300 ${className}`}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
export { Card };
