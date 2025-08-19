import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Grid3X3,
  List,
  UserPlus,
  User,
  Award,
  Clock,
  Target,
  MessageSquare,
  Activity
} from 'lucide-react';
import { UserService } from '../services/UserService';
import { IssueService } from '../services/IssueServices';
import type { User as UserType, Issue } from '../types/interface';

interface TeamMember extends UserType {
  activeIssues?: number;
  resolvedIssues?: number;
  lastActive?: string;
  performance?: 'excellent' | 'good' | 'average' | 'needs-attention';
}

const Team: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  
  // View and selection
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  
  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, searchTerm, roleFilter, performanceFilter]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersResponse, issuesResponse] = await Promise.all([
        UserService.getAllUsers(),
        IssueService.getAllIssues()
      ]);

      if (usersResponse.success && usersResponse.data) {
        const issues = issuesResponse.success ? issuesResponse.data || [] : [];
        setAllIssues(issues);
        
        // Enhance users with performance data
        const enhancedMembers: any = usersResponse.data.map(user => {
          const userIssues = issues.filter(issue => issue.assigneeId === user.id);
          const activeIssues = userIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'open' || 
            issue.statusName?.toLowerCase().includes('progress')
          ).length;
          const resolvedIssues = userIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'resolved'
          ).length;
          
          // Calculate performance based on resolved vs active ratio
          let performance: 'excellent' | 'good' | 'average' | 'needs-attention' = 'average';
          const totalIssues = userIssues.length;
          if (totalIssues > 0) {
            const resolvedRatio = resolvedIssues / totalIssues;
            if (resolvedRatio >= 0.8) performance = 'excellent';
            else if (resolvedRatio >= 0.6) performance = 'good';
            else if (resolvedRatio >= 0.4) performance = 'average';
            else performance = 'needs-attention';
          }

          return {
            ...user,
            activeIssues,
            resolvedIssues,
            lastActive: user.updatedAt || user.createdAt,
            performance
          };
        });

        setTeamMembers(enhancedMembers);
      } else {
        setError(usersResponse.message || 'Failed to fetch team data');
      }
    } catch (err: any) {
      console.error('Error loading team:', err);
      setError('An error occurred while loading team data');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...teamMembers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.performance === performanceFilter
      );
    }

    setFilteredMembers(filtered);
  };

  const handleSelectMember = (memberId: number) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(member => member.id));
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    setRemovingMember(member);
  };

  const confirmRemove = async () => {
    // if (!removingMember) return;
    
    // setIsRemoving(true);
    // try {
    //   // In a real app, you might have a different endpoint for removing team members
    //   // vs deleting users entirely
    //   const response = await UserService.deleteUser(removingMember.id);
    //   if (response.success) {
    //     setTeamMembers(prev => prev.filter(m => m.id !== removingMember.id));
    //     setSelectedMembers(prev => prev.filter(id => id !== removingMember.id));
    //     setRemovingMember(null);
    //   } else {
    //     alert(response.message || 'Failed to remove team member');
    //   }
    // } catch (err: any) {
    //   console.error('Error removing team member:', err);
    //   alert('An error occurred while removing the team member');
    // } finally {
    //   setIsRemoving(false);
    // }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'lead':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'senior':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'developer':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'tester':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'average':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'needs-attention':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'manager':
      case 'lead':
        return <UserPlus className="h-4 w-4" />;
      case 'senior':
        return <Award className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Award className="h-4 w-4" />;
      case 'good':
        return <Target className="h-4 w-4" />;
      case 'average':
        return <Clock className="h-4 w-4" />;
      case 'needs-attention':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Team
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadTeamData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const teamStats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.activeIssues && m.activeIssues > 0).length,
    highPerformers: teamMembers.filter(m => m.performance === 'excellent').length,
    totalActiveIssues: teamMembers.reduce((sum, m) => sum + (m.activeIssues || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            Team
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your development team and track performance
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{teamStats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{teamStats.active}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Members</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{teamStats.highPerformers}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">High Performers</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{teamStats.totalActiveIssues}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Issues</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="lead">Team Lead</option>
              <option value="senior">Senior</option>
              <option value="developer">Developer</option>
              <option value="tester">Tester</option>
            </select>

            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="average">Average</option>
              <option value="needs-attention">Needs Attention</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-slate-500 dark:text-gray-400'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected Actions */}
        {selectedMembers.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              {selectedMembers.length} member(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Send Message
              </button>
              <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                Change Role
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Members Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Role:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role as string)}`}>
                    {getRoleIcon(member.role as string)}
                    {member.role || 'Member'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Performance:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance || 'average')}`}>
                    {getPerformanceIcon(member.performance || 'average')}
                    {member.performance || 'Average'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                  <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{member.activeIssues || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Active</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{member.resolvedIssues || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Resolved</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-gray-700">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
                <button
                  onClick={() => handleRemoveMember(member)}
                  className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:border-red-300 dark:hover:border-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedMembers.length === filteredMembers.length}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
              />
              <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="col-span-3">Member</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2">Performance</div>
                <div className="col-span-2">Active Issues</div>
                <div className="col-span-2">Last Active</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {filteredMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleSelectMember(member.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
                  />
                  <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role as string)}`}>
                        {getRoleIcon(member.role as string)}
                        {member.role || 'Member'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(member.performance || 'average')}`}>
                        {getPerformanceIcon(member.performance || 'average')}
                        {member.performance || 'Average'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{member.activeIssues || 0}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({member.resolvedIssues || 0} resolved)
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(member.lastActive || member.createdAt as string)}
                      </p>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <button className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-12 text-center">
          <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No team members found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchTerm || roleFilter !== 'all' || performanceFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start building your team by inviting members'}
          </p>
          {!searchTerm && roleFilter === 'all' && performanceFilter === 'all' && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Invite Team Member
            </button>
          )}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removingMember && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md mx-4 border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Remove Team Member
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to remove <strong>{removingMember.name}</strong> from the team? 
                They will lose access to team projects and issues.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRemovingMember(null)}
                  disabled={isRemoving}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  disabled={isRemoving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  {isRemoving ? 'Removing...' : 'Remove Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;