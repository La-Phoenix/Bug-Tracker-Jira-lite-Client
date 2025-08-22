import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Grid3X3,
  List,
  ChevronDown,
  AlertCircle,
  Calendar,
  Users,
  Bug,
  Archive,
  CheckCircle,
  Clock,
  Target,
  Folder,
  User
} from 'lucide-react';
import { ProjectService } from '../services/ProjectService';
import { IssueService } from '../services/IssueServices';
import { UserService } from '../services/UserService';
import { ProjectsSkeleton } from '../components/Skeleton';
import type { Project } from '../types/interface';
import { useAuth } from '../contexts/AuthContext';

interface ProjectWithStats extends Project {
  issueCount: number;
  openIssuesCount: number;
  closedIssuesCount: number;
  memberCount: number;
  completionRate: number;
  lastActivity?: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  totalIssues: number;
  totalMembers: number;
}

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [viewingProject, setViewingProject] = useState<ProjectWithStats | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);
  // const [isDeleting, setIsDeleting] = useState(false);

  console.log(isCreateModalOpen, editingProject, viewingProject, deletingProject)

  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    archivedProjects: 0,
    totalIssues: 0,
    totalMembers: 0
  });

  useEffect(() => {
    loadProjectsData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, sortBy]);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [projectsResponse, issuesResponse, usersResponse] = await Promise.all([
        ProjectService.getAllProjects(),
        IssueService.getUserProjectsIssues().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        const rawProjects = projectsResponse.data;
        const issues = issuesResponse.success ? issuesResponse.data || [] : [];
        const users = usersResponse.success ? usersResponse.data || [] : [];

        // Calculate stats for each project
        const projectsWithStats: ProjectWithStats[] = rawProjects.map(project => {
          const projectIssues = issues.filter(issue => 
            issue.projectId === project.id || issue.projectName === project.name
          );
          
          const openIssues = projectIssues.filter(issue => 
            issue.statusName?.toLowerCase() !== 'closed' && 
            issue.statusName?.toLowerCase() !== 'resolved'
          );

          const closedIssues = projectIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'closed' || 
            issue.statusName?.toLowerCase() === 'resolved'
          );

          const completionRate = projectIssues.length > 0 
            ? Math.round((closedIssues.length / projectIssues.length) * 100)
            : 0;

          // Determine project status based on completion rate and activity
          let status: 'active' | 'inactive' | 'completed' | 'archived' = 'active';
          const lastUpdate = new Date(project.updatedAt as string);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

          if (completionRate === 100) {
            status = 'completed';
          } else if (lastUpdate < thirtyDaysAgo && openIssues.length === 0) {
            status = 'archived';
          } else if (lastUpdate < thirtyDaysAgo) {
            status = 'inactive';
          }

          // Find last activity
          const sortedIssues = projectIssues.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          const lastActivity = sortedIssues.length > 0 
            ? sortedIssues[0].updatedAt 
            : project.updatedAt as string;

          // Mock member count (in real app, this would come from project members API)
          const memberCount = Math.min(users.length, Math.floor(Math.random() * 5) + 1);

          return {
            ...project,
            issueCount: projectIssues.length,
            openIssuesCount: openIssues.length,
            closedIssuesCount: closedIssues.length,
            memberCount,
            completionRate,
            lastActivity,
            status
          };
        });

        setProjects(projectsWithStats);

        // Calculate overall stats
        const projectStats: ProjectStats = {
          totalProjects: projectsWithStats.length,
          activeProjects: projectsWithStats.filter(p => p.status === 'active').length,
          completedProjects: projectsWithStats.filter(p => p.status === 'completed').length,
          archivedProjects: projectsWithStats.filter(p => p.status === 'archived').length,
          totalIssues: issues.length,
          totalMembers: users.length
        };

        setStats(projectStats);
      } else {
        setError(projectsResponse.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError('An error occurred while loading projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime();
        case 'updated':
          return new Date(b.lastActivity || b.updatedAt as string).getTime() - 
                 new Date(a.lastActivity || a.updatedAt as string).getTime();
        case 'issues':
          return b.issueCount - a.issueCount;
        case 'completion':
          return b.completionRate - a.completionRate;
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  // const handleDeleteProject = async (projectId: number) => {
  //   try {
  //     setIsDeleting(true);
  //     const response = await ProjectService.deleteProject(projectId);
      
  //     if (response.success) {
  //       setProjects(prev => prev.filter(project => project.id !== projectId));
  //       setSelectedProjects(prev => prev.filter(id => id !== projectId));
  //       setDeletingProject(null);
  //     } else {
  //       alert(response.message || 'Failed to delete project');
  //     }
  //   } catch (err: any) {
  //     console.error('Error deleting project:', err);
  //     alert('An error occurred while deleting the project');
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProjects.length} projects?`)) return;

    try {
      // await Promise.all(selectedProjects.map(id => ProjectService.deleteProject(id)));
      // setProjects(prev => prev.filter(project => !selectedProjects.includes(project.id)));
      // setSelectedProjects([]);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('Some projects could not be deleted');
    }
  };

  const handleSelectProject = (projectId: number) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(project => project.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Active' },
      inactive: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Inactive' },
      completed: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Completed' },
      archived: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Archived' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  // Action buttons component
  const ActionButtons: React.FC<{ project: ProjectWithStats; className?: string }> = ({ 
    project, 
    className = "" 
  }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        onClick={() => setViewingProject(project)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
      {
        user?.role === "Admin" && (
          <>
          <button 
            onClick={() => setEditingProject(project)}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            title="Edit project"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDeletingProject(project)}
            className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          </>
        )
      }
    </div>
  );

  if (loading) {
    return <ProjectsSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Projects
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadProjectsData}
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
              <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage and organize your projects
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadProjectsData}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:inline">Refresh</span>
            </button>
            {
              user?.role === "Admin" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Project</span>
                </button>
              )
            }
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.activeProjects}</span> active
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.activeProjects}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In progress
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.completedProjects}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Successfully finished
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalIssues}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Issues</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                <Bug className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Across all projects
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
                    placeholder="Search projects..."
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
                {(statusFilter !== 'all' || sortBy !== 'updated') && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {(statusFilter !== 'all' ? 1 : 0) + (sortBy !== 'updated' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="updated">Last Updated</option>
                    <option value="name">Name</option>
                    <option value="created">Created Date</option>
                    <option value="issues">Issue Count</option>
                    <option value="completion">Completion</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Grid view"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Dropdown */}
          {showFilters && (
            <div className="sm:hidden border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="updated">Last Updated</option>
                    <option value="name">Name</option>
                    <option value="created">Created Date</option>
                    <option value="issues">Issue Count</option>
                    <option value="completion">Completion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">View</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{filteredProjects.length}</span> of <span className="font-medium">{projects.length}</span> projects
            </p>
            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{selectedProjects.length}</span> selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                      <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(project.status)}
                        {getStatusBadge(project.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {
                      user?.role === "Admin" && (
                        <div className="relative group">
                          <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <ActionButtons project={project} className="flex-col p-2 gap-0" />
                          </div>
                        </div>
                      )
                    }
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">{project.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Bug className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{project.issueCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{project.memberCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 dark:text-green-400">{project.openIssuesCount} open</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">{project.closedIssuesCount} closed</span>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(project.memberCount, 4) }).map((_, index) => (
                      <div key={index} className="w-7 h-7 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    ))}
                    {project.memberCount > 4 && (
                      <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          +{project.memberCount - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated {formatDate(project.lastActivity || project.updatedAt as string)}</span>
                  </div>
                  <div className="flex gap-1">
                    <ActionButtons project={project} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 grid grid-cols-6 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="col-span-2">Project</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Issues</div>
                  <div className="col-span-1">Progress</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map((project) => (
                <div key={project.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => handleSelectProject(project.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded">
                            <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                            {project.name}
                          </h3>
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          {getStatusIcon(project.status)}
                          {getStatusBadge(project.status)}
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">{project.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.completionRate}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Bug className="h-3 w-3" />
                            <span>{project.issueCount} issues</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{project.memberCount} members</span>
                          </div>
                          <span>•</span>
                          <span>{project.openIssuesCount} open</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Updated {formatDate(project.lastActivity || project.updatedAt as string)}</span>
                        </div>
                      </div>
                      <ActionButtons project={project} />
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleSelectProject(project.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4 grid grid-cols-6 gap-4 w-full">
                      {/* Project */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                            <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {project.name}
                            </p>
                            {project.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {project.memberCount} members
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Updated {formatDate(project.lastActivity || project.updatedAt as string)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1 flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {getStatusBadge(project.status)}
                      </div>

                      {/* Issues */}
                      <div className="col-span-1 flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">{project.issueCount}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {project.openIssuesCount} open
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="col-span-1 flex items-center">
                        <div className="w-full">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{project.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${project.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center">
                        <ActionButtons project={project} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <FolderOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first project'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;