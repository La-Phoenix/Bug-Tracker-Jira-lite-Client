import React, { useState } from 'react';
import { X, UserPlus, Search, Shield, User, Loader2 } from 'lucide-react';
import type { TeamMember } from '../../pages/Team';
import { ProjectService } from '../../services/ProjectService';

interface User {
  userId: number; // Match your existing interface
  userName: string;
  userEmail: string;
  userRole: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface SelectedUser {
  userId: number;
  role: 'Admin' | 'Member';
}

interface AddUserToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  availableUsers: User[]; // All users in the system
  onAddUsers: (projectId: number, users: SelectedUser[]) => Promise<void>;
  isLoading?: boolean;
  progress?: { current: number; total: number; currentUser?: string };
}

export const AddUserToProjectModal: React.FC<AddUserToProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  availableUsers, // All users in the system
  onAddUsers,
  isLoading = false,
  progress
}) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersNotInProject, setUsersNotInProject] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  if (!isOpen) return null;

  // Filter users by search term
  const searchFilteredUsers = usersNotInProject.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load users who are NOT in the selected project
  const loadUsersNotInProject = async (projectId: number) => {
    setLoadingUsers(true);
    setSelectedUsers([]); // Clear current selections
    
    try {
      // Get users who ARE in the project
      const response = await ProjectService.getAvailableUsersForProject(projectId);
      
      if (response.success && response.data) {
        // Filter out users who are already in the project
        const usersInProject = response.data as TeamMember[];
        const usersInProjectIds = usersInProject.map(u => u.userId );
        
        // Show users who are NOT in the project
        const filteredUsers = availableUsers.filter(user => 
          !usersInProjectIds.includes(user.userId)
        );
        
        setUsersNotInProject(filteredUsers);
      } else {
        console.error('Failed to load project users:', response.message);
        // Fallback to all users if API fails
        setUsersNotInProject(availableUsers);
      }
    } catch (error) {
      console.error('Error loading project users:', error);
      // Fallback to all users if API fails
      setUsersNotInProject(availableUsers);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle project selection - following the same pattern as ProjectSelectionModal
  const handleProjectSelection = (projectId: number | null) => {
    setSelectedProject(projectId);
    if (projectId) {
      loadUsersNotInProject(projectId);
    } else {
      // If no project selected, clear users
      setUsersNotInProject([]);
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.userId === userId);
      if (exists) {
        // Remove user
        return prev.filter(u => u.userId !== userId);
      } else {
        // Add user with default role
        return [...prev, { userId, role: 'Member' }];
      }
    });
  };

  const handleRoleChange = (userId: number, role: 'Admin' | 'Member') => {
    setSelectedUsers(prev =>
      prev.map(user =>
        user.userId === userId ? { ...user, role } : user
      )
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === searchFilteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(searchFilteredUsers.map(user => ({ userId: user.userId, role: 'Member' as const })));
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject || selectedUsers.length === 0) return;
    
    try {
      await onAddUsers(selectedProject, selectedUsers);
      // Reset state
      setSelectedProject(null);
      setSelectedUsers([]);
      setSearchTerm('');
      setUsersNotInProject([]);
      onClose();
    } catch (error) {
      console.error('Error adding users to project:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedProject(null);
      setSelectedUsers([]);
      setSearchTerm('');
      setUsersNotInProject([]);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  const getRoleIcon = (role: 'Admin' | 'Member') => {
    return role === 'Admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />;
  };

  const getRoleColor = (role: 'Admin' | 'Member') => {
    return role === 'Admin' 
      ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header - Following ProjectSelectionModal pattern */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Users to Project
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a project to see users who can be added
              </p>
            </div>
            {!isLoading && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isLoading && progress && progress.total > 1 && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Adding users to project...
              </span>
              <span className="text-sm text-blue-700 dark:text-blue-400">
                {progress.current} of {progress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            {progress.currentUser && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Currently adding: {progress.currentUser}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => handleProjectSelection(Number(e.target.value) || null)}
              disabled={isLoading}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.description && ` - ${project.description}`}
                </option>
              ))}
            </select>
          </div>

          {/* User Search - Only show if project is selected */}
          {selectedProject && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users Not in Project
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading || loadingUsers}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* User Selection */}
          {selectedProject && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Users Not in Project ({selectedUsers.length} selected)
                </label>
                {!loadingUsers && searchFilteredUsers.length > 0 && (
                  <button
                    onClick={handleSelectAllUsers}
                    disabled={isLoading}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50"
                  >
                    {selectedUsers.length === searchFilteredUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading users who can be added to this project...
                    </p>
                  </div>
                ) : searchFilteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm 
                      ? 'No users match your search' 
                      : usersNotInProject.length === 0 
                        ? 'All users are already in this project'
                        : 'No users available to add'
                    }
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {searchFilteredUsers.map((user) => {
                      const selectedUser = selectedUsers.find(u => u.userId === user.userId);
                      const isSelected = !!selectedUser;

                      return (
                        <div key={user.userId} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectUser(user.userId)}
                              disabled={isLoading}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {user.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.userName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.userEmail} • {user.userRole}
                              </p>
                            </div>
                            
                            {/* Role Selection */}
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Role:</span>
                                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                  <button
                                    onClick={() => handleRoleChange(user.userId, 'Member')}
                                    disabled={isLoading}
                                    className={`px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                                      selectedUser?.role === 'Member'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      Member
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleRoleChange(user.userId, 'Admin')}
                                    disabled={isLoading}
                                    className={`px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${
                                      selectedUser?.role === 'Admin'
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1">
                                      <Shield className="h-3 w-3" />
                                      Admin
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Users Summary */}
              {selectedUsers.length > 0 && !loadingUsers && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Users to Add ({selectedUsers.length}):
                  </h4>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {selectedUsers.map(selectedUser => {
                      const user = usersNotInProject.find(u => u.userId === selectedUser.userId);
                      if (!user) return null;
                      
                      return (
                        <div key={selectedUser.userId} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300">{user.userName}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                            {getRoleIcon(selectedUser.role)}
                            {selectedUser.role}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
                    <strong>Admins:</strong> {selectedUsers.filter(u => u.role === 'Admin').length} • 
                    <strong> Members:</strong> {selectedUsers.filter(u => u.role === 'Member').length}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Selection Prompt */}
          {!selectedProject && (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a Project
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a project above to see users who can be added to it
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedProject || selectedUsers.length === 0 || isLoading || loadingUsers}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {progress ? `Adding... (${progress.current}/${progress.total})` : 'Adding...'}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add {selectedUsers.length} User{selectedUsers.length === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};