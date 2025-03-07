import React from 'react';

export default function EmptyState({ title, description, icon: Icon, actionLabel, onAction }) {
  return (
    <div className="bg-[#A7CAB1] rounded-lg p-8 text-center flex flex-col items-center">
      {Icon && <Icon className="h-12 w-12 text-gray-300 mb-4" />}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-black font-medium mb-6 max-w-md mx-auto">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-medical-box text-white rounded-md hover:bg-opacity-80 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
} 