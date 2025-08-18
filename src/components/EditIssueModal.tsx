import React, { useState, useEffect } from 'react';
import type { Issue, Priority, Project, Status, UpdateIssueRequest, User } from '../types/interface';
import { Modal } from './Modal';


interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: UpdateIssueRequest) => Promise<void>;
  issue: Issue | null;
  projects: Project[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  loading?: boolean;
}

export const EditIssueModal: React.FC<EditIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  issue,
//projects,
  users,
  statuses,
  priorities,
  loading = false
}) => {
  const [formData, setFormData] = useState<UpdateIssueRequest>({
    id: 0,
    title: '',
    description: '',
    assigneeId: 0,
    statusId: 0,
    priorityId: 0,
    labelIds: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when issue changes
  useEffect(() => {
    if (issue) {
      setFormData({
        id: issue.id,
        title: issue.title,
        description: issue.description || '',
        assigneeId: issue.assigneeId || 0,
        statusId: issue.statusId,
        priorityId: issue.priorityId,
        labelIds: [] // TODO: Convert labels to labelIds when you have label management
      });
      setErrors({});
    }
  }, [issue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Id') ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.statusId) {
      newErrors.statusId = 'Status is required';
    }

    if (!formData.priorityId) {
      newErrors.priorityId = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error updating issue:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      id: 0,
      title: '',
      description: '',
      assigneeId: 0,
      statusId: 0,
      priorityId: 0,
      labelIds: []
    });
    setErrors({});
    onClose();
  };

  if (!issue) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Issue #${issue.id}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.title 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter issue title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.description 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Describe the issue in detail"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
          )}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assignee */}
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="statusId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status *
            </label>
            <select
              id="statusId"
              name="statusId"
              value={formData.statusId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.statusId 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value={0}>Select status</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            {errors.statusId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.statusId}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priorityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority *
            </label>
            <select
              id="priorityId"
              name="priorityId"
              value={formData.priorityId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.priorityId 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value={0}>Select priority</option>
              {priorities.map(priority => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
            {errors.priorityId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.priorityId}</p>
            )}
          </div>

          {/* Project (Read-only for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <input
              type="text"
              value={issue.projectName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>

        {/* Current Labels Display */}
        {issue.labels && issue.labels.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {issue.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                >
                  {label.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Label management will be available in a future update
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              'Update Issue'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};