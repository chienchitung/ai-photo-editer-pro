import React from 'react';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, isActive, onClick, disabled }) => {
  const baseClasses = "flex flex-col items-center justify-center p-1 w-14 h-12 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500";
  const activeClasses = "bg-indigo-600 text-white";
  const inactiveClasses = "text-gray-400 hover:bg-gray-700 hover:text-white";
  const disabledClasses = "opacity-50 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}
      disabled={disabled}
      title={label}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};