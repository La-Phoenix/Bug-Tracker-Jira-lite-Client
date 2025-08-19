import React from 'react';
import { X, User, Calendar, Tag, AlertCircle, CheckCircle, Clock, Edit3, Trash2 } from 'lucide-react';
import type { Issue } from '../types/interface';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (issue: Issue) => void;
  onDelete: (issue: Issue) => void;
  issue: Issue | null;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  issue
}) => {
  if (!isOpen || !issue) return null;

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress':
      case 'in progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden border border-white/20 dark:border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {getStatusIcon(issue.statusName)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {issue.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Issue #{issue.id} • {issue.projectName || 'No Project'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(issue)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit Issue"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(issue)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Issue"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {issue.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Labels */}
              {issue.labels && issue.labels.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {issue.labels.map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100/50 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300 backdrop-blur-sm"
                      >
                        <Tag className="h-3 w-3" />
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Timeline Placeholder */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Activity
                </h3>
                <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Activity timeline will be available in future updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Priority */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Status & Priority</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {getStatusIcon(issue.statusName)}
                      {issue.statusName || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(issue.priorityName)}`}>
                      {issue.priorityName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* People */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">People</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Reporter:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {issue.reporterName || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Assignee:</span>
                    {issue.assigneeId ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {issue.assigneeName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white ml-6">
                      {formatDate(issue.createdAt)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Updated:</span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white ml-6">
                      {formatDate(issue.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};