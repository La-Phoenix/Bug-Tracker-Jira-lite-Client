import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { LabelService } from '../services/LabelService';
import type { Label } from '../types/interface';

interface LabelFilterProps {
  selectedLabelIds: number[];
  onFilterChange: (labelIds: number[]) => void;
  className?: string;
}

export const LabelFilter: React.FC<LabelFilterProps> = ({
  selectedLabelIds,
  onFilterChange,
  className = ''
}) => {
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const result = await LabelService.getAllLabels();
      if (result.success && result.data) {
        setAllLabels(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedLabels = allLabels.filter(label => 
    selectedLabelIds.includes(label.id)
  );

  const handleToggleLabel = (labelId: number) => {
    const newSelectedIds = selectedLabelIds.includes(labelId)
      ? selectedLabelIds.filter(id => id !== labelId)
      : [...selectedLabelIds, labelId];
    
    onFilterChange(newSelectedIds);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">
          Labels {selectedLabelIds.length > 0 && `(${selectedLabelIds.length})`}
        </span>
      </button>

      {/* Selected labels display */}
      {selectedLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
              <button
                onClick={() => handleToggleLabel(label.id)}
                className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Filter by Labels
            </h3>
            {selectedLabelIds.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="py-1">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading labels...
              </div>
            ) : allLabels.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No labels available
              </div>
            ) : (
              allLabels.map((label) => (
                <label
                  key={label.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLabelIds.includes(label.id)}
                    onChange={() => handleToggleLabel(label.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {label.name}
                  </span>
                </label>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};