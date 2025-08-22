import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react'; // Add CheckCircle import
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { PriorityService } from '../services/PriorityService';
import { StatusService } from '../services/StatusService';
import { useAuth } from '../contexts/AuthContext';
import type { Issue, Project, User, Priority, Status, Label, CreateIssueRequest } from '../types/interface';
import { LabelSelector } from './LabelSelector';

interface CreateEditIssueProps {
  issue?: Issue | null;
  onClose: (shouldRefresh?: boolean) => void;
}

interface IssueFormData {
  title: string;
  description: string;
  projectId: number | null;
  assigneeId: number | null;
  priorityId: number | null;
  statusId: number | null;
  labels: Label[];
}

export const CreateEditIssue: React.FC<CreateEditIssueProps> = ({
  issue,
  onClose
}) => {
  const { user } = useAuth();
  const isEditing = !!issue;
  
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    projectId: null,
    assigneeId: null,
    priorityId: null,
    statusId: null,
    labels: []
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>(''); // Add success state

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (issue) {
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        projectId: issue.projectId || null,
        assigneeId: issue.assigneeId || null,
        priorityId: issue.priorityId || null,
        statusId: issue.statusId || null,
        labels: issue.labels || []
      });
    }
  }, [issue]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [projectsRes, usersRes, prioritiesRes, statusesRes] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers(),
        PriorityService.getAllPriorities(),
        StatusService.getAllStatuses()
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data);
      }

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }

      if (prioritiesRes.success && prioritiesRes.data) {
        setPriorities(prioritiesRes.data);
      }

      if (statusesRes.success && statusesRes.data) {
        setStatuses(statusesRes.data);
      }

    } catch (err: any) {
      setError('Failed to load form data');
      console.error('Error loading form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.projectId) {
      setError('Project is required');
      return;
    }

    if (!formData.assigneeId) {
      setError('Assignee is required');
      return;
    }

    if (!formData.priorityId) {
      setError('Priority is required');
      return;
    }

    // For new issues, status is required. For editing, it's optional
    // if (!isEditing && !formData.statusId) {
    //   setError('Status is required');
    //   return;
    // }
    if (!formData.statusId) {
      setError('Status is required');
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      const issueData: CreateIssueRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        assigneeId: formData.assigneeId,
        priorityId: formData.priorityId,
        statusId: formData.statusId,
        reporterId: user.id,
        labelIds: formData.labels.map(l => l.id)
      };

      let result;
      
      if (isEditing && issue) {
        // Update existing issue
        result = await IssueService.updateIssue({id: issue.id, ...issueData});
      } else {
        // Create new issue
        result = await IssueService.createIssue(issueData);
      }

      if (result.success) {
        // SUCCESS
        setSuccess(`Issue ${isEditing ? 'updated' : 'created'} successfully!`);
        
        // Close modal after showing success message
        setTimeout(() => {
          onClose(true);
        }, 1500);
      } else {
        // FAILURE
        setError(result.message || `Failed to ${isEditing ? 'update' : 'create'} issue`);
      }

    } catch (err: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} issue:`, err);
      
      // Handle different error types
      if (err.response?.status === 400) {
        setError('Invalid data provided. Please check all required fields.');
      } else if (err.response?.status === 401) {
        setError('You are not authorized to perform this action.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to perform this action.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          `An error occurred while ${isEditing ? 'updating' : 'creating'} the issue`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof IssueFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(formData)
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Issue' : 'Create New Issue'}
          </h2>
          <button
            onClick={() => onClose()}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Show loading overlay instead of replacing entire modal */}
        {loading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Loading form data...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">{success}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter issue title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={submitting || loading} // Also disable when loading
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the issue in detail"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={submitting || loading} // Also disable when loading
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project *
            </label>
            <select
              value={formData.projectId || ''}
              onChange={(e) => handleInputChange('projectId', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={submitting || loading} // Also disable when loading
            >
              <option value="">
                {loading ? 'Loading projects...' : 'Select a project'}
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee *
              </label>
              <select
                value={formData.assigneeId || ''}
                onChange={(e) => handleInputChange('assigneeId', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={submitting || loading} // Also disable when loading
              >
                <option value="">
                  {loading ? 'Loading users...' : 'Select an assignee'}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority *
              </label>
              <select
                value={formData.priorityId || ''}
                onChange={(e) => handleInputChange('priorityId', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={submitting || loading} // Also disable when loading
              >
                <option value="">
                  {loading ? 'Loading priorities...' : 'Select priority'}
                </option>
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status *
            </label>
            <select
              value={formData.statusId || ''}
              onChange={(e) => handleInputChange('statusId', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              disabled={submitting || loading} // Also disable when loading
            >
              <option value="">
                {loading ? 'Loading statuses...' : 'Select status'}
              </option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Labels
            </label>
            <LabelSelector
              selectedLabels={formData.labels}
              onLabelsChange={(labels) => handleInputChange('labels', labels)}
              disabled={submitting || loading} // Also disable when loading
              placeholder={loading ? "Loading labels..." : "Add labels to categorize this issue..."}
            />
            
            {/* Debug info for labels */}
            {formData.labels.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Selected labels: {formData.labels.map(l => l.name || `Label ${l.id}`).join(', ')}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading} // Also disable when loading
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {submitting ? 'Saving...' : loading ? 'Loading...' : (isEditing ? 'Update Issue' : 'Create Issue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};