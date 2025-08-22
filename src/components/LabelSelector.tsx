import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { LabelService } from '../services/LabelService';
import type { Label } from '../types/interface';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const LabelSelector: React.FC<LabelSelectorProps> = ({
  selectedLabels = [], // Default to empty array
  onLabelsChange,
  disabled = false,
}) => {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const response = await LabelService.getAllLabels();
      console.log("labels: ", response)
      
      if (response.success && response.data) {
        setAvailableLabels(response.data);
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = (label: Label) => {
    const isAlreadySelected = selectedLabels.some(selected => selected.id === label.id);
    
    if (!isAlreadySelected) {
      onLabelsChange([...selectedLabels, label]);
    }
    
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveLabel = (labelId: number) => {
    const updatedLabels = selectedLabels.filter(label => label.id !== labelId);
    onLabelsChange(updatedLabels);
  };

  const filteredLabels = availableLabels.filter(label => {
    const matchesSearch = searchTerm === '' || 
      label.name.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadySelected = !selectedLabels.some(selected => selected.id === label.id);
    
    return matchesSearch && notAlreadySelected;
  });

  const handleCreateNewLabel = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      // Generate a random color for new labels
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const result = await LabelService.createLabel({
        name: searchTerm.trim(),
        color: randomColor
      });
      
      if (result.success && result.data) {
        setAvailableLabels([...availableLabels, result.data]);
        handleAddLabel(result.data);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Labels Display */}
      <div className="min-h-[42px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 flex flex-wrap items-center gap-2">
        {/* Display Selected Labels */}
        {selectedLabels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: label.color }}
          >
            <Tag className="w-3 h-3" />
            {label?.name}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveLabel(label.id)}
                className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        
        {/* Add Label Button */}
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add label
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isDropdownOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search or create labels..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>

          {/* Create New Label Option */}
          {searchTerm.trim() && !availableLabels.some(label => 
            label.name.toLowerCase() === searchTerm.toLowerCase()
          ) && (
            <button
              onClick={handleCreateNewLabel}
              className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create "{searchTerm.trim()}"
              </div>
            </button>
          )}

          {/* Available Labels */}
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading labels...
            </div>
          ) : filteredLabels.length === 0 ? (
            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No labels found' : 'No more labels available'}
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              {filteredLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => handleAddLabel(label)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                  <Tag className="w-4 h-4 text-gray-400" />
                  {label.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};