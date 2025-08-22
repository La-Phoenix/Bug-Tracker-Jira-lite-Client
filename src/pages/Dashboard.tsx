import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  Activity,
  Target,
  BarChart3,
  Zap,
  Plus,
  Eye,
  User,
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../components/Skeleton';
import type { Issue } from '../types/interface';

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  totalProjects: number;
  totalUsers: number;
  criticalIssues: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    closedIssues: 0,
    totalProjects: 0,
    totalUsers: 0,
    criticalIssues: 0
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [issuesRes, projectsRes, usersRes] = await Promise.all([
        IssueService.getUserProjectsIssues(),
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (issuesRes.success && issuesRes.data) {
        const issues = issuesRes.data;
        
        const newStats: DashboardStats = {
          totalIssues: issues.length,
          openIssues: issues.filter(issue => issue.statusName?.toLowerCase() === 'open').length,
          inProgressIssues: issues.filter(issue => issue.statusName?.toLowerCase().includes('progress')).length,
          resolvedIssues: issues.filter(issue => issue.statusName?.toLowerCase() === 'resolved').length,
          closedIssues: issues.filter(issue => issue.statusName?.toLowerCase() === 'closed').length,
          totalProjects: projectsRes.success ? (projectsRes.data?.length || 0) : 0,
          totalUsers: usersRes.success ? (usersRes.data?.length || 0) : 0,
          criticalIssues: issues.filter(issue => issue.priorityName?.toLowerCase() === 'critical').length
        };

        setStats(newStats);

        const recent = issues
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8);
        
        setRecentIssues(recent);
      } else {
        setError(issuesRes.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError('An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'in-progress':
      case 'in progress':
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadDashboardData}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const resolutionRate = stats.totalIssues > 0 ? (stats.resolvedIssues / stats.totalIssues) * 100 : 0;
  const activeIssues = stats.openIssues + stats.inProgressIssues;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
              Overview of your bug tracking system
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:inline">Refresh</span>
            </button>
            <Link
              to="/issues?create=true"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>New Issue</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalIssues}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Issues</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Resolution Rate</span>
                <span className="font-medium">{Math.round(resolutionRate)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${resolutionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Active Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{activeIssues}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Issues</p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex-shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="text-red-600 dark:text-red-400 font-medium">{stats.criticalIssues}</span> critical priority
              </p>
            </div>
          </div>

          {/* Resolved Issues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.resolvedIssues}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stats.closedIssues}</span> closed
              </p>
            </div>
          </div>

          {/* Team Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Overview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                    <FolderOpen className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Projects</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-indigo-100 dark:bg-indigo-900/20 rounded">
                    <Users className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Users</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Issue Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Issue Status Breakdown
            </h3>
            <Link
              to="/issues"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium self-start sm:self-auto"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Open', value: stats.openIssues, icon: AlertCircle, color: 'red' },
              { label: 'In Progress', value: stats.inProgressIssues, icon: Clock, color: 'amber' },
              { label: 'Resolved', value: stats.resolvedIssues, icon: CheckCircle, color: 'emerald' },
              { label: 'Closed', value: stats.closedIssues, icon: CheckCircle, color: 'slate' }
            ].map((item, index) => {
              const percentage = stats.totalIssues > 0 ? (item.value / stats.totalIssues) * 100 : 0;
              const IconComponent = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-${item.color}-100 dark:bg-${item.color}-900/20 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-1">{item.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">{item.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{Math.round(percentage)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Issues & Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Issues */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  Recent Activity
                </h3>
                <Link
                  to="/issues"
                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium self-start sm:self-auto"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-gray-700 max-h-96 sm:max-h-none overflow-y-auto">
              {recentIssues.length > 0 ? (
                recentIssues.map((issue) => (
                  <div key={issue.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(issue.statusName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                            {issue.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priorityName)} self-start sm:self-auto flex-shrink-0`}>
                            {issue.priorityName || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono">#{issue.id}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate max-w-32 sm:max-w-none">{issue.projectName || 'No Project'}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="whitespace-nowrap">{formatDate(issue.createdAt)}</span>
                          {issue.assigneeName && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <div className="flex items-center gap-1 truncate">
                                <User className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-20 sm:max-w-none">{issue.assigneeName}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        <Eye className="h-4 w-4 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-2">No Issues Yet</h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm sm:text-base">Get started by creating your first issue</p>
                  <Link
                    to="/issues"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Create Issue
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { to: '/issues', icon: Bug, title: 'Manage Issues', desc: 'View and manage all issues', color: 'blue' },
                { to: '/projects', icon: FolderOpen, title: 'Projects', desc: 'Organize your work', color: 'purple' },
                { to: '/reports', icon: TrendingUp, title: 'Reports', desc: 'Analytics and insights', color: 'emerald' }
              ].map((action, index) => (
                <Link
                  key={index}
                  to={action.to}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                >
                  <div className={`p-2 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-lg group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm sm:text-base">
                      {action.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;