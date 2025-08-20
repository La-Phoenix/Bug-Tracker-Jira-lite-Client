import React, { useState, useEffect } from 'react';
import {
  Tag,
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
  Hash,
  Bug,
  Archive,
  Activity
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import { LabelService } from '../services/LabelService';
import { LabelsSkeleton } from '../components/Skeleton';
import type { Label, Issue } from '../types/interface';

interface LabelWithStats extends Label {
  issueCount: number;
  openIssuesCount: number;
  closedIssuesCount: number;
  lastUsed?: string;
  description?: string;
}

interface LabelStats {
  totalLabels: number;
  activeLabels: number;
  unusedLabels: number;
  totalIssuesTagged: number;
}

const LabelsPage: React.FC = () => {
  const [labels, setLabels] = useState<LabelWithStats[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<LabelWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelWithStats | null>(null);
  const [viewingLabel, setViewingLabel] = useState<LabelWithStats | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<LabelWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [stats, setStats] = useState<LabelStats>({
    totalLabels: 0,
    activeLabels: 0,
    unusedLabels: 0,
    totalIssuesTagged: 0
  });

  useEffect(() => {
    loadLabelsData();
  }, []);

  useEffect(() => {
    filterLabels();
  }, [labels, searchTerm, colorFilter, usageFilter]);

  const loadLabelsData = async () => {
    try {
      setLoading(true);
      setError('');

      const [labelsResponse, issuesResponse] = await Promise.all([
        LabelService.getAllLabels(),
        IssueService.getAllIssues()
      ]);

      if (labelsResponse.success && labelsResponse.data) {
        const rawLabels = labelsResponse.data;
        const issues: Issue[] = issuesResponse.success ? issuesResponse.data || [] : [];

        // Calculate stats for each label
        const labelsWithStats: LabelWithStats[] = rawLabels.map(label => {
          const labelIssues = issues.filter(issue => 
            issue.labels?.some(l => l.id === label.id)
          );
          
          const openIssues = labelIssues.filter(issue => 
            issue.statusName?.toLowerCase() !== 'closed' && 
            issue.statusName?.toLowerCase() !== 'resolved'
          );

          const closedIssues = labelIssues.filter(issue => 
            issue.statusName?.toLowerCase() === 'closed' || 
            issue.statusName?.toLowerCase() === 'resolved'
          );

          // Find last used date
          const sortedIssues = labelIssues.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          const lastUsed = sortedIssues.length > 0 ? sortedIssues[0].updatedAt : undefined;

          return {
            ...label,
            issueCount: labelIssues.length,
            openIssuesCount: openIssues.length,
            closedIssuesCount: closedIssues.length,
            lastUsed
          };
        });

        setLabels(labelsWithStats);

        // Calculate overall stats
        const totalIssuesTagged = issues.reduce((total, issue) => {
          return total + (issue.labels?.length || 0);
        }, 0);

        const labelStats: LabelStats = {
          totalLabels: labelsWithStats.length,
          activeLabels: labelsWithStats.filter(label => label.issueCount > 0).length,
          unusedLabels: labelsWithStats.filter(label => label.issueCount === 0).length,
          totalIssuesTagged
        };

        setStats(labelStats);
      } else {
        setError(labelsResponse.message || 'Failed to fetch labels');
      }
    } catch (err: any) {
      console.error('Error loading labels:', err);
      setError('An error occurred while loading labels');
    } finally {
      setLoading(false);
    }
  };

  const filterLabels = () => {
    let filtered = labels;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(label =>
        label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (label.description && label.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Color filter
    if (colorFilter !== 'all') {
      filtered = filtered.filter(label => {
        const color = label.color?.toLowerCase() || 'gray';
        return color.includes(colorFilter.toLowerCase());
      });
    }

    // Usage filter
    if (usageFilter !== 'all') {
      switch (usageFilter) {
        case 'active':
          filtered = filtered.filter(label => label.issueCount > 0);
          break;
        case 'unused':
          filtered = filtered.filter(label => label.issueCount === 0);
          break;
        case 'popular':
          filtered = filtered.filter(label => label.issueCount >= 5);
          break;
      }
    }

    setFilteredLabels(filtered);
  };

  const handleDeleteLabel = async (labelId: number) => {
    try {
      setIsDeleting(true);
      const response = await LabelService.deleteLabel(labelId);
      
      if (response.success) {
        setLabels(prev => prev.filter(label => label.id !== labelId));
        setSelectedLabels(prev => prev.filter(id => id !== labelId));
        setDeletingLabel(null);
      } else {
        alert(response.message || 'Failed to delete label');
      }
    } catch (err: any) {
      console.error('Error deleting label:', err);
      alert('An error occurred while deleting the label');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLabels.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedLabels.length} labels?`)) return;

    try {
      await Promise.all(selectedLabels.map(id => LabelService.deleteLabel(id)));
      setLabels(prev => prev.filter(label => !selectedLabels.includes(label.id)));
      setSelectedLabels([]);
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('Some labels could not be deleted');
    }
  };

  const handleSelectLabel = (labelId: number) => {
    setSelectedLabels(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLabels.length === filteredLabels.length) {
      setSelectedLabels([]);
    } else {
      setSelectedLabels(filteredLabels.map(label => label.id));
    }
  };

  const getColorPreview = (color?: string) => {
    if (!color) return 'bg-gray-500';
    
    // Handle hex colors
    if (color.startsWith('#')) {
      return '';
    }
    
    // Handle predefined colors
    const colorMap: { [key: string]: string } = {
      'red': 'bg-red-500',
      'orange': 'bg-orange-500',
      'amber': 'bg-amber-500',
      'yellow': 'bg-yellow-500',
      'lime': 'bg-lime-500',
      'green': 'bg-green-500',
      'emerald': 'bg-emerald-500',
      'teal': 'bg-teal-500',
      'cyan': 'bg-cyan-500',
      'sky': 'bg-sky-500',
      'blue': 'bg-blue-500',
      'indigo': 'bg-indigo-500',
      'violet': 'bg-violet-500',
      'purple': 'bg-purple-500',
      'fuchsia': 'bg-fuchsia-500',
      'pink': 'bg-pink-500',
      'rose': 'bg-rose-500',
      'gray': 'bg-gray-500',
      'slate': 'bg-slate-500'
    };

    return colorMap[color.toLowerCase()] || 'bg-gray-500';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
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
  const ActionButtons: React.FC<{ label: LabelWithStats; className?: string }> = ({ 
    label, 
    className = "" 
  }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        onClick={() => setViewingLabel(label)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button 
        onClick={() => setEditingLabel(label)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        title="Edit label"
      >
        <Edit3 className="h-4 w-4" />
      </button>
      <button 
        onClick={() => setDeletingLabel(label)}
        className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title="Delete label"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  if (loading) {
    return <LabelsSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Labels
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={loadLabelsData}
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
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Labels
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Organize and categorize your issues
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadLabelsData}
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
              <span>New Label</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalLabels}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Labels</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-medium">{stats.activeLabels}</span> active
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.activeLabels}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Labels</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg flex-shrink-0">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In use on issues
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.unusedLabels}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unused Labels</p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex-shrink-0">
                <Archive className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ready to organize
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{stats.totalIssuesTagged}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Issues Tagged</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex-shrink-0">
                <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total applications
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
                    placeholder="Search labels..."
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
                {(colorFilter !== 'all' || usageFilter !== 'all') && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {(colorFilter !== 'all' ? 1 : 0) + (usageFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>

              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Color Filter */}
                <div className="relative">
                  <select
                    value={colorFilter}
                    onChange={(e) => setColorFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Colors</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="gray">Gray</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Usage Filter */}
                <div className="relative">
                  <select
                    value={usageFilter}
                    onChange={(e) => setUsageFilter(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-32"
                  >
                    <option value="all">All Labels</option>
                    <option value="active">Active</option>
                    <option value="unused">Unused</option>
                    <option value="popular">Popular</option>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <select
                    value={colorFilter}
                    onChange={(e) => setColorFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Colors</option>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usage</label>
                  <select
                    value={usageFilter}
                    onChange={(e) => setUsageFilter(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="all">All Labels</option>
                    <option value="active">Active</option>
                    <option value="unused">Unused</option>
                    <option value="popular">Popular</option>
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
              Showing <span className="font-medium">{filteredLabels.length}</span> of <span className="font-medium">{labels.length}</span> labels
            </p>
            {selectedLabels.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{selectedLabels.length}</span> selected
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredLabels.map((label) => (
              <div key={label.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-4 h-4 rounded ${getColorPreview(label.color)} flex-shrink-0`}
                        style={label.color?.startsWith('#') ? { backgroundColor: label.color } : {}}
                      />
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleSelectLabel(label.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {label.name}
                    </h3>
                  </div>
                  <div className="relative group">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <ActionButtons label={label} className="flex-col p-2 gap-0" />
                    </div>
                  </div>
                </div>

                {/* Description */}
                {label.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {label.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Bug className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{label.issueCount}</span>
                    </div>
                    {label.issueCount > 0 && (
                      <>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">{label.openIssuesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-600 dark:text-gray-400">{label.closedIssuesCount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Last used {formatDate(label.lastUsed)}</span>
                  </div>
                  <div className="flex gap-1">
                    <ActionButtons label={label} />
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
                  checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-4 grid grid-cols-6 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <div className="col-span-2">Label</div>
                  <div className="col-span-1">Issues</div>
                  <div className="col-span-1">Usage</div>
                  <div className="col-span-1">Last Used</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLabels.map((label) => (
                <div key={label.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleSelectLabel(label.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className={`w-4 h-4 rounded ${getColorPreview(label.color)} flex-shrink-0`}
                            style={label.color?.startsWith('#') ? { backgroundColor: label.color } : {}}
                          />
                          <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">
                            {label.name}
                          </h3>
                        </div>
                        
                        {label.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {label.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Bug className="h-3 w-3" />
                            <span>{label.issueCount} issues</span>
                          </div>
                          {label.issueCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{label.openIssuesCount} open</span>
                              <span>•</span>
                              <span>{label.closedIssuesCount} closed</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Last used {formatDate(label.lastUsed)}</span>
                        </div>
                      </div>
                      <ActionButtons label={label} />
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(label.id)}
                      onChange={() => handleSelectLabel(label.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-4 grid grid-cols-6 gap-4 w-full">
                      {/* Label */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-4 h-4 rounded ${getColorPreview(label.color)} flex-shrink-0`}
                            style={label.color?.startsWith('#') ? { backgroundColor: label.color } : {}}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {label.name}
                            </p>
                            {label.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {label.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Issues */}
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {label.issueCount}
                        </span>
                      </div>

                      {/* Usage */}
                      <div className="col-span-1 flex items-center">
                        {label.issueCount > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-gray-600 dark:text-gray-400">{label.openIssuesCount}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="text-gray-600 dark:text-gray-400">{label.closedIssuesCount}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Unused</span>
                        )}
                      </div>

                      {/* Last Used */}
                      <div className="col-span-1 flex items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(label.lastUsed)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center">
                        <ActionButtons label={label} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredLabels.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Tag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No labels found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
              {searchTerm || colorFilter !== 'all' || usageFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first label'}
            </p>
            {!searchTerm && colorFilter === 'all' && usageFilter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create Label
              </button>
            )}
          </div>
        )}

        {/* Modal Placeholders */}
        {/* These would be actual modal components */}
        {isCreateModalOpen && <div>Create Modal Placeholder</div>}
        {editingLabel && <div>Edit Modal Placeholder</div>}
        {viewingLabel && <div>View Modal Placeholder</div>}
        {deletingLabel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Label
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{deletingLabel.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingLabel(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLabel(deletingLabel.id)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelsPage;