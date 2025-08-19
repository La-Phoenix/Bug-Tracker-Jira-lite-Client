import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { StatusService } from '../services/StatusService';
import { PriorityService } from '../services/PriorityService';
import type { Issue, CreateIssueRequest, UpdateIssueRequest, Project, User, Status, Priority } from '../types/interface';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  issue?: Issue | null;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  issue
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    statusId: '',
    priorityId: '',
    assigneeId: '',
  });
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      loadCurrentUser();
      if (issue) {
        setFormData({
          title: issue.title || '',
          description: issue.description || '',
          projectId: issue.projectId?.toString() || '',
          statusId: issue.statusId?.toString() || '',
          priorityId: issue.priorityId?.toString() || '',
          assigneeId: issue.assigneeId?.toString() || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          projectId: '',
          statusId: '',
          priorityId: '',
          assigneeId: '',
        });
      }
    }
  }, [isOpen, issue]);

  const loadCurrentUser = () => {
    // Get current user from localStorage or auth context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  };

  const loadDropdownData = async () => {
    setLoading(true);
    try {
      const [projectsRes, usersRes, statusesRes, prioritiesRes] = await Promise.all([
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] })),
        StatusService.getAllStatuses().catch(() => ({ success: false, data: [] })),
        PriorityService.getAllPriorities().catch(() => ({ success: false, data: [] })),
      ]);

      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
      if (statusesRes.success && statusesRes.data) {
        setStatuses(statusesRes.data);
      }
      if (prioritiesRes.success && prioritiesRes.data) {
        setPriorities(prioritiesRes.data);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (issue) {
        // Update existing issue
        const updatePayload: UpdateIssueRequest = {
          id: issue.id,
          title: formData.title,
          description: formData.description,
          assigneeId: parseInt(formData.assigneeId) || 0,
          statusId: parseInt(formData.statusId) || 0,
          priorityId: parseInt(formData.priorityId) || 0,
          labelIds: [], // Empty for now until LabelService is implemented
        };

        const response = await IssueService.updateIssue(updatePayload);
        
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          alert(response.message || 'Failed to update issue');
        }
      } else {
        // Create new issue
        const createPayload: CreateIssueRequest = {
          title: formData.title,
          description: formData.description,
          reporterId: currentUser?.id || 0,
          assigneeId: parseInt(formData.assigneeId) || 0,
          projectId: parseInt(formData.projectId) || 0,
          statusId: parseInt(formData.statusId) || 0,
          priorityId: parseInt(formData.priorityId) || 0,
          labelIds: [], // Empty for now until LabelService is implemented
        };

        const response = await IssueService.createIssue(createPayload);
        
        if (response.success) {
          onSuccess();
          onClose();
        } else {
          alert(response.message || 'Failed to create issue');
        }
      }
    } catch (error: any) {
      console.error('Error saving issue:', error);
      alert(error.message || 'An error occurred while saving the issue');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {issue ? 'Edit Issue' : 'Create New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter issue title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Describe the issue..."
              />
            </div>

            {/* Project and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!issue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.statusId}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority and Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priorityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Priority</option>
                  {priorities.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note about labels */}
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <strong>Note:</strong> Label management will be available once the LabelService is implemented.
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {issue ? 'Update Issue' : 'Create Issue'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};