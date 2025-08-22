import React from 'react';
import type { Label } from '../types/interface';

interface IssueLabelsProps {
  labels: Label[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const IssueLabels: React.FC<IssueLabelsProps> = ({
  labels,
  maxVisible = 3,
  size = 'sm',
  className = ''
}) => {
  if (!labels || labels.length === 0) {
    return null;
  }

  const visibleLabels = labels.slice(0, maxVisible);
  const remainingCount = labels.length - maxVisible;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {visibleLabels.map((label) => (
        <span
          key={label.id}
          className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
          style={{ backgroundColor: label.color }}
          title={label.name}
        >
          {label.name}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center rounded-full bg-gray-500 text-white ${sizeClasses[size]}`}
          title={`${remainingCount} more labels`}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
};