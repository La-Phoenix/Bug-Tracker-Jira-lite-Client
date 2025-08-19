import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Eye,
  Edit3,
  Trash2,
  Loader,
  RefreshCw
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { StatusService } from '../services/StatusService';
import { PriorityService } from '../services/PriorityService';
import type { Issue, Status, Priority } from '../types/interface';
import { IssueModal } from '../components/create_edit_modal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { IssueDetailModal } from '../components/IssueDetailModal';

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
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
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
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      const response = await IssueService.deleteIssue(issueId);
      if (response.success) {
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
        setSelectedIssues(prev => prev.filter(id => id !== issueId));
      } else {
        alert(response.message || 'Failed to delete issue');
      }
    } catch (err: any) {
      console.error('Error deleting issue:', err);
      alert('An error occurred while deleting the issue');
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading issues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
            Error Loading Issues
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bug className="h-8 w-8 text-blue-600" />
            Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage all project issues
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Issue
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 dark:text-white"
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
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 dark:text-white"
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
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Results count and bulk actions */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredIssues.length} of {issues.length} issues
          </p>
          {selectedIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIssues.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Issues List/Cards */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIssues.length === filteredIssues.length && filteredIssues.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="ml-4 grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <div className="col-span-4">Issue</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-1">Updated</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIssues.includes(issue.id)}
                    onChange={() => handleSelectIssue(issue.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 grid grid-cols-12 gap-4 w-full">
                    {/* Issue */}
                    <div className="col-span-4">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(issue.statusName)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            #{issue.id} • {issue.projectName || 'No Project'}
                          </p>
                          {issue.labels && issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
                                  +{issue.labels.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {issue.statusName || 'Unknown'}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(issue.priorityName)}`}>
                        {issue.priorityName || 'Unknown'}
                      </span>
                    </div>

                    {/* Assignee */}
                    <div className="col-span-2">
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

                    {/* Updated */}
                    <div className="col-span-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(issue.updatedAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handleViewIssue(issue)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleEditIssue(issue)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(issue)}
                            className="p-1 text-gray-400 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Card View - keeping the same structure with edit functionality */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Card content with edit functionality */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(issue.statusName)}
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{issue.id}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedIssues.includes(issue.id)}
                    onChange={() => handleSelectIssue(issue.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                {issue.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {issue.description}
              </p>

              {issue.labels && issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {issue.labels.slice(0, 2).map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(issue.priorityName)}`}>
                    {issue.priorityName || 'Unknown'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {issue.statusName || 'Unknown'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                    <button 
                    onClick={() => handleViewIssue(issue)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                    <Eye className="h-4 w-4" />
                    </button>
                    <button 
                    onClick={() => handleEditIssue(issue)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                    <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                    onClick={() => handleDeleteClick(issue)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    >
                    <Trash2 className="h-4 w-4" />
                    </button>
                </div>

              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  {issue.assigneeId ? (
                    <>
                      <User className="h-3 w-3" />
                      <span>{issue.assigneeName}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No issues found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first issue'}
          </p>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
  );
};

export default Issues;