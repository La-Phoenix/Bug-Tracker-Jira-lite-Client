import React from 'react';
import type { Issue } from '../types/interface';

interface IssueCardProps {
  issue: Issue;
  onEdit?: (issue: Issue) => void;
  onDelete?: (id: number) => void;
  onClick?: (issue: Issue) => void;
}

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'critical':
      return 'bg-red-200 text-red-900 border-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'todo':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onEdit, onDelete, onClick }) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onClick?.(issue);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(issue);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(issue.id);
  };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer transform transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600 animate-fade-in"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 flex-1">
          #{issue.id} {issue.title}
        </h3>
        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="action-button text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit issue"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="action-button text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete issue"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
        {issue.description || 'No description provided'}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors ${getPriorityColor(issue.priorityName)}`}>
          {issue.priorityName}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(issue.statusName)}`}>
          {issue.statusName}
        </span>
        {issue.labels && issue.labels.length > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            +{issue.labels.length} labels
          </span>
        )}
      </div>
      
      <div className="flex justify-between items-end text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-col space-y-1">
          <span>Reporter: <span className="font-medium text-gray-700 dark:text-gray-300">{issue.reporterName}</span></span>
          <span>Assignee: <span className="font-medium text-gray-700 dark:text-gray-300">{issue.assigneeName || 'Unassigned'}</span></span>
        </div>
        <div className="flex flex-col space-y-1 text-right">
          <span>Project: <span className="font-medium text-gray-700 dark:text-gray-300">{issue.projectName}</span></span>
          <span className="text-gray-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};