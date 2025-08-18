import React, { useState, useEffect } from 'react';
import type { CreateIssueRequest, Issue, Priority, Project, Status, User, UpdateIssueRequest } from '../types/interface';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { StatusService } from '../services/StatusService';
import { PriorityService } from '../services/PriorityService';
import { IssuesGridSkeleton, StatsGridSkeleton } from '../components/IssueCardSkeleton';
import { IssueCard } from '../components/IssueCard';
import { CreateIssueModal } from '../components/IssueModal';
import { EditIssueModal } from '../components/EditIssueModal';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

const Dashboard: React.FC = () => {
  // Issues state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [referenceDataLoading, setReferenceDataLoading] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [reporterFilter, setReporterFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load reference data on component mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Load issues after reference data is loaded
  useEffect(() => {
    if (!referenceDataLoading) {
      loadIssues(true);
    }
  }, [referenceDataLoading]);

  // Apply filters whenever issues or filter states change
  useEffect(() => {
    applyFilters();
  }, [issues, statusFilter, priorityFilter, assigneeFilter, reporterFilter, searchTerm]);

  const loadReferenceData = async () => {
    try {
      setReferenceDataLoading(true);
      setError(null);

      // Load all reference data in parallel
      const [projectsRes, usersRes, statusesRes, prioritiesRes] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers(),
        StatusService.getAllStatuses(),
        PriorityService.getAllPriorities()
      ]);

      // Handle projects
      if (projectsRes.success && Array.isArray(projectsRes.data)) {
        setProjects(projectsRes.data);
      } else {
        console.warn('Failed to load projects:', projectsRes.message);
      }

      // Handle users
      if (usersRes.success && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      } else {
        console.warn('Failed to load users:', usersRes.message);
      }

      // Handle statuses
      if (statusesRes.success && Array.isArray(statusesRes.data)) {
        setStatuses(statusesRes.data);
      } else {
        console.warn('Failed to load statuses:', statusesRes.message);
      }

      // Handle priorities
      if (prioritiesRes.success && Array.isArray(prioritiesRes.data)) {
        setPriorities(prioritiesRes.data);
      } else {
        console.warn('Failed to load priorities:', prioritiesRes.message);
      }

    } catch (err: any) {
      console.error('Error loading reference data:', err);
      setError('Failed to load reference data. Some features may not work properly.');
    } finally {
      setReferenceDataLoading(false);
    }
  };

  const loadIssues = async (isInitial = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await IssueService.getAllIssues();
      console.log('Issues response:', response);
      
      if (response.success && Array.isArray(response.data)) {
        setIssues(response.data);
        console.log('Issues set:', response.data);
      } else {
        console.warn('Unexpected response structure:', response);
        setError(response.message || 'Failed to load issues - unexpected response format');
        setIssues([]);
      }
    } catch (err: any) {
      console.error('Error loading issues:', err);
      setError(err.message || 'Failed to load issues');
      setIssues([]);
    } finally {
      setLoading(false);
      if (isInitial) {
        setInitialLoad(false);
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (statusFilter) {
      filtered = filtered.filter(issue => 
        issue.statusName.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter(issue => 
        issue.priorityName.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    if (assigneeFilter) {
      if (assigneeFilter === '') {
        // Show unassigned issues
        filtered = filtered.filter(issue => !issue.assigneeName);
      } else {
        filtered = filtered.filter(issue => 
          issue.assigneeName?.toLowerCase() === assigneeFilter.toLowerCase()
        );
      }
    }

    if (reporterFilter) {
      filtered = filtered.filter(issue => 
        issue.reporterName.toLowerCase() === reporterFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredIssues(filtered);
  };

  const handleCreateIssue = async (issueData: CreateIssueRequest) => {
    try {
      setCreateLoading(true);
      const response = await IssueService.createIssue(issueData);
      
      if (response.success) {
        setIssues(prev => [response.data, ...prev]);
        setIsCreateModalOpen(false);
      } else {
        throw new Error(response.message || 'Failed to create issue');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
      console.error('Error creating issue:', err);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditIssue = (issue: Issue) => {
    setIssueToEdit(issue);
    setShowEditModal(true);
    setShowDetailModal(false); // Close detail modal if open
  };

  const handleUpdateIssue = async (issueData: UpdateIssueRequest) => {
    try {
      setEditLoading(true);
      const response = await IssueService.updateIssue(issueData);
      
      if (response.success) {
        // Update the issue in the list
        setIssues(prev => prev.map(issue => 
          issue.id === issueData.id ? response.data : issue
        ));
        setShowEditModal(false);
        setIssueToEdit(null);
        
        // If the updated issue was selected in detail modal, update it
        if (selectedIssue && selectedIssue.id === issueData.id) {
          setSelectedIssue(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to update issue');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update issue');
      console.error('Error updating issue:', err);
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setIssueToDelete(id);
    setShowDeleteModal(true);
    setShowDetailModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!issueToDelete) return;
    
    try {
      setDeleteLoading(true);
      const response = await IssueService.deleteIssue(issueToDelete);
      
      if (response.success) {
        setIssues(prev => prev.filter(issue => issue.id !== issueToDelete));
        setShowDeleteModal(false);
        setIssueToDelete(null);
      } else {
        throw new Error(response.message || 'Failed to delete issue');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete issue');
      console.error('Error deleting issue:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleIssueClick = async (issue: Issue) => {
    try {
      const response = await IssueService.getIssueById(issue.id);
      if (response.success) {
        setSelectedIssue(response.data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error fetching issue details:', err);
      setSelectedIssue(issue);
      setShowDetailModal(true);
    }
  };

  const clearAllFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setAssigneeFilter('');
    setReporterFilter('');
    setSearchTerm('');
  };

  // Get unique assignees and reporters from issues
  const getUniqueAssignees = () => {
    const assignees = issues
      .filter(issue => issue.assigneeName)
      .map(issue => ({ id: issue.assigneeId!, name: issue.assigneeName! }));
    
    // Remove duplicates
    const unique = assignees.filter((assignee, index, self) => 
      index === self.findIndex(a => a.id === assignee.id)
    );
    
    return unique;
  };

  const getUniqueReporters = () => {
    const reporters = issues
      .map(issue => ({ id: issue.reporterId, name: issue.reporterName }));
    
    // Remove duplicates
    const unique = reporters.filter((reporter, index, self) => 
      index === self.findIndex(r => r.id === reporter.id)
    );
    
    return unique;
  };

  const getStats = () => {
    return {
      total: issues.length,
      todo: issues.filter(issue => issue.statusName.toLowerCase() === 'todo').length,
      inProgress: issues.filter(issue => issue.statusName.toLowerCase() === 'in progress').length,
      completed: issues.filter(issue => issue.statusName.toLowerCase() === 'completed').length,
    };
  };

  const stats = getStats();

  // Show loading state while reference data is loading
  if (referenceDataLoading || initialLoad) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Loading dashboard data...
                </p>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <StatsGridSkeleton />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <IssuesGridSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track and manage your project issues
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-all duration-200 hover:scale-105 transform"
              >
                <span>+</span>
                Create Issue
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex justify-between items-center animate-fade-in">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Issues', value: stats.total, icon: '📊', color: 'blue' },
              { title: 'Todo', value: stats.todo, icon: '📋', color: 'yellow' },
              { title: 'In Progress', value: stats.inProgress, icon: '🔄', color: 'blue' },
              { title: 'Completed', value: stats.completed, icon: '✅', color: 'green' }
            ].map((stat, index) => (
              <div 
                key={stat.title}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg flex items-center justify-center transition-transform hover:scale-110`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 animate-fade-in">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 focus:scale-[1.02]"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.name}>{status.name}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 focus:scale-[1.02]"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.id} value={priority.name}>{priority.name}</option>
                ))}
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 focus:scale-[1.02]"
              >
                <option value="">All Assignees</option>
                <option value="">Unassigned</option>
                {getUniqueAssignees().map(assignee => (
                  <option key={assignee.id} value={assignee.name}>{assignee.name}</option>
                ))}
              </select>

              <select
                value={reporterFilter}
                onChange={(e) => setReporterFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 focus:scale-[1.02]"
              >
                <option value="">All Reporters</option>
                {getUniqueReporters().map(reporter => (
                  <option key={reporter.id} value={reporter.name}>{reporter.name}</option>
                ))}
              </select>

              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                Clear All
              </button>

              <button
                onClick={() => loadReferenceData()}
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                disabled={referenceDataLoading}
              >
                {referenceDataLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Issues Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Issues ({filteredIssues.length})
              </h2>
              <button
                onClick={() => loadIssues()}
                disabled={loading}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 flex items-center gap-1 transition-all duration-200 hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    ↻ Refresh
                  </>
                )}
              </button>
            </div>

            {filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIssues.map((issue, index) => (
                  <div 
                    key={issue.id}
                    className="animate-fade-in group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <IssueCard
                      issue={issue}
                      onEdit={handleEditIssue}
                      onDelete={handleDeleteClick}
                      onClick={handleIssueClick}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No issues found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {issues.length === 0 
                    ? "Get started by creating your first issue" 
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 transform"
                >
                  Create Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateIssue}
        projects={projects}
        users={users}
        statuses={statuses}
        priorities={priorities}
        loading={createLoading}
      />

      <EditIssueModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setIssueToEdit(null);
        }}
        onSubmit={handleUpdateIssue}
        issue={issueToEdit}
        projects={projects}
        users={users}
        statuses={statuses}
        priorities={priorities}
        loading={editLoading}
      />

      <IssueDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedIssue(null);
        }}
        issue={selectedIssue}
        onEdit={handleEditIssue}
        onDelete={handleDeleteClick}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIssueToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Issue"
        message={`Are you sure you want to delete this issue? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </>
  );
};

export default Dashboard;