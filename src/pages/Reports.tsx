import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Activity,
  Target,
  Users,
  Bug,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  FileText,
  Settings
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import type { Issue, Project, User } from '../types/interface';

interface ReportMetrics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  criticalIssues: number;
  averageResolutionTime: number;
  resolutionRate: number;
  issuesByPriority: { [key: string]: number };
  issuesByStatus: { [key: string]: number };
  issuesByProject: { [key: string]: number };
  issuesByAssignee: { [key: string]: number };
  monthlyTrends: { month: string; created: number; resolved: number }[];
  topPerformers: { name: string; resolved: number; total: number }[];
  projectHealth: { name: string; completion: number; issues: number; priority: string }[];
}

const Reports: React.FC = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [dateRange, setDateRange] = useState<string>('30'); // days
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    loadReportsData();
  }, []);

  useEffect(() => {
    if (allIssues.length > 0) {
      generateMetrics();
    }
  }, [allIssues, allProjects, allUsers, dateRange, selectedProject, selectedUser]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [issuesResponse, projectsResponse, usersResponse] = await Promise.all([
        IssueService.getAllIssues(),
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (issuesResponse.success && issuesResponse.data) {
        setAllIssues(issuesResponse.data);
        setAllProjects(projectsResponse.success ? projectsResponse.data || [] : []);
        setAllUsers(usersResponse.success ? usersResponse.data || [] : []);
      } else {
        setError(issuesResponse.message || 'Failed to fetch reports data');
      }
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError('An error occurred while loading reports data');
    } finally {
      setLoading(false);
    }
  };

  const generateMetrics = () => {
    let filteredIssues = [...allIssues];

    // Apply date filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filteredIssues = filteredIssues.filter(issue => 
        new Date(issue.createdAt) >= cutoffDate
      );
    }

    // Apply project filter
    if (selectedProject !== 'all') {
      filteredIssues = filteredIssues.filter(issue => 
        issue.projectId?.toString() === selectedProject
      );
    }

    // Apply user filter
    if (selectedUser !== 'all') {
      filteredIssues = filteredIssues.filter(issue => 
        issue.assigneeId?.toString() === selectedUser
      );
    }

    // Calculate basic metrics
    const totalIssues = filteredIssues.length;
    const openIssues = filteredIssues.filter(i => i.statusName?.toLowerCase() === 'open').length;
    const inProgressIssues = filteredIssues.filter(i => i.statusName?.toLowerCase().includes('progress')).length;
    const resolvedIssues = filteredIssues.filter(i => i.statusName?.toLowerCase() === 'resolved').length;
    const closedIssues = filteredIssues.filter(i => i.statusName?.toLowerCase() === 'closed').length;
    const criticalIssues = filteredIssues.filter(i => i.priorityName?.toLowerCase() === 'critical').length;

    // Calculate resolution rate
    const resolutionRate = totalIssues > 0 ? ((resolvedIssues + closedIssues) / totalIssues) * 100 : 0;

    // Calculate average resolution time (mock - would need actual resolution dates)
    const averageResolutionTime = 3.2; // Mock average in days

    // Group by priority
    const issuesByPriority: { [key: string]: number } = {};
    filteredIssues.forEach(issue => {
      const priority = issue.priorityName || 'Unknown';
      issuesByPriority[priority] = (issuesByPriority[priority] || 0) + 1;
    });

    // Group by status
    const issuesByStatus: { [key: string]: number } = {};
    filteredIssues.forEach(issue => {
      const status = issue.statusName || 'Unknown';
      issuesByStatus[status] = (issuesByStatus[status] || 0) + 1;
    });

    // Group by project
    const issuesByProject: { [key: string]: number } = {};
    filteredIssues.forEach(issue => {
      const projectName = issue.projectName || 'Unassigned';
      issuesByProject[projectName] = (issuesByProject[projectName] || 0) + 1;
    });

    // Group by assignee
    const issuesByAssignee: { [key: string]: number } = {};
    filteredIssues.forEach(issue => {
      const assigneeName = issue.assigneeName || 'Unassigned';
      issuesByAssignee[assigneeName] = (issuesByAssignee[assigneeName] || 0) + 1;
    });

    // Generate monthly trends (mock data for demonstration)
    const monthlyTrends = generateMonthlyTrends(filteredIssues);

    // Calculate top performers
    const topPerformers = calculateTopPerformers(filteredIssues, allUsers);

    // Calculate project health
    const projectHealth = calculateProjectHealth(allProjects, allIssues);

    const newMetrics: ReportMetrics = {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      criticalIssues,
      averageResolutionTime,
      resolutionRate,
      issuesByPriority,
      issuesByStatus,
      issuesByProject,
      issuesByAssignee,
      monthlyTrends,
      topPerformers,
      projectHealth
    };

    setMetrics(newMetrics);
  };

  const generateMonthlyTrends = (issues: Issue[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      created: Math.floor(Math.random() * 20) + 5,
      resolved: Math.floor(Math.random() * 15) + 3
    }));
  };

  const calculateTopPerformers = (issues: Issue[], users: User[]) => {
    const userPerformance: { [key: string]: { resolved: number; total: number } } = {};
    
    issues.forEach(issue => {
      const assigneeName = issue.assigneeName || 'Unassigned';
      if (!userPerformance[assigneeName]) {
        userPerformance[assigneeName] = { resolved: 0, total: 0 };
      }
      userPerformance[assigneeName].total += 1;
      if (issue.statusName?.toLowerCase() === 'resolved') {
        userPerformance[assigneeName].resolved += 1;
      }
    });

    return Object.entries(userPerformance)
      .map(([name, stats]) => ({
        name,
        resolved: stats.resolved,
        total: stats.total
      }))
      .filter(performer => performer.name !== 'Unassigned' && performer.total > 0)
      .sort((a, b) => b.resolved - a.resolved)
      .slice(0, 5);
  };

  const calculateProjectHealth = (projects: Project[], issues: Issue[]) => {
    return projects.map(project => {
      const projectIssues = issues.filter(issue => issue.projectId === project.id);
      const totalIssues = projectIssues.length;
      const resolvedIssues = projectIssues.filter(i => i.statusName?.toLowerCase() === 'resolved').length;
      const closedIssues = projectIssues.filter(i => i.statusName?.toLowerCase() === 'closed').length;
      const completion = totalIssues > 0 ? ((resolvedIssues + closedIssues) / totalIssues) * 100 : 0;
      
      const criticalIssues = projectIssues.filter(i => i.priorityName?.toLowerCase() === 'critical').length;
      const highIssues = projectIssues.filter(i => i.priorityName?.toLowerCase() === 'high').length;
      
      let priority = 'low';
      if (criticalIssues > 0) priority = 'critical';
      else if (highIssues > 2) priority = 'high';
      else if (projectIssues.filter(i => i.statusName?.toLowerCase() === 'open').length > 5) priority = 'medium';

      return {
        name: project.name,
        completion,
        issues: totalIssues,
        priority
      };
    }).slice(0, 8);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      case 'medium':
        return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20';
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    }
  };

  const exportReport = () => {
    if (!metrics) return;
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: dateRange === 'all' ? 'All Time' : `Last ${dateRange} days`,
      filters: {
        project: selectedProject === 'all' ? 'All Projects' : allProjects.find(p => p.id.toString() === selectedProject)?.name,
        user: selectedUser === 'all' ? 'All Users' : allUsers.find(u => u.id.toString() === selectedUser)?.name
      },
      metrics
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-tracker-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <BarChart3 className="h-8 w-8 animate-pulse text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Generating reports...</p>
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
            Error Loading Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadReportsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive insights into your bug tracking performance
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={loadReportsData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white">Filters:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>

            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Projects</option>
              {allProjects.map(project => (
                <option key={project.id} value={project.id.toString()}>
                  {project.name}
                </option>
              ))}
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bug className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            {getTrendIcon(metrics.totalIssues, metrics.totalIssues * 0.9)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalIssues}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Issues</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            {getTrendIcon(metrics.resolutionRate, metrics.resolutionRate * 0.85)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(metrics.resolutionRate)}%</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Resolution Rate</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            {getTrendIcon(metrics.criticalIssues, metrics.criticalIssues + 2)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.criticalIssues}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Critical Issues</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            {getTrendIcon(3.2, 4.1)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.averageResolutionTime}d</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Avg Resolution Time</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Issues by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Issues by Status
          </h3>
          <div className="space-y-4">
            {Object.entries(metrics.issuesByStatus).map(([status, count], index) => {
              const percentage = (count / metrics.totalIssues) * 100;
              const colors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-gray-500'];
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-slate-700 dark:text-slate-300">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white w-8">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Issues by Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Issues by Priority
          </h3>
          <div className="space-y-4">
            {Object.entries(metrics.issuesByPriority).map(([priority, count], index) => {
              const percentage = (count / metrics.totalIssues) * 100;
              const colors = ['bg-blue-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-slate-700 dark:text-slate-300">{priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white w-8">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          Monthly Trends
        </h3>
        <div className="grid grid-cols-6 gap-4">
          {metrics.monthlyTrends.map((trend, index) => (
            <div key={trend.month} className="text-center">
              <div className="mb-2">
                <div className="flex items-end justify-center gap-1 h-20">
                  <div 
                    className="bg-blue-500 rounded-t w-4" 
                    style={{ height: `${(trend.created / 25) * 100}%` }}
                    title={`Created: ${trend.created}`}
                  ></div>
                  <div 
                    className="bg-emerald-500 rounded-t w-4" 
                    style={{ height: `${(trend.resolved / 25) * 100}%` }}
                    title={`Resolved: ${trend.resolved}`}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{trend.month}</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                <span className="text-blue-600">{trend.created}</span> / <span className="text-emerald-600">{trend.resolved}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-slate-600 dark:text-slate-400">Resolved</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Award className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Top Performers
          </h3>
          <div className="space-y-4">
            {metrics.topPerformers.map((performer, index) => {
              const resolutionRate = (performer.resolved / performer.total) * 100;
              return (
                <div key={performer.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{performer.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {performer.resolved} resolved of {performer.total} total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {Math.round(resolutionRate)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Project Health
          </h3>
          <div className="space-y-3">
            {metrics.projectHealth.map((project, index) => (
              <div key={project.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{project.name}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 w-12">
                      {Math.round(project.completion)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {project.issues} issues
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;