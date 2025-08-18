import React, { useState } from 'react';
import type { CreateIssueRequest, Priority, Project, Status, User } from '../types/interface';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: CreateIssueRequest) => Promise<void>;
  projects: Project[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  loading?: boolean;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projects,
  users,
  statuses,
  priorities,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateIssueRequest>({
    title: '',
    description: '',
    reporterId: 0,
    assigneeId: 0,
    projectId: 0,
    statusId: 0,
    priorityId: 0,
    labelIds: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.reporterId) newErrors.reporterId = 'Reporter is required';
    if (!formData.assigneeId) newErrors.assigneeId = 'Assignee is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.statusId) newErrors.statusId = 'Status is required';
    if (!formData.priorityId) newErrors.priorityId = 'Priority is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSubmit(formData);
        // Reset form
        setFormData({
          title: '',
          description: '',
          reporterId: 0,
          assigneeId: 0,
          projectId: 0,
          statusId: 0,
          priorityId: 0,
          labelIds: []
        });
        onClose();
      } catch (error) {
        console.error('Failed to create issue:', error);
      }
    }
  };

  const handleChange = (field: keyof CreateIssueRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Issue</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter issue title"
                disabled={loading}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter issue description"
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleChange('projectId', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.projectId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value={0}>Select project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priorityId}
                  onChange={(e) => handleChange('priorityId', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.priorityId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value={0}>Select priority</option>
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.name}</option>
                  ))}
                </select>
                {errors.priorityId && <p className="mt-1 text-sm text-red-600">{errors.priorityId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reporter *
                </label>
                <select
                  value={formData.reporterId}
                  onChange={(e) => handleChange('reporterId', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.reporterId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value={0}>Select reporter</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                {errors.reporterId && <p className="mt-1 text-sm text-red-600">{errors.reporterId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignee *
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => handleChange('assigneeId', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.assigneeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value={0}>Select assignee</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                {errors.assigneeId && <p className="mt-1 text-sm text-red-600">{errors.assigneeId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <select
                value={formData.statusId}
                onChange={(e) => handleChange('statusId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.statusId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value={0}>Select status</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
              {errors.statusId && <p className="mt-1 text-sm text-red-600">{errors.statusId}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};