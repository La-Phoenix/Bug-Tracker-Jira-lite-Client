import React from 'react';
import type { Issue } from '../types/interface';
import { Modal } from './Modal';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  onEdit?: (issue: Issue) => void;
  onDelete?: (id: number) => void;
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

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  issue,
  onEdit,
  onDelete
}) => {
  if (!issue) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Issue #${issue.id}`} size="lg">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {issue.title}
          </h3>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(issue.priorityName)}`}>
              {issue.priorityName} Priority
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.statusName)}`}>
              {issue.statusName}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Description
          </h4>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {issue.description}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project
              </label>
              <p className="text-gray-900 dark:text-white">{issue.projectName}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reporter
              </label>
              <p className="text-gray-900 dark:text-white">{issue.reporterName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assignee
              </label>
              <p className="text-gray-900 dark:text-white">{issue.assigneeName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <p className="text-gray-900 dark:text-white">{issue.statusName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(issue.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Labels */}
        {issue.labels && issue.labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {issue.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={() => {
                onEdit(issue);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Issue
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(issue.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Issue
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};