import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bug,
  FolderOpen,
  Users,
  Edit3,
  Plus,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  User,
  Calendar,
  RefreshCw,
  Activity as ActivityIcon,
  Loader,
  Search,
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import type { Issue, Project, User as UserType } from '../types/interface';

interface ActivityItem {
  id: string;
  type: 'issue' | 'project' | 'user' | 'comment' | 'label' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'resolved' | 'closed' | 'commented' | 'labeled' | 'archived';
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    name: string;
    type: 'issue' | 'project' | 'user' | 'comment';
  };
  description: string;
  timestamp: string;
  metadata?: {
    from?: string;
    to?: string;
    project?: string;
    priority?: string;
    status?: string;
  };
}

const Activity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  console.log(allIssues, allProjects)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('7'); // days

  useEffect(() => {
    loadActivityData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, typeFilter, actionFilter, userFilter, dateFilter]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [issuesResponse, projectsResponse, usersResponse] = await Promise.all([
        IssueService.getAllIssues(),
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      const issues = issuesResponse.success ? issuesResponse.data || [] : [];
      const projects = projectsResponse.success ? projectsResponse.data || [] : [];
      const users = usersResponse.success ? usersResponse.data || [] : [];

      setAllIssues(issues);
      setAllProjects(projects);
      setAllUsers(users);

      // Generate mock activities based on existing data
      const mockActivities = generateMockActivities(issues, projects, users);
      setActivities(mockActivities);

    } catch (err: any) {
      console.error('Error loading activity data:', err);
      setError('An error occurred while loading activity data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockActivities = (issues: Issue[], projects: Project[], users: UserType[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    // const now = new Date();

    // Generate activities from issues
    issues.forEach((issue) => {
      const createdDate = new Date(issue.createdAt);
      const updatedDate = new Date(issue.updatedAt || issue.createdAt);
      
      const actor = users.find(u => u.id === issue.reporterId) || users[0] || {
        id: '1',
        name: 'Unknown User',
        email: '',
        createdAt: '',
        updatedAt: ''
      };

      // Issue creation activity
      activities.push({
        id: `issue-create-${issue.id}`,
        type: 'issue',
        action: 'created',
        actor: {
          id: actor.id.toString(),
          name: actor.name
        },
        target: {
          id: issue.id.toString(),
          name: issue.title,
          type: 'issue'
        },
        description: `created issue "${issue.title}" in ${issue.projectName || 'Unknown Project'}`,
        timestamp: issue.createdAt,
        metadata: {
          project: issue.projectName || 'Unknown Project',
          priority: issue.priorityName || 'Unknown',
          status: issue.statusName || 'Open'
        }
      });

      // Issue update activity (if different from creation)
      if (updatedDate > createdDate) {
        const assignee = users.find(u => u.id === issue.assigneeId) || actor;
        activities.push({
          id: `issue-update-${issue.id}`,
          type: 'issue',
          action: 'updated',
          actor: {
            id: assignee.id.toString(),
            name: assignee.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `updated issue "${issue.title}"`,
          timestamp: issue.updatedAt || issue.createdAt,
          metadata: {
            project: issue.projectName || 'Unknown Project',
            status: issue.statusName || 'Open'
          }
        });
      }

      // Generate some resolved activities
      if (issue.statusName?.toLowerCase() === 'resolved' && Math.random() > 0.7) {
        const resolvedDate = new Date(updatedDate.getTime() + Math.random() * 86400000); // Random time after update
        activities.push({
          id: `issue-resolve-${issue.id}`,
          type: 'issue',
          action: 'resolved',
          actor: {
            id: (users.find(u => u.id === issue.assigneeId) || actor).id.toString(),
            name: (users.find(u => u.id === issue.assigneeId) || actor).name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `resolved issue "${issue.title}"`,
          timestamp: resolvedDate.toISOString(),
          metadata: {
            from: 'In Progress',
            to: 'Resolved',
            project: issue.projectName || 'Unknown Project'
          }
        });
      }
    });

    // Generate activities from projects
    projects.forEach((project, index) => {
      const actor = users[index % users.length] || {
        id: '1',
        name: 'Unknown User',
        email: '',
        createdAt: '',
        updatedAt: ''
      };

      activities.push({
        id: `project-create-${project.id}`,
        type: 'project',
        action: 'created',
        actor: {
          id: actor.id.toString(),
          name: actor.name
        },
        target: {
          id: project.id.toString(),
          name: project.name,
          type: 'project'
        },
        description: `created project "${project.name}"`,
        timestamp: project.createdAt as string,
        metadata: {}
      });
    });

    // Generate some mock comment activities
    const commentActivities = Array.from({ length: Math.min(10, issues.length) }, (_, i) => {
      const issue = issues[i];
      const actor = users[i % users.length] || users[0];
      const commentDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days

      return {
        id: `comment-${i}`,
        type: 'comment' as const,
        action: 'commented' as const,
        actor: {
          id: actor?.id.toString() || '1',
          name: actor?.name || 'Unknown User'
        },
        target: {
          id: issue?.id.toString() || '1',
          name: issue?.title || 'Unknown Issue',
          type: 'issue' as const
        },
        description: `commented on issue "${issue?.title || 'Unknown Issue'}"`,
        timestamp: commentDate.toISOString(),
        metadata: {
          project: issue?.projectName || 'Unknown Project'
        }
      };
    });

    activities.push(...commentActivities);

    // Generate some user activities
    const userActivities: any = users.slice(0, 3).map((user) => ({
      id: `user-join-${user.id}`,
      type: 'user' as const,
      action: 'created' as const,
      actor: {
        id: '0',
        name: 'System'
      },
      target: {
        id: user.id.toString(),
        name: user.name,
        type: 'user' as const
      },
      description: `${user.name} joined the team`,
      timestamp: user.createdAt,
      metadata: {}
    }));

    activities.push(...userActivities);

    // Sort by timestamp (newest first) and limit to reasonable number
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);
  };

  const filterActivities = () => {
    let filtered = [...activities];

    // Date filter
    if (dateFilter !== 'all') {
      const daysAgo = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= cutoffDate
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.target.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => activity.action === actionFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(activity => activity.actor.id === userFilter);
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'issue':
        switch (action) {
          case 'created': return <Plus className="h-4 w-4 text-blue-600" />;
          case 'updated': return <Edit3 className="h-4 w-4 text-amber-600" />;
          case 'resolved': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
          case 'closed': return <XCircle className="h-4 w-4 text-red-600" />;
          case 'assigned': return <User className="h-4 w-4 text-purple-600" />;
          default: return <Bug className="h-4 w-4 text-slate-600" />;
        }
      case 'project':
        return <FolderOpen className="h-4 w-4 text-indigo-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-cyan-600" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-slate-600" />;
    }
  };

  const getActivityColor = (type: string, action: string) => {
    switch (type) {
      case 'issue':
        switch (action) {
          case 'created': return 'bg-blue-100 dark:bg-blue-900/20';
          case 'updated': return 'bg-amber-100 dark:bg-amber-900/20';
          case 'resolved': return 'bg-emerald-100 dark:bg-emerald-900/20';
          case 'closed': return 'bg-red-100 dark:bg-red-900/20';
          case 'assigned': return 'bg-purple-100 dark:bg-purple-900/20';
          default: return 'bg-slate-100 dark:bg-slate-800';
        }
      case 'project':
        return 'bg-indigo-100 dark:bg-indigo-900/20';
      case 'user':
        return 'bg-cyan-100 dark:bg-cyan-900/20';
      case 'comment':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    const groups: { [date: string]: ActivityItem[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading activities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Activities
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadActivityData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(filteredActivities);
  const activityStats = {
    total: activities.length,
    today: activities.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    thisWeek: activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return activityDate >= weekAgo;
    }).length,
    issues: activities.filter(a => a.type === 'issue').length
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-600" />
            Activity Feed
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track all recent activities across your projects and team
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={loadActivityData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activityStats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Activities</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ActivityIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activityStats.today}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activityStats.thisWeek}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{activityStats.issues}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Issue Activities</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="1">Today</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last week</option>
              <option value="30">Last month</option>
              <option value="all">All time</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="issue">Issues</option>
              <option value="project">Projects</option>
              <option value="comment">Comments</option>
              <option value="user">Users</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="resolved">Resolved</option>
              <option value="commented">Commented</option>
              <option value="assigned">Assigned</option>
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Users</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id.toString()}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-3 bg-slate-50 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700">
              <h3 className="font-medium text-slate-900 dark:text-white">
                {new Date(date).toDateString() === new Date().toDateString() 
                  ? 'Today' 
                  : new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                }
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                  ({dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'})
                </span>
              </h3>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-gray-700">
              {dayActivities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type, activity.action)}`}>
                      {getActivityIcon(activity.type, activity.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {getInitials(activity.actor.name)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {activity.actor.name}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {activity.description}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.metadata.from && activity.metadata.to && (
                            <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-gray-700 rounded-full text-slate-600 dark:text-slate-400">
                              {activity.metadata.from} → {activity.metadata.to}
                            </span>
                          )}
                          {activity.metadata.project && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                              {activity.metadata.project}
                            </span>
                          )}
                          {activity.metadata.priority && (
                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400">
                              {activity.metadata.priority} Priority
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-12 text-center">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No activities found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm || typeFilter !== 'all' || actionFilter !== 'all' || userFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No recent activities to display'}
            </p>
            {!searchTerm && typeFilter === 'all' && actionFilter === 'all' && userFilter === 'all' && (
              <button
                onClick={loadActivityData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Activities
              </button>
            )}
          </div>
        )}

        {/* Load More */}
        {filteredActivities.length > 0 && filteredActivities.length >= 50 && (
          <div className="text-center">
            <button
              className="px-6 py-3 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            >
              Load More Activities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;