import React, { useState, useEffect } from 'react';
import { 
  Activity,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  Bug,
  FolderOpen,
  MessageSquare,
  User,
  AlertCircle,
  Plus,
  Edit3,
  CheckCircle,
  Target,
  TrendingUp,
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { ActivitySkeleton } from '../components/Skeleton';
import type { Issue, Project, User as UserType } from '../types/interface';

interface ActivityItem {
  id: string;
  type: 'issue' | 'project' | 'user' | 'comment' | 'label' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'resolved' | 'closed' | 'commented' | 'labeled' | 'archived';
  actor: {
    id: number;
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

interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  thisWeekActivities: number;
  issueActivities: number;
  commentActivities: number;
  projectActivities: number;
}

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<ActivityStats>({
    totalActivities: 0,
    todayActivities: 0,
    thisWeekActivities: 0,
    issueActivities: 0,
    commentActivities: 0,
    projectActivities: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    loadActivityData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, typeFilter, actionFilter, dateFilter]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load data from services
      const [issuesResponse, projectsResponse, usersResponse] = await Promise.all([
        IssueService.getUserProjectsIssues(),
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      const issues = issuesResponse.success ? issuesResponse.data || [] : [];
      const projects = projectsResponse.success ? projectsResponse.data || [] : [];
      const users = usersResponse.success ? usersResponse.data || [] : [];

      // Generate activities from data
      const generatedActivities = generateActivitiesFromData(issues, projects, users);
      setActivities(generatedActivities);

      // Calculate stats
      const activityStats = calculateStats(generatedActivities);
      setStats(activityStats);

    } catch (err: any) {
      console.error('Error loading activity data:', err);
      setError('An error occurred while loading activity data');
    } finally {
      setLoading(false);
    }
  };

  const generateActivitiesFromData = (issues: Issue[], projects: Project[], users: UserType[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const now = Date.now();
    // const oneHourAgo = now - (60 * 60 * 1000);
    // const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Generate activities from issues
    issues.forEach((issue, index) => {
      const creator = users.find(u => u.id === issue.reporterId) || users[0] || {
        id: 1,
        name: 'System User',
        email: '',
        createdAt: '',
        updatedAt: ''
      };

      const assignee = users.find(u => u.id === issue.assigneeId);

      // Issue creation activity
      activities.push({
        id: `issue-create-${issue.id}`,
        type: 'issue',
        action: 'created',
        actor: {
          id: creator.id,
          name: creator.name
        },
        target: {
          id: issue.id.toString(),
          name: issue.title,
          type: 'issue'
        },
        description: `created issue "${issue.title}"`,
        timestamp: issue.createdAt,
        metadata: {
          project: issue.projectName || 'Unknown Project',
          priority: issue.priorityName || 'Medium',
          status: issue.statusName || 'Open'
        }
      });

      // Issue assignment activity
      if (issue.assigneeId && assignee) {
        const assignTime = new Date(issue.updatedAt || issue.createdAt);
        assignTime.setMinutes(assignTime.getMinutes() + Math.random() * 60);

        activities.push({
          id: `issue-assign-${issue.id}`,
          type: 'issue',
          action: 'assigned',
          actor: {
            id: creator.id,
            name: creator.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `assigned issue "${issue.title}" to ${assignee.name}`,
          timestamp: assignTime.toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium'
          }
        });
      }

      // Issue update activities (for recent issues)
      if (new Date(issue.updatedAt || issue.createdAt).getTime() > oneWeekAgo) {
        const updateTime = new Date(issue.updatedAt || issue.createdAt);
        updateTime.setHours(updateTime.getHours() + Math.random() * 24);

        activities.push({
          id: `issue-update-${issue.id}`,
          type: 'issue',
          action: 'updated',
          actor: {
            id: (assignee || creator).id,
            name: (assignee || creator).name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `updated issue "${issue.title}"`,
          timestamp: updateTime.toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project',
            status: issue.statusName || 'Open',
            priority: issue.priorityName || 'Medium'
          }
        });
      }

      // Resolved activity for resolved issues
      if (issue.statusName?.toLowerCase() === 'resolved') {
        const resolvedTime = new Date(issue.updatedAt || issue.createdAt);
        resolvedTime.setHours(resolvedTime.getHours() + Math.random() * 48);

        activities.push({
          id: `issue-resolve-${issue.id}`,
          type: 'issue',
          action: 'resolved',
          actor: {
            id: (assignee || creator).id,
            name: (assignee || creator).name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `resolved issue "${issue.title}"`,
          timestamp: resolvedTime.toISOString(),
          metadata: {
            from: 'In Progress',
            to: 'Resolved',
            project: issue.projectName || 'Unknown Project'
          }
        });
      }

      // Comment activities (generate some recent comments)
      if (index < 15) { // Only for first 15 issues to avoid too many activities
        const commenter = users[Math.floor(Math.random() * users.length)];
        const commentTime = new Date(now - Math.random() * (7 * 24 * 60 * 60 * 1000)); // Within last week

        activities.push({
          id: `comment-${issue.id}-${index}`,
          type: 'comment',
          action: 'commented',
          actor: {
            id: commenter.id,
            name: commenter.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `commented on issue "${issue.title}"`,
          timestamp: commentTime.toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project'
          }
        });
      }
    });

    // Generate project activities
    projects.forEach((project) => {
      const creator = users[Math.floor(Math.random() * users.length)] || users[0];
      if (creator && new Date(project.createdAt as string).getTime() > oneMonthAgo) {
        activities.push({
          id: `project-create-${project.id}`,
          type: 'project',
          action: 'created',
          actor: {
            id: creator.id,
            name: creator.name
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
      }
    });

    // Generate some additional system activities
    const systemActivities = [
      { action: 'labeled' as const, description: 'added label "bug" to' },
      { action: 'updated' as const, description: 'changed priority of' },
      { action: 'assigned' as const, description: 'reassigned' }
    ];

    systemActivities.forEach((sysActivity, index) => {
      if (issues[index]) {
        const issue = issues[index];
        const actor = users[index % users.length] || users[0];
        const activityTime = new Date(now - Math.random() * (3 * 24 * 60 * 60 * 1000)); // Within last 3 days

        activities.push({
          id: `system-${sysActivity.action}-${issue.id}-${index}`,
          type: 'system',
          action: sysActivity.action,
          actor: {
            id: actor.id,
            name: actor.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `${sysActivity.description} issue "${issue.title}"`,
          timestamp: activityTime.toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium'
          }
        });
      }
    });

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const calculateStats = (activities: ActivityItem[]): ActivityStats => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    return {
      totalActivities: activities.length,
      todayActivities: activities.filter(a => new Date(a.timestamp).getTime() > oneDayAgo).length,
      thisWeekActivities: activities.filter(a => new Date(a.timestamp).getTime() > oneWeekAgo).length,
      issueActivities: activities.filter(a => a.type === 'issue').length,
      commentActivities: activities.filter(a => a.type === 'comment').length,
      projectActivities: activities.filter(a => a.type === 'project').length
    };
  };

  const filterActivities = () => {
    let filtered = activities;

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

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      let timeThreshold = 0;

      switch (dateFilter) {
        case 'today':
          timeThreshold = now - (24 * 60 * 60 * 1000);
          break;
        case 'week':
          timeThreshold = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          timeThreshold = now - (30 * 24 * 60 * 60 * 1000);
          break;
      }

      if (timeThreshold > 0) {
        filtered = filtered.filter(activity => new Date(activity.timestamp).getTime() > timeThreshold);
      }
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string, action: string) => {
    const iconClass = "h-5 w-5 text-white";
    
    switch (type) {
      case 'issue':
        switch (action) {
          case 'created':
            return { icon: <Plus className={iconClass} />, bg: 'bg-blue-500' };
          case 'updated':
            return { icon: <Edit3 className={iconClass} />, bg: 'bg-amber-500' };
          case 'assigned':
            return { icon: <User className={iconClass} />, bg: 'bg-purple-500' };
          case 'resolved':
            return { icon: <CheckCircle className={iconClass} />, bg: 'bg-green-500' };
          case 'closed':
            return { icon: <Target className={iconClass} />, bg: 'bg-gray-500' };
          default:
            return { icon: <Bug className={iconClass} />, bg: 'bg-blue-500' };
        }
      case 'project':
        return { icon: <FolderOpen className={iconClass} />, bg: 'bg-indigo-500' };
      case 'comment':
        return { icon: <MessageSquare className={iconClass} />, bg: 'bg-emerald-500' };
      case 'system':
        return { icon: <AlertCircle className={iconClass} />, bg: 'bg-orange-500' };
      default:
        return { icon: <Activity className={iconClass} />, bg: 'bg-gray-500' };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaginatedActivities = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  if (loading) {
    return <ActivitySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Activity
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadActivityData}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Activity Feed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Track all project activities and updates
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadActivityData}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalActivities}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Activities</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.todayActivities}</span> today
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.thisWeekActivities}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">This Week</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-green-600 dark:text-green-400 font-medium">{((stats.thisWeekActivities / stats.totalActivities) * 100).toFixed(0)}%</span> of total
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.issueActivities}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Issue Activities</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-orange-600 dark:text-orange-400 font-medium">{stats.commentActivities}</span> comments
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.projectActivities}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Project Activities</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Projects & teams
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          {/* Main Search Bar */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex sm:hidden items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(typeFilter !== 'all' || actionFilter !== 'all' || dateFilter !== 'all') && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {(typeFilter !== 'all' ? 1 : 0) + (actionFilter !== 'all' ? 1 : 0) + (dateFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Type Filter */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Types</option>
                    <option value="issue">Issues</option>
                    <option value="project">Projects</option>
                    <option value="comment">Comments</option>
                    <option value="system">System</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Action Filter */}
                <div className="relative">
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                    <option value="commented">Commented</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="sm:hidden border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="issue">Issues</option>
                    <option value="project">Projects</option>
                    <option value="comment">Comments</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                    <option value="commented">Commented</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{getPaginatedActivities().length}</span> of <span className="font-medium">{filteredActivities.length}</span> activities
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Recent Activity
            </h3>
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {getPaginatedActivities().length > 0 ? (
              getPaginatedActivities().map((activity) => {
                const { icon, bg } = getActivityIcon(activity.type, activity.action);
                return (
                  <div key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex gap-3 sm:gap-4">
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-full flex items-center justify-center`}>
                        {icon}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              <span className="font-semibold">{activity.actor.name}</span>{' '}
                              {activity.description}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1 sm:gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="capitalize">{activity.type}</span>
                              {activity.metadata?.project && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="truncate max-w-32 sm:max-w-none">{activity.metadata.project}</span>
                                </>
                              )}
                              <span className="hidden sm:inline">•</span>
                              <span className="whitespace-nowrap">{formatDate(activity.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Activity Metadata */}
                        {(activity.metadata?.priority || activity.metadata?.status || activity.metadata?.from) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {activity.metadata.priority && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                activity.metadata.priority.toLowerCase() === 'critical' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                  : activity.metadata.priority.toLowerCase() === 'high'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                                  : activity.metadata.priority.toLowerCase() === 'medium'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              }`}>
                                {activity.metadata.priority}
                              </span>
                            )}
                            {activity.metadata.status && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {activity.metadata.status}
                              </span>
                            )}
                            {activity.metadata.from && activity.metadata.to && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                {activity.metadata.from} → {activity.metadata.to}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <Activity className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  {searchTerm || typeFilter !== 'all' || actionFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Activities will appear here as they happen'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    const pageNum = Math.max(1, currentPage - 2) + index;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;