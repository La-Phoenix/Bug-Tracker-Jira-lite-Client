import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Copy,
  Star,
  Archive
} from 'lucide-react';
import { IssueService } from '../services/IssueServices';
import type { Issue } from '../types/interface';

interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isDefault?: boolean;
}

const Labels: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [filteredLabels, setFilteredLabels] = useState<Label[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  console.log(allIssues)
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });
  
  // Selection
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const predefinedColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#64748B',
    '#6B7280', '#374151'
  ];

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
      
      // Load issues to calculate label usage
      const issuesResponse = await IssueService.getAllIssues();
      const issues = issuesResponse.success ? issuesResponse.data || [] : [];
      setAllIssues(issues);
      
      // Generate mock labels since no endpoint exists yet
      const mockLabels = generateMockLabels(issues);
      setLabels(mockLabels);
      
    } catch (err: any) {
      console.error('Error loading labels:', err);
      setError('An error occurred while loading labels data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockLabels = (issues: Issue[]): Label[] => {
    console.log(issues)
    const commonLabels = [
      { name: 'bug', color: '#EF4444', description: 'Something isn\'t working', isDefault: true },
      { name: 'enhancement', color: '#3B82F6', description: 'New feature or request', isDefault: true },
      { name: 'documentation', color: '#6B7280', description: 'Improvements or additions to documentation', isDefault: true },
      { name: 'duplicate', color: '#64748B', description: 'This issue or pull request already exists', isDefault: true },
      { name: 'good first issue', color: '#22C55E', description: 'Good for newcomers', isDefault: true },
      { name: 'help wanted', color: '#8B5CF6', description: 'Extra attention is needed', isDefault: true },
      { name: 'invalid', color: '#F97316', description: 'This doesn\'t seem right', isDefault: true },
      { name: 'question', color: '#EC4899', description: 'Further information is requested', isDefault: true },
      { name: 'wontfix', color: '#374151', description: 'This will not be worked on', isDefault: true },
      { name: 'critical', color: '#DC2626', description: 'Needs immediate attention' },
      { name: 'frontend', color: '#06B6D4', description: 'Frontend related issues' },
      { name: 'backend', color: '#10B981', description: 'Backend related issues' },
      { name: 'ui/ux', color: '#D946EF', description: 'User interface and experience' },
      { name: 'performance', color: '#F59E0B', description: 'Performance improvements' },
      { name: 'security', color: '#991B1B', description: 'Security related issues' },
      { name: 'testing', color: '#84CC16', description: 'Testing related' },
      { name: 'mobile', color: '#A855F7', description: 'Mobile platform issues' },
      { name: 'desktop', color: '#0EA5E9', description: 'Desktop platform issues' }
    ];

    return commonLabels.map((label, index) => {
      // Calculate usage from priority/status names in issues (mock calculation)
      const usageCount = Math.floor(Math.random() * 15) + (label.isDefault ? 5 : 0);
      
      return {
        id: (index + 1).toString(),
        name: label.name,
        color: label.color,
        description: label.description,
        isDefault: label.isDefault || false,
        usageCount,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };

  const filterLabels = () => {
    let filtered = [...labels];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(label =>
        label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Color filter
    if (colorFilter !== 'all') {
      const colorRanges = {
        red: ['#EF4444', '#DC2626', '#991B1B', '#F87171'],
        blue: ['#3B82F6', '#2563EB', '#1D4ED8', '#60A5FA'],
        green: ['#22C55E', '#16A34A', '#15803D', '#4ADE80'],
        purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#A78BFA'],
        yellow: ['#F59E0B', '#D97706', '#B45309', '#FBBF24'],
        gray: ['#6B7280', '#4B5563', '#374151', '#9CA3AF']
      };
      
      const selectedColors = colorRanges[colorFilter as keyof typeof colorRanges] || [];
      if (selectedColors.length > 0) {
        filtered = filtered.filter(label => 
          selectedColors.some(color => 
            label.color.toLowerCase() === color.toLowerCase()
          )
        );
      }
    }

    // Usage filter
    if (usageFilter !== 'all') {
      if (usageFilter === 'unused') {
        filtered = filtered.filter(label => label.usageCount === 0);
      } else if (usageFilter === 'popular') {
        filtered = filtered.filter(label => label.usageCount >= 10);
      } else if (usageFilter === 'default') {
        filtered = filtered.filter(label => label.isDefault);
      }
    }

    setFilteredLabels(filtered);
  };

  const handleCreateLabel = () => {
    setFormData({ name: '', color: '#3B82F6', description: '' });
    setEditingLabel(null);
    setIsCreateModalOpen(true);
  };

  const handleEditLabel = (label: Label) => {
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
    setEditingLabel(label);
    setIsCreateModalOpen(true);
  };

  const handleSaveLabel = () => {
    if (!formData.name.trim()) return;

    const newLabel: Label = {
      id: editingLabel ? editingLabel.id : (labels.length + 1).toString(),
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description.trim() || undefined,
      usageCount: editingLabel ? editingLabel.usageCount : 0,
      isDefault: editingLabel ? editingLabel.isDefault : false,
      createdAt: editingLabel ? editingLabel.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingLabel) {
      setLabels(prev => prev.map(label => 
        label.id === editingLabel.id ? newLabel : label
      ));
    } else {
      setLabels(prev => [...prev, newLabel]);
    }

    setIsCreateModalOpen(false);
    setFormData({ name: '', color: '#3B82F6', description: '' });
    setEditingLabel(null);
  };

  const handleDeleteLabel = (label: Label) => {
    setDeletingLabel(label);
  };

  const confirmDelete = () => {
    if (!deletingLabel) return;

    setLabels(prev => prev.filter(label => label.id !== deletingLabel.id));
    setSelectedLabels(prev => prev.filter(id => id !== deletingLabel.id));
    setDeletingLabel(null);
  };

  const handleSelectLabel = (labelId: string) => {
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

  const copyLabelName = (name: string) => {
    navigator.clipboard.writeText(name);
    // Could add toast notification here
  };

  const getContrastColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-600 dark:text-slate-400">Loading labels...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Labels
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadLabelsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const labelStats = {
    total: labels.length,
    used: labels.filter(l => l.usageCount > 0).length,
    unused: labels.filter(l => l.usageCount === 0).length,
    default: labels.filter(l => l.isDefault).length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="h-8 w-8 text-blue-600" />
            Labels
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Organize and categorize your issues with custom labels
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <button
            onClick={loadLabelsData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateLabel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Label
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{labelStats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Labels</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{labelStats.used}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Use</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{labelStats.unused}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unused</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <Archive className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{labelStats.default}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Default Labels</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Colors</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="yellow">Yellow</option>
              <option value="gray">Gray</option>
            </select>

            <select
              value={usageFilter}
              onChange={(e) => setUsageFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">All Labels</option>
              <option value="used">Used Labels</option>
              <option value="unused">Unused Labels</option>
              <option value="popular">Popular (10+ uses)</option>
              <option value="default">Default Labels</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLabels.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <span className="text-sm text-blue-800 dark:text-blue-300">
              {selectedLabels.length} label(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Bulk Edit
              </button>
              <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Labels List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
              onChange={handleSelectAll}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
            />
            <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              <div className="col-span-4">Label</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Usage</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-gray-700">
          {filteredLabels.map((label) => (
            <div key={label.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLabels.includes(label.id)}
                  onChange={() => handleSelectLabel(label.id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-4"
                />
                <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <span
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: label.color,
                        color: getContrastColor(label.color),
                        borderColor: label.color
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      {label.name}
                    </span>
                    {label.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {label.description || 'No description'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {label.usageCount}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        issue{label.usageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(label.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="col-span-1 flex items-center gap-1">
                    <button
                      onClick={() => copyLabelName(label.name)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="Copy label name"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditLabel(label)}
                      className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Edit label"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabel(label)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete label"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLabels.length === 0 && (
          <div className="p-12 text-center">
            <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No labels found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm || colorFilter !== 'all' || usageFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start organizing your issues by creating your first label'}
            </p>
            {!searchTerm && colorFilter === 'all' && usageFilter === 'all' && (
              <button
                onClick={handleCreateLabel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Label
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md mx-4 border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingLabel ? 'Edit Label' : 'Create New Label'}
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Label Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Label Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. bug, enhancement, urgent"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-slate-300 dark:border-gray-600 rounded-lg cursor-pointer"
                    />
                    <span
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border"
                      style={{
                        backgroundColor: formData.color,
                        color: getContrastColor(formData.color),
                        borderColor: formData.color
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      {formData.name || 'preview'}
                    </span>
                  </div>
                  
                  {/* Predefined Colors */}
                  <div className="grid grid-cols-10 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          formData.color === color 
                            ? 'border-slate-900 dark:border-white scale-110' 
                            : 'border-slate-300 dark:border-gray-600 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this label represents..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLabel}
                  disabled={!formData.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  {editingLabel ? 'Update Label' : 'Create Label'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingLabel && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-md mx-4 border border-white/20 dark:border-gray-700/50">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delete Label
                  </h3>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to delete the label{' '}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border mx-1"
                  style={{
                    backgroundColor: deletingLabel.color,
                    color: getContrastColor(deletingLabel.color),
                    borderColor: deletingLabel.color
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {deletingLabel.name}
                </span>
                ? This action cannot be undone.
              </p>

              {deletingLabel.usageCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                  <p className="text-amber-800 dark:text-amber-300 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    This label is currently used by {deletingLabel.usageCount} issue{deletingLabel.usageCount !== 1 ? 's' : ''}. 
                    Deleting it will remove the label from all associated issues.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingLabel(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labels;