import React, { useState } from 'react';
import { FolderOpen, X } from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (projectId: number) => void;
  projects: Project[];
  title: string;
  memberName: string;
}

export const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  projects,
  title,
  memberName
}) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedProject) {
      onSelect(selectedProject);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remove {memberName} from:
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {projects.map((project) => (
              <label
                key={project.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="project"
                  value={project.id}
                  checked={selectedProject === project.id}
                  onChange={() => setSelectedProject(project.id)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </p>
                  {project.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {project.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedProject}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};