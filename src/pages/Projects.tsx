import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Calendar,
  Users,
  Bug,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  Grid3X3,
  List,
  Star,
  Archive,
  Eye,
  Settings,
  GitBranch,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';
import { ProjectService } from '../services/ProjectService';
import { IssueService } from '../services/IssueServices';
import { UserService } from '../services/UserService';
import { Link } from 'react-router-dom';
import type { Project, Issue, User } from '../types/interface';

interface ProjectWithStats extends Project {
  totalIssues?: number;
  openIssues?: number;
  inProgressIssues?: number;
  resolvedIssues?: number;
  closedIssues?: number;
  teamMembers?: number;
  completionRate?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  lastActivity?: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithStats[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // View and selection
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjectsData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const loadProjectsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [projectsResponse, issuesResponse, usersResponse] = await Promise.all([
        ProjectService.getAllProjects(),
        IssueService.getAllIssues(),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      if (projectsResponse.success && projectsResponse.data) {
        const issues = issuesResponse.success ? issuesResponse.data || [] : [];
        const users = usersResponse.success ? usersResponse.data || [] : [];
        
        setAllIssues(issues);
        setAllUsers(users);
        
        // Enhance projects with statistics
        const enhancedProjects = projectsResponse.data.map(project => {
          const projectIssues = issues.filter(issue => issue.projectId === project.id);
          const openIssues = projectIssues.filter(issue => issue.statusName?.toLowerCase() === 'open').length;
          const inProgressIssues = projectIssues.filter(issue => issue.statusName?.toLowerCase().includes('progress')).length;
          const resolvedIssues = projectIssues.filter(issue => issue.statusName?.toLowerCase() === 'resolved').length;
          const closedIssues = projectIssues.filter(issue => issue.statusName?.toLowerCase() === 'closed').length;
          
          // Calculate completion rate
          const totalIssues = projectIssues.length;
          const completionRate = totalIssues > 0 ? ((resolvedIssues + closedIssues) / totalIssues) * 100 : 0;
          
          // Determine project priority based on open issues and urgency
          let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
          const criticalIssues = projectIssues.filter(issue => issue.priorityName?.toLowerCase() === 'critical').length;
          const highIssues = projectIssues.filter(issue => issue.priorityName?.toLowerCase() === 'high').length;
          
          if (criticalIssues > 0) priority = 'critical';
          else if (highIssues > 2 || openIssues > 10) priority = 'high';
          else if (openIssues > 5) priority = 'medium';
          
          // Get unique team members assigned to project issues
          const assignedUserIds = new Set(projectIssues.map(issue => issue.assigneeId).filter(Boolean));
          const teamMembers = assignedUserIds.size;
          
          // Find last activity
          const lastActivity = projectIssues.length > 0 
            ? projectIssues.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0]?.updatedAt || projectIssues[0]?.createdAt
            : project.updatedAt || project.createdAt;

          return {
            ...project,
            totalIssues,
            openIssues,
            inProgressIssues,
            resolvedIssues,
            closedIssues,
            teamMembers,
            completionRate,
            priority,
            lastActivity
          };
        });

        setProjects(enhancedProjects);
      } else {
        setError(projectsResponse.message || 'Failed to fetch projects data');
      }
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError('An error occurred while loading projects data');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (you can extend this based on your project status field)
    if (statusFilter !== 'all') {
      // This assumes projects have a status field - adjust based on your data structure
      filtered = filtered.filter(project => {
        if (statusFilter === 'active') return (project.openIssues || 0) > 0 || (project.inProgressIssues || 0) > 0;
        if (statusFilter === 'completed') return (project.completionRate || 0) >= 100;
        if (statusFilter === 'inactive') return (project.totalIssues || 0) === 0;
        return true;
      });
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
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

  const handleDeleteProject = async (project: ProjectWithStats) => {
    setDeletingProject(project);
  };

  const confirmDelete = async () => {
    // if (!deletingProject) return;
    
    // setIsDeleting(true);
    // try {
    //   const response = await ProjectService.deleteProject(deletingProject.id);
    //   if (response.success) {
    //     setProjects(prev => prev.filter(p => p.id !== deletingProject.id));
    //     setSelectedProjects(prev => prev.filter(id => id !== deletingProject.id));
    //     setDeletingProject(null);
    //   } else {
    //     alert(response.message || 'Failed to delete project');
    //   }
    // } catch (err: any) {
    //   console.error('Error deleting project:', err);
    //   alert('An error occurred while deleting the project');
    // } finally {
    //   setIsDeleting(false);
    // }
  };

  const getStatusColor = (project: ProjectWithStats) => {
    if ((project.completionRate || 0) >= 100) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
    } else if ((project.openIssues || 0) > 0 || (project.inProgressIssues || 0) > 0) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    } else if ((project.totalIssues || 0) === 0) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
  };

  const getStatusText = (project: ProjectWithStats) => {
    if ((project.completionRate || 0) >= 100) return 'Completed';
    if ((project.openIssues || 0) > 0 || (project.inProgressIssues || 0) > 0) return 'Active';
    if ((project.totalIssues || 0) === 0) return 'Planning';
    return 'On Hold';
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

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <TrendingUp className="h-4 w-4" />;
      case 'medium':
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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

  const getProjectInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading projects...</p>
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
            Error Loading Projects
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadProjectsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => (p.openIssues || 0) > 0 || (p.inProgressIssues || 0) > 0).length,
    completed: projects.filter(p => (p.completionRate || 0) >= 100).length,
    totalIssues: projects.reduce((sum, p) => sum + (p.totalIssues || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your development projects and track progress
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectStats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Projects</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectStats.active}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Projects</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectStats.completed}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{projectStats.totalIssues}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Issues</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Planning</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
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
        {selectedProjects.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              {selectedProjects.length} project(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Archive
              </button>
              <button className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                Change Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                    {getProjectInitials(project.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{project.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {project.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleSelectProject(project.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project)}`}>
                    {getStatusText(project)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Priority:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority || 'low')}`}>
                    {getPriorityIcon(project.priority || 'low')}
                    {(project.priority || 'Low').charAt(0).toUpperCase() + (project.priority || 'low').slice(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {Math.round(project.completionRate || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                  <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-2">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{project.totalIssues || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Issues</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{project.teamMembers || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Members</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-gray-700">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <button
                  onClick={() => setEditingProject(project)}
                  className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-gray-600 rounded-lg hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteProject(project)}
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
                checked={selectedProjects.length === filteredProjects.length}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
              />
              <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1">Issues</div>
                <div className="col-span-2">Last Activity</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {filteredProjects.map((project) => (
              <div key={project.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleSelectProject(project.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
                  />
                  <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {getProjectInitials(project.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{project.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project)}`}>
                        {getStatusText(project)}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority || 'low')}`}>
                        {getPriorityIcon(project.priority || 'low')}
                        {(project.priority || 'Low').charAt(0).toUpperCase() + (project.priority || 'low').slice(1)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {Math.round(project.completionRate || 0)}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{project.totalIssues || 0}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({project.openIssues || 0} open)
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(project.lastActivity || project.createdAt as string)}
                      </p>
                    </div>
                    <div className="col-span-1 flex items-center gap-1">
                      <Link
                        to={`/projects/${project.id}`}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setEditingProject(project)}
                        className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
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
      {filteredProjects.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-12 text-center">
          <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start organizing your work by creating your first project'}
          </p>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md mx-4 border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delete Project
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Are you sure you want to delete <strong>{deletingProject.name}</strong>? 
                This will also remove all associated issues and cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingProject(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;