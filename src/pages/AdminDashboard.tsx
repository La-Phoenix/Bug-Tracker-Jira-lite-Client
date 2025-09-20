import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FolderOpen,
  Bug,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle,
  Database,
  RefreshCw,
  Download,
  UserX,
  Trash2,
  Eye,
  MoreVertical,
  Cpu,
  HardDrive,
  Globe,
  Menu,
  ChevronDown
} from 'lucide-react';
import { AdminService } from '../services/AdminService';
import type { AdminStats, SystemActivity, UserActivity, ProjectActivity, SystemHealth } from '../types/interface';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemActivity, setSystemActivity] = useState<SystemActivity[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [projectActivity, setProjectActivity] = useState<ProjectActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'system'>('overview');
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, activityRes, usersRes, projectsRes, healthRes] = await Promise.all([
        AdminService.getAdminStats(),
        AdminService.getSystemActivity(),
        AdminService.getUserActivity(),
        AdminService.getProjectActivity(),
        AdminService.getSystemHealth()
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (activityRes.success && activityRes.data) {
        setSystemActivity(activityRes.data);
      }

      if (usersRes.success && usersRes.data) {
        setUserActivity(usersRes.data);
      }

      if (projectsRes.success && projectsRes.data) {
        setProjectActivity(projectsRes.data);
      }

      if (healthRes.success && healthRes.data) {
        setSystemHealth(healthRes.data);
      }

    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError('An error occurred while loading admin data');
    } finally {
      setLoading(false);
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

  const getActivityIcon = (type: SystemActivity['type']) => {
    switch (type) {
      case 'user_login':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'user_registered':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'project_created':
        return <FolderOpen className="h-4 w-4 text-purple-600" />;
      case 'issue_created':
        return <Bug className="h-4 w-4 text-orange-600" />;
      case 'system_event':
        return <Server className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'system', label: 'System Health', icon: Server }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Admin Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadAdminData}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
              System overview and management controls
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadAdminData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => AdminService.performBackup()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              <span>Backup</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="flex items-center justify-between w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              <span className="font-medium">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMobileNav ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Mobile Navigation Dropdown */}
          {showMobileNav && (
            <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setShowMobileNav(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Tabs */}
        <div className="hidden lg:block mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalUsers}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {stats?.activeUsers}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">active users</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalProjects}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Projects</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {stats?.activeProjects}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">active</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.totalIssues}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Issues</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {stats?.resolvedIssues}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-1">resolved</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats?.systemHealth}%</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">System Health</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.systemHealth || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* System Activity & Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Recent Activity
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {systemActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 dark:text-white">
                            {activity.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            {activity.userName && (
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {activity.userName}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Storage Usage
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="text-center mb-6">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {stats?.storageUsed}GB
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      of {stats?.storageLimit}GB used
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((stats?.storageUsed || 0) / (stats?.storageLimit || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Database</span>
                      <span className="text-slate-900 dark:text-white">45.2 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Files</span>
                      <span className="text-slate-900 dark:text-white">22.8 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Backups</span>
                      <span className="text-slate-900 dark:text-white">10.5 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">User Management</h3>
            </div>
            
            {/* Mobile Cards View */}
            <div className="lg:hidden">
              {userActivity.map((user) => (
                <div key={user.userId} className="p-4 border-b border-slate-200 dark:border-gray-700 last:border-b-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.userName}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user.userEmail}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : user.status === 'suspended'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Activity:</span>
                        <div className="text-slate-900 dark:text-white">
                          {user.issuesCreated} issues
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {user.issuesResolved} resolved
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Last Login:</span>
                        <div className="text-slate-900 dark:text-white">
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button 
                        onClick={() => AdminService.suspendUser(user.userId)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <UserX className="h-4 w-4" />
                        Suspend
                      </button>
                      <button className="px-3 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  {userActivity.map((user) => (
                    <tr key={user.userId} className="hover:bg-slate-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.userName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {user.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {user.issuesCreated} issues • {user.projectsCount} projects
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {user.issuesResolved} resolved
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : user.status === 'suspended'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => AdminService.suspendUser(user.userId)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Management</h3>
            </div>
            
            {/* Mobile Cards View */}
            <div className="lg:hidden">
              {projectActivity.map((project) => (
                <div key={project.projectId} className="p-4 border-b border-slate-200 dark:border-gray-700 last:border-b-0">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {project.projectName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        by {project.createdBy}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                          {project.membersCount}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                          {project.issuesCount}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">Issues</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                          {project.completionRate}%
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">Complete</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.completionRate}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button 
                        onClick={() => AdminService.deleteProject(project.projectId)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                      <button className="px-3 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Issues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                  {projectActivity.map((project) => (
                    <tr key={project.projectId} className="hover:bg-slate-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {project.projectName}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            by {project.createdBy}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {project.membersCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {project.issuesCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-slate-900 dark:text-white mr-2">
                            {project.completionRate}%
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${project.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => AdminService.deleteProject(project.projectId)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && systemHealth && (
          <div className="space-y-4 sm:space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'CPU Usage', value: systemHealth.cpu, icon: Cpu, unit: '%' },
                { label: 'Memory', value: systemHealth.memory, icon: Database, unit: '%' },
                { label: 'Storage', value: systemHealth.storage, icon: HardDrive, unit: '%' },
                { label: 'Database', value: systemHealth.database, icon: Database, unit: '%' }
              ].map((metric, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                      <p className={`text-xl sm:text-2xl font-bold ${getHealthColor(metric.value)}`}>
                        {metric.value}{metric.unit}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-slate-100 dark:bg-gray-700 rounded-lg">
                      <metric.icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getHealthBgColor(metric.value)}`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
              <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  System Information
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">System Uptime</span>
                      <span className="text-slate-900 dark:text-white font-medium">{systemHealth.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">API Response Time</span>
                      <span className="text-slate-900 dark:text-white font-medium">{systemHealth.apiResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Last Health Check</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {formatDate(systemHealth.lastChecked)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Database Status</span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Online</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Cache Status</span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Active</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Backup Status</span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Up to date</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;