import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, AlertCircle } from 'lucide-react';
import { LabelService } from '../services/LabelService';
import { useAuth } from '../contexts/AuthContext';
import type { Label } from '../types/interface';
import { LabelsSkeleton } from '../components/LabelSeleton';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

interface LabelFormData {
  name: string;
  color: string;
}

const Labels: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [formData, setFormData] = useState<LabelFormData>({ name: '', color: '#000000' });
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchLabels();
  }, []);
  
  const fetchLabels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await LabelService.getAllLabels();
      
      if (result.success && result.data) {
        setLabels(result.data);
      } else {
        setError(result.message || 'Failed to fetch labels');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching labels');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Label name is required');
      return;
    }

    if (!formData.color.match(/^#[0-9A-Fa-f]{6}$/)) {
      setError('Color must be in hex format (#rrggbb)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (editingLabel) {
        // Update existing label
        result = await LabelService.updateLabel(editingLabel.id, {
          name: formData.name.trim(),
          color: formData.color
        });
      } else {
        // Create new label
        result = await LabelService.createLabel({
          name: formData.name.trim(),
          color: formData.color
        });
      }
      console.log("result: ", result)

      if (result.success) {
        await fetchLabels(); // Refresh the list
        handleCloseModal();
      } else {
        setError(result.message || 'Failed to save label');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the label');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (label: Label) => {
    setEditingLabel(label);
    setFormData({ name: label.name, color: label.color });
    setIsModalOpen(true);
  };

  const handleDelete = (label: Label) => {
    setDeletingLabel(label);
    setIsDeleteModalOpen(true);
  };
  
  const cancelDelete = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setIsDeleteModalOpen(false);
    setDeletingLabel(null);
  };

  const confirmDelete = async () => {
    if (!deletingLabel) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await LabelService.deleteLabel(deletingLabel.id);
      
      if (result.success) {
        await fetchLabels(); // Refresh the list
        setIsDeleteModalOpen(false);
        setDeletingLabel(null);
      } else {
        setError(result.message || 'Failed to delete label');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the label');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLabel(null);
    setFormData({ name: '', color: '#000000' });
    setError(null);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, color: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  if (loading) {
    return <LabelsSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Labels
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage issue labels to categorize and organize your projects
            </p>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Label</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
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

        {/* Labels Grid */}
        {labels.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-2">
              No labels found
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-4 text-sm sm:text-base">
              {isAdmin ? 'Create your first label to get started' : 'Labels will appear here when available'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Create Label
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {labels.map((label) => (
              <div
                key={label.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {label.name}
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(label)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit label"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(label)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete label"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div>ID: {label.id}</div>
                  <div>Color: {label.color}</div>
                </div>
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
        title="Delete Label"
        itemName={deletingLabel?.name || ''}
        itemType="label"
        description="This label will be removed from all issues where it's currently applied."
        isDeleting={isDeleting}
      />

      {/* Create/Edit Modal - keep unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingLabel ? 'Edit Label' : 'Create New Label'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter label name (max 50 chars)"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={handleColorChange}
                    className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleColorChange}
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Saving...' : (editingLabel ? 'Update Label' : 'Create Label')}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labels;