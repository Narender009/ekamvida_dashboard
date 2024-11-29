import React, { useState, useRef, useEffect } from 'react';

export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {React.Children.map(children, child => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            'aria-expanded': isOpen
          });
        }
        if (child.type === DropdownMenuContent) {
          return isOpen && React.cloneElement(child, {
            onClose: () => setIsOpen(false)
          });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent = ({ children, onClose, className = '' }) => {
  return (
    <div
      className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 ${className}`}
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        {React.Children.map(children, child => {
          if (child.type === DropdownMenuItem) {
            return React.cloneElement(child, { onClose });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, onClose, className = '', ...props }) => {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (onClose) onClose();
  };

  return (
    <button
      type="button"
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      role="menuitem"
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};