import { useState, useEffect } from 'react';
import { 
  Bug, 
  Plus, 
  Search, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  MoreVertical
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { StatusService } from '../services/StatusService';
import { PriorityService } from '../services/PriorityService';
import type { Issue, Status, Priority } from '../types/interface';
import { IssueModal } from '../components/create_edit_modal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { IssuesSkeleton } from '../components/Skeleton';

const Issues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedIssues, setSelectedIssues] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [viewingIssue, setViewingIssue] = useState<Issue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dropdown data
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);

  // Load initial data
  useEffect(() => {
    loadData();
    loadDropdownData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await IssueService.getAllIssues();
      
      if (response.success && response.data) {
        setIssues(response.data);
        setFilteredIssues(response.data);
      } else {
        setError(response.message || 'Failed to fetch issues');
      }
    } catch (err: any) {
      console.error('Error fetching issues:', err);
      setError('An error occurred while fetching issues');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [statusesRes, prioritiesRes] = await Promise.all([
        StatusService.getAllStatuses(),
        PriorityService.getAllPriorities()
      ]);

      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (prioritiesRes.success) setPriorities(prioritiesRes.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  // Filter issues
  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.labels && issue.labels.some(label => 
          label.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.statusName?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.priorityName?.toLowerCase() === priorityFilter.toLowerCase());
    }

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, priorityFilter]);

  const handleViewIssue = (issue: Issue) => {
    setViewingIssue(issue);
  };

  const handleDeleteClick = (issue: Issue) => {
    setDeletingIssue(issue);
  };

  const handleConfirmDelete = async () => {
    if (!deletingIssue) return;
    
    setIsDeleting(true);
    try {
      const response = await IssueService.deleteIssue(deletingIssue.id);
      if (response.success) {
        setIssues(prev => prev.filter(issue => issue.id !== deletingIssue.id));
        setSelectedIssues(prev => prev.filter(id => id !== deletingIssue.id));
        setDeletingIssue(null);
      } else {
        alert(response.message || 'Failed to delete issue');
      }
    } catch (err: any) {
      console.error('Error deleting issue:', err);
      alert('An error occurred while deleting the issue');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
      case 'in progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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

  const handleSelectIssue = (issueId: number) => {
    setSelectedIssues(prev =>
      prev.includes(issueId)
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIssues.length === filteredIssues.length) {
      setSelectedIssues([]);
    } else {
      setSelectedIssues(filteredIssues.map(issue => issue.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIssues.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIssues.length} issues?`)) return;

    try {
      await Promise.all(selectedIssues.map(id => IssueService.deleteIssue(id)));
      setIssues(prev => prev.filter(issue => !selectedIssues.includes(issue.id)));
      setSelectedIssues([]);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('Some issues could not be deleted');
    }
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
  };

  const handleModalSuccess = () => {
    loadData();
    setEditingIssue(null);
  };

  // Component for action buttons (mobile & desktop)
  const ActionButtons: React.FC<{ issue: Issue; className?: string }> = ({ issue, className = "" }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        onClick={() => handleViewIssue(issue)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button 
        onClick={() => handleEditIssue(issue)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        title="Edit issue"
      >
        <Edit3 className="h-4 w-4" />
      </button>
      <button 
        onClick={() => handleDeleteClick(issue)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete issue"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return <IssuesSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Issues
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadData}
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
              <Bug className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Issues
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Track and manage all project issues
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span>New Issue</span>
            </button>
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
                    placeholder="Search issues..."
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
                {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
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
                    {statuses.map((status) => (
                      <option key={status.id} value={status.name}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Priority</option>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.name}>
                        {priority.name}
                      </option>
                    ))}
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
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'card'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Card view"
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
                    {statuses.map((status) => (
                      <option key={status.id} value={status.name}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Priority</option>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.name}>
                        {priority.name}
                      </option>
                    ))}
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
                    onClick={() => setViewMode('card')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${
                      viewMode === 'card'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    Cards
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{filteredIssues.length}</span> of <span className="font-medium">{issues.length}</span> issues
            </p>
            {selectedIssues.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{selectedIssues.length}</span> selected
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
        {viewMode === 'list' ? (
          /* List View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden lg:block border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="col-span-5">Issue</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Priority</div>
                  <div className="col-span-2">Assignee</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Issues */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue.id)}
                        onChange={() => handleSelectIssue(issue.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(issue.statusName)}
                          <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-2">
                            {issue.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          #{issue.id} • {issue.projectName || 'No Project'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priorityName)}`}>
                            {issue.priorityName || 'Unknown'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {issue.statusName || 'Unknown'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            {issue.assigneeId ? (
                              <>
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-24">{issue.assigneeName}</span>
                              </>
                            ) : (
                              <span>Unassigned</span>
                            )}
                          </div>
                          <span>{formatDate(issue.updatedAt)}</span>
                        </div>
                      </div>
                      <ActionButtons issue={issue} />
                    </div>
                    
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="ml-6 flex flex-wrap gap-1">
                        {issue.labels.slice(0, 3).map((label) => (
                          <span
                            key={label.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          >
                            {label.name}
                          </span>
                        ))}
                        {issue.labels.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{issue.labels.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => handleSelectIssue(issue.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4 grid grid-cols-12 gap-4 w-full">
                      {/* Issue */}
                      <div className="col-span-5">
                        <div className="flex items-start gap-2">
                          {getStatusIcon(issue.statusName)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {issue.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              #{issue.id} • {issue.projectName || 'No Project'}
                            </p>
                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {issue.labels.slice(0, 2).map((label) => (
                                  <span
                                    key={label.id}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                  >
                                    {label.name}
                                  </span>
                                ))}
                                {issue.labels.length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{issue.labels.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {issue.statusName || 'Unknown'}
                        </span>
                      </div>

                      {/* Priority */}
                      <div className="col-span-2 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(issue.priorityName)}`}>
                          {issue.priorityName || 'Unknown'}
                        </span>
                      </div>

                      {/* Assignee */}
                      <div className="col-span-2 flex items-center">
                        {issue.assigneeId ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {issue.assigneeName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center">
                        <ActionButtons issue={issue} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.statusName)}
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      #{issue.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIssues.includes(issue.id)}
                      onChange={() => handleSelectIssue(issue.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <ActionButtons issue={issue} className="flex-col p-2 gap-0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                  {issue.title}
                </h3>

                {/* Description */}
                {issue.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {issue.description}
                  </p>
                )}

                {/* Labels */}
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {issue.labels.slice(0, 2).map((label) => (
                      <span
                        key={label.id}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {label.name}
                      </span>
                    ))}
                    {issue.labels.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                        +{issue.labels.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Status & Priority */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(issue.priorityName)}`}>
                    {issue.priorityName || 'Unknown'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {issue.statusName || 'Unknown'}
                  </span>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {issue.assigneeId ? (
                      <>
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-20">{issue.assigneeName}</span>
                      </>
                    ) : (
                      <span>Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(issue.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredIssues.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Bug className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No issues found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first issue'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Issue
              </button>
            )}
          </div>
        )}

        {/* Modals */}
        <IssueModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleModalSuccess}
        />

        <IssueModal
          isOpen={!!editingIssue}
          onClose={() => setEditingIssue(null)}
          onSuccess={handleModalSuccess}
          issue={editingIssue}
        />

        <IssueDetailModal
          isOpen={!!viewingIssue}
          onClose={() => setViewingIssue(null)}
          onEdit={(issue) => {
            setViewingIssue(null);
            setEditingIssue(issue);
          }}
          onDelete={(issue) => {
            setViewingIssue(null);
            setDeletingIssue(issue);
          }}
          issue={viewingIssue}
        />

        <DeleteConfirmModal
          isOpen={!!deletingIssue}
          onClose={() => setDeletingIssue(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Issue"
          message={`Are you sure you want to delete "${deletingIssue?.title}"? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default Issues;