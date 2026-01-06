import { useCallback } from 'react';
import type { NotificationType, PriorityLevel } from '../types/interface';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const useToast = () => {
  const showToast = useCallback((
    title: string,
    message: string,
    type: NotificationType = 'SystemAlert',
    priority: PriorityLevel = 'Medium',
    options: ToastOptions = {}
  ) => {
    const { duration = 4000, position = 'top-right' } = options;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed z-50 max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out`;
    
    // Position styles
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    
    toast.className += ` ${positionStyles[position]}`;
    
    // Priority colors
    const priorityColors = {
      'Critical': 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
      'High': 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
      'Medium': 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
      'Low': 'border-l-gray-500 bg-gray-50 dark:bg-gray-800'
    };
    
    toast.className += ` ${priorityColors[priority]} border-l-4`;
    
    // Icon mapping
    const getIcon = (type: NotificationType): string => {
      switch (type) {
        case 'IssueAssigned': return '📋';
        case 'IssueCreated': return '🆕';
        case 'IssueUpdated': return '🔄';
        case 'IssueCommented': return '💬';
        case 'UserMentioned': return '👤';
        case 'ProjectInvitation': return '📧';
        case 'ProjectUpdate': return '📊';
        case 'ChatMessage': return '💬';
        case 'ChatInvitation': return '👥';
        case 'ChatGroupCreated': return '🔗';
        case 'SystemAlert': return '⚠️';
        case 'WeeklyDigest': return '📅';
        default: return '📢';
      }
    };

    toast.innerHTML = `
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <span class="text-lg">${getIcon(type)}</span>
          </div>
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              ${title}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ${message}
            </p>
            ${priority === 'Critical' || priority === 'High' ? `
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                priority === 'Critical' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }">
                ${priority}
              </span>
            ` : ''}
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button class="toast-close bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add close functionality
    const closeButton = toast.querySelector('.toast-close');
    const closeToast = () => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    if (closeButton) {
      closeButton.addEventListener('click', closeToast);
    }

    // Add to DOM
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Auto remove after duration
    setTimeout(closeToast, duration);

  }, []);

  return { showToast };
};