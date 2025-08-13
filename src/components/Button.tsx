'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant for different color schemes */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Optional icon to display */
  icon?: IconDefinition;
  /** Whether to show icon before or after text */
  iconPosition?: 'left' | 'right';
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Additional props to pass to button element */
  [key: string]: any;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
  secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400',
  success: 'bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300',
  danger: 'bg-red-50 dark:bg-red-700 text-red-600 dark:text-red-50 hover:bg-red-100 dark:hover:bg-red-900 disabled:bg-red-25 disabled:text-red-300',
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
};

export default function Button({
  children,
  onClick,
  variant = 'gray',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <FontAwesomeIcon icon={icon} />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <FontAwesomeIcon icon={icon} />
      )}
    </button>
  );
}
