'use client';

import Logo from './Logo';

interface HeaderProps {
  /** Content to display on the right side of the header */
  rightContent?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export default function Header({ rightContent, className = '' }: HeaderProps) {
  return (
    <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Logo size="medium" showText={true} linkToHome={true} />
          </div>
          {rightContent && (
            <div className="flex items-center gap-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
