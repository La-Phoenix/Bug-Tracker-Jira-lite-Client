import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Calendar,
  User,
  AlertCircle,
  Bug,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Filter,
  RotateCcw
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { useAuth } from '../contexts/AuthContext';
import type { Issue, Project } from '../types/interface';
import { IssueLabels } from '../components/IssueLabels';
import { LabelFilter } from '../components/LabelFilter';
import { IssuesSkeleton } from '../components/Skeleton';
import { CreateEditIssue } from '../components/create_edit_modal';
import { ViewIssue } from '../components/viewIssue';
import { useSearchParams } from 'react-router-dom';
import { ProjectService } from '../services/ProjectService';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

const Issues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);

  // Modal states
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('created_desc');

  const { user } = useAuth();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const shouldOpenCreate = searchParams.get('create') === 'true';
    
    if (shouldOpenCreate && !loading) {
      handleCreateIssue();
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, loading]);

  useEffect(() => {
    filterAndSortIssues();
  }, [issues, searchTerm, selectedStatus, selectedPriority, selectedProject, selectedLabelIds, sortBy]);

  const fetchInitialData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // Fetch both issues and projects
      const [issuesResponse, projectsResponse] = await Promise.all([
        IssueService.getUserProjectsIssues(),
        ProjectService.getAllProjects()
      ]);
      
      if (issuesResponse.success && Array.isArray(issuesResponse.data)) {
        setIssues(issuesResponse.data);
      } else {
        setError(issuesResponse.message || 'Failed to fetch issues');
      }

      // Set projects for filtering
      if (projectsResponse.success && Array.isArray(projectsResponse.data)) {
        setProjects(projectsResponse.data);
      }
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchInitialData(true);
  };

  const handleViewIssue = (issue: Issue) => {
    setViewingIssue(issue);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setViewingIssue(null);
  };

  const handleEditFromView = (issue: Issue) => {
    setViewingIssue(null);
    setIsViewModalOpen(false);
    setTimeout(() => {
      setEditingIssue(issue);
      setIsCreateEditModalOpen(true);
    }, 100);
  };

  const handleDeleteIssue = (issue: Issue) => {
    setDeletingIssue(issue);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFromView = (issue: Issue) => {
    setViewingIssue(null);
    setIsViewModalOpen(false);
    setTimeout(() => {
      setDeletingIssue(issue);
      setIsDeleteModalOpen(true);
    }, 100);
  };

  const filterAndSortIssues = () => {
    let filtered = [...issues];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.title?.toLowerCase().includes(search) ||
        issue.description?.toLowerCase().includes(search) ||
        issue.projectName?.toLowerCase().includes(search) ||
        (issue.labels && issue.labels.some(label => 
          label.name.toLowerCase().includes(search)
        ))
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(issue => 
        issue.statusName?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(issue => 
        issue.priorityName?.toLowerCase() === selectedPriority.toLowerCase()
      );
    }

    if (selectedProject !== 'all') {
      filtered = filtered.filter(issue => 
        issue.projectId?.toString() === selectedProject
      );
    }

    if (selectedLabelIds.length > 0) {
      filtered = filtered.filter(issue => 
        issue.labels && issue.labels.some(label => 
          selectedLabelIds.includes(label.id)
        )
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'created_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'updated_desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'updated_asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'project':
          return (a.projectName || '').localeCompare(b.projectName || '');
        case 'priority':
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          const aPriority = priorityOrder[a.priorityName?.toLowerCase() as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priorityName?.toLowerCase() as keyof typeof priorityOrder] || 0;
          return bPriority - aPriority;
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  };

  const handleCreateIssue = () => {
    setEditingIssue(null);
    setIsCreateEditModalOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsCreateEditModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingIssue) return;

    try {
      setIsDeleting(true);
      const result = await IssueService.deleteIssue(deletingIssue.id);
      
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDeletingIssue(null);
        
        setError('');
        
        await fetchInitialData(true);
      } else {
        setError(result.message || 'Failed to delete issue');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the issue');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setIsDeleteModalOpen(false);
    setDeletingIssue(null);
  };

  const handleIssueModalClose = async (shouldRefresh?: boolean) => {
    setIsCreateEditModalOpen(false);
    setEditingIssue(null);
    
    if (shouldRefresh) {
      await fetchInitialData(true);
    }
  };

  const canEditDeleteIssue = (issue: Issue): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return issue.reporterId === user.id;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
      case 'open':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bug className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedProject('all');
    setSelectedLabelIds([]);
    setSortBy('created_desc');
  };

  const hasActiveFilters = searchTerm || selectedStatus !== 'all' || 
    selectedPriority !== 'all' || selectedProject !== 'all' || selectedLabelIds.length > 0;

  if (loading || refreshing) {
    return <IssuesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Issues
              </h1>
              {refreshing && (
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
              )}
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track and manage project issues
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters {hasActiveFilters && <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{(searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (selectedProject !== 'all' ? 1 : 0) + (selectedLabelIds.length > 0 ? 1 : 0)}</span>}
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              title="Refresh issues"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={handleCreateIssue}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Issue</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Filters - Responsive */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 transition-all duration-300 ${showFilters || window.innerWidth >= 640 ? 'block' : 'hidden'} sm:block`}>
          <div className="p-4 sm:p-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search issues, projects, and labels..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Project Filter */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id.toString()}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <option value="all">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                <option value="created_desc">Newest First</option>
                <option value="created_asc">Oldest First</option>
                <option value="updated_desc">Recently Updated</option>
                <option value="updated_asc">Least Recently Updated</option>
                <option value="title_asc">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
                <option value="priority">Priority High to Low</option>
                <option value="project">Project A-Z</option>
              </select>
            </div>

            {/* Label Filter & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <LabelFilter
                  selectedLabelIds={selectedLabelIds}
                  onFilterChange={setSelectedLabelIds}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 whitespace-nowrap"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredIssues.length} of {issues.length} issues
              {hasActiveFilters && ' (filtered)'}
            </p>
            
            {/* Show active project filter */}
            {selectedProject !== 'all' && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                {projects.find(p => p.id.toString() === selectedProject)?.name}
              </span>
            )}
          </div>
          
          {/* Mobile View Mode Toggle */}
          <div className="flex sm:hidden items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Issues Display */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-2">
              {hasActiveFilters ? 'No issues match your filters' : 'No issues found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-4 text-sm sm:text-base">
              {hasActiveFilters ? 'Try adjusting your search criteria' : 'Create your first issue to get started'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Grid/List View */
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
              : 'space-y-4'
          }>
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 ${
                  viewMode === 'grid' 
                    ? 'p-4 sm:p-6 h-fit' 
                    : 'p-4 sm:p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  /* Grid Card Layout */
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getStatusIcon(issue.statusName || '')}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          #{issue.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleViewIssue(issue)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="View issue"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEditDeleteIssue(issue) && (
                          <>
                            <button
                              onClick={() => handleEditIssue(issue)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Edit issue"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIssue(issue)}
                              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete issue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-2">
                        {issue.title}
                      </h3>
                      {issue.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {issue.description}
                        </p>
                      )}
                    </div>

                    {/* Labels */}
                    {issue.labels && issue.labels.length > 0 && (
                      <IssueLabels 
                        labels={issue.labels} 
                        maxVisible={2}
                      />
                    )}

                    {/* Priority & Status */}
                    <div className="flex flex-col gap-2">
                      {issue.priorityName && (
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(issue.priorityName)} self-start`}>
                          {issue.priorityName}
                        </span>
                      )}
                      
                      {issue.statusName && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {issue.statusName}
                        </span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      {issue.assigneeName && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="truncate">{issue.assigneeName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                      
                      {issue.projectName && (
                        <div className="text-blue-600 dark:text-blue-400 font-medium truncate">
                          {issue.projectName}
                        </div>
                      )}

                      {issue.reporterName && (
                        <div className="truncate">
                          by {issue.reporterName}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* List Layout */
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(issue.statusName || '')}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {issue.title}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                          #{issue.id}
                        </span>
                      </div>
                      
                      {issue.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {issue.description}
                        </p>
                      )}

                      <IssueLabels 
                        labels={issue.labels || []} 
                        maxVisible={5}
                        className="mb-3"
                      />

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {issue.priorityName && (
                          <span className={`px-2 py-1 rounded border ${getPriorityColor(issue.priorityName)}`}>
                            {issue.priorityName}
                          </span>
                        )}
                        
                        {issue.statusName && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-current"></span>
                            {issue.statusName}
                          </span>
                        )}
                        
                        {issue.assigneeName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{issue.assigneeName}</span>
                            <span className="sm:hidden">{issue.assigneeName.split(' ')[0]}</span>
                          </span>
                        )}
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        
                        {issue.projectName && (
                          <span className="text-blue-600 dark:text-blue-400 hidden sm:inline">
                            {issue.projectName}
                          </span>
                        )}

                        {issue.reporterName && (
                          <span className="text-gray-500 dark:text-gray-400 hidden lg:inline">
                            by {issue.reporterName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View issue"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {canEditDeleteIssue(issue) && (
                        <>
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Edit issue"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete issue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Issue"
        itemName={deletingIssue?.title || ''}
        itemType="issue"
        description="This issue will be permanently removed along with any comments and attachments."
        isDeleting={isDeleting}
      />

      {/* Other Modals */}
      {isViewModalOpen && viewingIssue && (
        <ViewIssue
          issue={viewingIssue}
          onClose={handleViewModalClose}
          onEdit={handleEditFromView}
          onDelete={handleDeleteFromView}
        />
      )}

      {isCreateEditModalOpen && (
        <CreateEditIssue
          issue={editingIssue}
          onClose={handleIssueModalClose}
        />
      )}
    </div>
  );
};

export default Issues;