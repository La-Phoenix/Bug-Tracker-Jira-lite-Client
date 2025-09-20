import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Hash,
  User,
  Search,
  Check,
} from 'lucide-react';
import { ProjectService } from '../../services/ProjectService';
import { UserService } from '../../services/UserService';
import { ChatService } from '../../services/ChatService';
import type { ChatRoom, CreateChatRoomRequest, User as UserType, Project  } from '../../types/interface';

interface CreateChatModalProps {
  onClose: () => void;
  onChatCreated: (room: ChatRoom) => void;
}

export const CreateChatModal: React.FC<CreateChatModalProps> = ({
  onClose,
  onChatCreated
}) => {
  const [step, setStep] = useState<'type' | 'details' | 'members'>('type');
  const [chatType, setChatType] = useState<'direct' | 'group' | 'project'>('group');
  const [chatName, setChatName] = useState('');
  const [chatDescription, setChatDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
    if (chatType === 'project') {
      loadProjects();
    }
  }, [chatType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await ProjectService.getMyProjects();
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleUserToggle = (user: UserType) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return chatType === 'direct' ? [user] : [...prev, user];
      }
    });
  };

  const handleCreateChat = async () => {
    try {
      setCreating(true);
      
      const request: CreateChatRoomRequest = {
        name: chatType === 'direct' 
          ? selectedUsers[0]?.name || 'Direct Message'
          : chatName,
        type: chatType,
        description: chatDescription || undefined,
        projectId: selectedProject?.id,
        participantIds: selectedUsers.map(u => u.id)
      };

      const response = await ChatService.createChatRoom(request);
      if (response.success && response.data) {
        onChatCreated(response.data);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canProceed = () => {
    switch (step) {
      case 'type':
        return true;
      case 'details':
        if (chatType === 'direct') return true;
        if (chatType === 'project') return selectedProject && chatName.trim();
        return chatName.trim();
      case 'members':
        return selectedUsers.length > 0;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type':
        return 'Choose Chat Type';
      case 'details':
        return 'Chat Details';
      case 'members':
        return 'Add Members';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getStepTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'type' && (
            <div className="space-y-3">
              <button
                onClick={() => setChatType('direct')}
                className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                  chatType === 'direct'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Direct Message
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Private conversation with one person
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setChatType('group')}
                className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                  chatType === 'group'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Group Chat
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Conversation with multiple team members
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setChatType('project')}
                className={`w-full p-4 border-2 rounded-lg transition-colors text-left ${
                  chatType === 'project'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Project Chat
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Discussion related to a specific project
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'details' && chatType !== 'direct' && (
            <div className="space-y-4">
              {chatType === 'project' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Project
                  </label>
                  <select
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p.id === parseInt(e.target.value));
                      setSelectedProject(project || null);
                      if (project && !chatName) {
                        setChatName(`${project.name} Discussion`);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chat Name
                </label>
                <input
                  type="text"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Enter chat name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={chatDescription}
                  onChange={(e) => setChatDescription(e.target.value)}
                  placeholder="What's this chat about?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {step === 'members' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Selected ({selectedUsers.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {user.name}
                        <button
                          onClick={() => handleUserToggle(user)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = selectedUsers.some(u => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleUserToggle(user)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              if (step === 'type') {
                onClose();
              } else if (step === 'details') {
                setStep('type');
              } else {
                setStep('details');
              }
            }}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {step === 'type' ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={() => {
              if (step === 'type') {
                setStep(chatType === 'direct' ? 'members' : 'details');
              } else if (step === 'details') {
                setStep('members');
              } else {
                handleCreateChat();
              }
            }}
            disabled={!canProceed() || creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {creating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              step === 'members' ? 'Create Chat' : 'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};