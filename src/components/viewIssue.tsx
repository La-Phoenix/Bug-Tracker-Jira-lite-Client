import React from 'react';
import { X, Calendar, User, AlertCircle, CheckCircle, Clock, Bug, Edit, Trash2 } from 'lucide-react';
import type { Issue } from '../types/interface';
import { IssueLabels } from './IssueLabels';
import { useAuth } from '../contexts/AuthContext';

interface ViewIssueProps {
  issue: Issue;
  onClose: () => void;
  onEdit?: (issue: Issue) => void;
  onDelete?: (issue: Issue) => void;
}

export const ViewIssue: React.FC<ViewIssueProps> = ({
  issue,
  onClose,
  onEdit,
  onDelete
}) => {
  const { user } = useAuth();

  // Check if user can edit/delete this issue
  const canEditDelete = (): boolean => {
    if (!user) return false;
    
    // Admin can edit/delete any issue
    if (user.role === 'Admin') return true;
    
    // User can only edit/delete issues they reported
    return issue.reporterId === user.id;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'open':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'in progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'resolved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bug className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(issue.statusName || '')}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {issue.title}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                #{issue.id}
              </span>
            </div>
            
            {/* Priority and Status */}
            <div className="flex items-center gap-3 mb-3">
              {issue.priorityName && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(issue.priorityName)}`}>
                  {issue.priorityName} Priority
                </span>
              )}
              
              {issue.statusName && (
                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {issue.statusName}
                </span>
              )}
            </div>

            {/* Labels */}
            <IssueLabels 
              labels={issue.labels || []} 
              maxVisible={10}
              size="md"
              className="mb-3"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            {canEditDelete() && onEdit && (
              <button
                onClick={() => onEdit(issue)}
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Edit issue"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            
            {canEditDelete() && onDelete && (
              <button
                onClick={() => onDelete(issue)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete issue"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {issue.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>
            </div>
          )}

          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Issue Details
              </h3>
              
              <div className="space-y-4">
                {/* Project */}
                {issue.projectName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Project
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {issue.projectName}
                    </span>
                  </div>
                )}

                {/* Reporter */}
                {issue.reporterName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reporter
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {issue.reporterName}
                    </span>
                  </div>
                )}

                {/* Assignee */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Assignee
                  </span>
                  {issue.assigneeName ? (
                    <span className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {issue.assigneeName}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Unassigned
                    </span>
                  )}
                </div>

                {/* Priority */}
                {issue.priorityName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Priority
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(issue.priorityName)}`}>
                      {issue.priorityName}
                    </span>
                  </div>
                )}

                {/* Status */}
                {issue.statusName && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      {getStatusIcon(issue.statusName)}
                      {issue.statusName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Timeline
              </h3>
              
              <div className="space-y-4">
                {/* Created */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Created
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(issue.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Updated */}
                {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Last Updated
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(issue.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Labels Count */}
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-4 h-4 bg-gray-400 rounded-full mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Labels
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {issue.labels.length} label{issue.labels.length !== 1 ? 's' : ''} applied
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {canEditDelete() && onEdit && (
            <button
              onClick={() => onEdit(issue)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Issue
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};