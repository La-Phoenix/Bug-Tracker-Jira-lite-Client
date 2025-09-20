import React, { useState } from 'react';
import {
  X,
  Users,
  Hash,
  Bot,
  UserCheck,
  Pin,
  VolumeX,
  Volume2,
  Settings,
  UserPlus,
  Shield,
  Crown,
  Circle,
  Phone,
  Video,
  Archive,
  Trash2,
  Download,
  Search
} from 'lucide-react';
import type { ChatRoom, ChatParticipant } from '../../types/interface';

interface ChatInfoProps {
  room: ChatRoom;
  onClose: () => void;
  onToggleMute: () => void;
  onTogglePin: () => void;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({
  room,
  onClose,
  onToggleMute,
  onTogglePin
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'media' | 'settings'>('members');
  const [searchMembers, setSearchMembers] = useState('');

  const getRoomIcon = () => {
    switch (room.type) {
      case 'direct':
        return <UserCheck className="h-6 w-6 text-green-600" />;
      case 'group':
        return <Users className="h-6 w-6 text-blue-600" />;
      case 'project':
        return <Hash className="h-6 w-6 text-purple-600" />;
      case 'ai_assistant':
        return <Bot className="h-6 w-6 text-orange-600" />;
      default:
        return <Users className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ChatParticipant['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'invisible':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: ChatParticipant['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredParticipants = room.participants.filter(participant =>
    participant.userName.toLowerCase().includes(searchMembers.toLowerCase()) ||
    participant.userEmail.toLowerCase().includes(searchMembers.toLowerCase())
  );

  const onlineCount = room.participants.filter(p => p.isOnline).length;

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat Info
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Room Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            {room.avatar ? (
              <img src={room.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getRoomIcon()
            )}
          </div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {room.name}
          </h4>
          {room.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {room.description}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{room.participants.length} members</span>
            </div>
            {room.type !== 'direct' && (
              <div className="flex items-center gap-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span>{onlineCount} online</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4">
          {room.type !== 'ai_assistant' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Call</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
                <Video className="h-4 w-4" />
                <span className="text-sm">Video</span>
              </button>
            </>
          )}
          <button
            onClick={onTogglePin}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
              room.isPinned
                ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Pin className="h-4 w-4" />
            <span className="text-sm">{room.isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          {['members', 'media', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 px-4 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'members' && (
          <div className="p-4">
            {/* Search Members */}
            {room.participants.length > 5 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchMembers}
                  onChange={(e) => setSearchMembers(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            )}

            {/* Add Members Button */}
            {room.type !== 'direct' && room.type !== 'ai_assistant' && (
              <button className="w-full flex items-center gap-3 p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <span className="font-medium">Add Members</span>
              </button>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {filteredParticipants.map((participant) => (
                <div key={participant.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                  <div className="relative">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {participant.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {participant.isOnline && (
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${getStatusColor(participant.status)}`}></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {participant.userName}
                      </span>
                      {getRoleIcon(participant.role)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="truncate">{participant.userEmail}</span>
                      {!participant.isOnline && participant.lastSeen && (
                        <>
                          <span>•</span>
                          <span>Last seen {new Date(participant.lastSeen).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors opacity-0 group-hover:opacity-100">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-4">
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No media files
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shared photos, videos, and files will appear here
              </p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4 space-y-4">
            {/* Notification Settings */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Notifications
              </h5>
              <div className="space-y-3">
                <button
                  onClick={onToggleMute}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {room.isMuted ? (
                      <VolumeX className="h-5 w-5 text-red-500" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {room.isMuted ? 'Unmute notifications' : 'Mute notifications'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Chat Actions */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Chat Actions
              </h5>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <Download className="h-5 w-5" />
                  <span className="text-sm">Export chat</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors">
                  <Archive className="h-5 w-5" />
                  <span className="text-sm">Archive chat</span>
                </button>
                
                {room.type !== 'ai_assistant' && (
                  <button className="w-full flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                    <span className="text-sm">Delete chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chat Info */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Chat Details
              </h5>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Messages</span>
                  <span>247</span>
                </div>
                <div className="flex justify-between">
                  <span>Files shared</span>
                  <span>12</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};