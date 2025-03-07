import React from 'react';

export default function PageHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      {description && <p className="text-black font-medium">{description}</p>}
    </div>
  );
} 