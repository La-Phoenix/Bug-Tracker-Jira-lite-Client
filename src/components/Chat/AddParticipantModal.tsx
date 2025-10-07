import React, { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { UserService } from '../../services/UserService';
import type { User as UserType } from '../../types/interface';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (userId: number) => void;
  currentParticipants: number[];
  roomName: string;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onAddParticipant,
  currentParticipants,
  roomName
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success && response.data) {
        // Filter out users who are already participants
        const availableUsers = response.data.filter(user => 
          !currentParticipants.includes(user.id)
        );
        setUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddSelected = () => {
    selectedUsers.forEach(userId => {
      onAddParticipant(userId);
    });
    onClose();
    setSelectedUsers([]);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Participants
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Add members to {roomName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Plus className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedUsers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};