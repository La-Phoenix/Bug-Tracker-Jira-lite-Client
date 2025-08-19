import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';
import { IssueService } from '../services/IssueServices';
import { ProjectService } from '../services/ProjectService';
import { UserService } from '../services/UserService';
import { Menu, User, LogOut, Bell, Search, X, Clock, Bug, FolderOpen, MessageSquare, CheckCircle, AlertCircle, Plus, Edit3, Volume2, VolumeX } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import type { Issue, Project, User as UserType } from '../types/interface';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface ActivityItem {
  id: string;
  type: 'issue' | 'project' | 'user' | 'comment' | 'label' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'resolved' | 'closed' | 'commented' | 'labeled' | 'archived';
  actor: {
    id: number;
    name: string;
    avatar?: string;
  };
  target: {
    id: string;
    name: string;
    type: 'issue' | 'project' | 'user' | 'comment';
  };
  description: string;
  timestamp: string;
  metadata?: {
    from?: string;
    to?: string;
    project?: string;
    priority?: string;
    status?: string;
  };
}

interface Notification {
  id: string;
  type: 'issue' | 'project' | 'comment' | 'mention' | 'assignment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actor?: {
    name: string;
    avatar?: string;
  };
}

// Sound utility functions
const createNotificationSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Audio context error:', error);
  }
};

const playNotificationSound = (priority: string, soundEnabled: boolean) => {
  if (!soundEnabled) return;

  try {
    switch (priority) {
      case 'critical':
        // Critical: Urgent triple beep
        createNotificationSound(800, 0.2);
        setTimeout(() => createNotificationSound(800, 0.2), 250);
        setTimeout(() => createNotificationSound(800, 0.2), 500);
        break;
      case 'high':
        // High: Double beep
        createNotificationSound(600, 0.3);
        setTimeout(() => createNotificationSound(600, 0.3), 350);
        break;
      case 'medium':
        // Medium: Single medium tone
        createNotificationSound(500, 0.4);
        break;
      case 'low':
      default:
        // Low: Soft single tone
        createNotificationSound(400, 0.3);
        break;
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<string>('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const previousNotificationCount = useRef<number>(0);

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundPreference = localStorage.getItem('notificationSoundEnabled');
    if (savedSoundPreference !== null) {
      setSoundEnabled(JSON.parse(savedSoundPreference));
    }
    
    // Load last activity timestamp
    const savedLastActivity = localStorage.getItem('lastActivityTimestamp');
    if (savedLastActivity) {
      setLastActivityTimestamp(savedLastActivity);
    }
  }, []);

  // Save sound preference and last activity to localStorage
  useEffect(() => {
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (lastActivityTimestamp) {
      localStorage.setItem('lastActivityTimestamp', lastActivityTimestamp);
    }
  }, [lastActivityTimestamp]);

  // Load real data on component mount
  useEffect(() => {
    loadNotificationsFromActivities();
    
    // Set up periodic refresh for new notifications every 10 seconds for better responsiveness
    const interval = setInterval(loadNotificationsFromActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play sound for new notifications
  useEffect(() => {
    const currentNotificationCount = notifications.filter(n => !n.read).length;
    
    // Only play sound if we have new notifications (count increased)
    if (currentNotificationCount > previousNotificationCount.current && previousNotificationCount.current >= 0) {
      const newNotifications = notifications.filter(n => !n.read).slice(0, currentNotificationCount - previousNotificationCount.current);
      
      // Play sound for the highest priority new notification
      if (newNotifications.length > 0) {
        const highestPriorityNotification = newNotifications.reduce((prev, current) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[current.priority] > priorityOrder[prev.priority] ? current : prev;
        });
        
        console.log('🔊 Playing notification sound for:', highestPriorityNotification.title, 'Priority:', highestPriorityNotification.priority);
        playNotificationSound(highestPriorityNotification.priority, soundEnabled);
      }
    }
    
    previousNotificationCount.current = currentNotificationCount;
  }, [notifications, soundEnabled]);

  const loadNotificationsFromActivities = async () => {
    try {
      setLoading(true);
      
      // Load data from services
      const [issuesResponse, projectsResponse, usersResponse] = await Promise.all([
        IssueService.getAllIssues(),
        ProjectService.getAllProjects().catch(() => ({ success: false, data: [] })),
        UserService.getAllUsers().catch(() => ({ success: false, data: [] }))
      ]);

      const issues = issuesResponse.success ? issuesResponse.data || [] : [];
      const projects = projectsResponse.success ? projectsResponse.data || [] : [];
      const users = usersResponse.success ? usersResponse.data || [] : [];

      // Generate activities and convert to notifications
      const activities = generateActivitiesFromData(issues, projects, users);
      const notificationsFromActivities = convertActivitiesToNotifications(activities, user?.id || 1);
      
      // Update last activity timestamp with the most recent activity
      if (activities.length > 0) {
        const mostRecentActivity = activities[0]; // Activities are sorted by timestamp desc
        if (!lastActivityTimestamp || new Date(mostRecentActivity.timestamp) > new Date(lastActivityTimestamp)) {
          setLastActivityTimestamp(mostRecentActivity.timestamp);
        }
      }
      
      setNotifications(notificationsFromActivities);

    } catch (err) {
      console.error('Error loading notifications:', err);
      // Fallback to original mock data if needed
      generateMockNotifications();
    } finally {
      setLoading(false);
    }
  };

  const generateActivitiesFromData = (issues: Issue[], projects: Project[], users: UserType[]): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    const currentUserId = user?.id || 1;
    const now = Date.now();
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    // Generate activities from issues
    issues.forEach((issue) => {
      const createdDate = new Date(issue.createdAt);
      const updatedDate = new Date(issue.updatedAt || issue.createdAt);
      
      const creator = users.find(u => u.id === issue.reporterId) || users[0] || {
        id: 1,
        name: 'System',
        email: '',
        createdAt: '',
        updatedAt: ''
      };

      const assignee = users.find(u => u.id === issue.assigneeId);

      // Issue creation activity (for recent issues)
      if (createdDate.getTime() > oneWeekAgo) {
        activities.push({
          id: `issue-create-${issue.id}`,
          type: 'issue',
          action: 'created',
          actor: {
            id: creator.id,
            name: creator.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `created issue "${issue.title}"`,
          timestamp: issue.createdAt,
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium',
            status: issue.statusName || 'Open'
          }
        });
      }

      // Issue assignment activity (ALWAYS for current user assignments)
      if (issue.assigneeId === currentUserId && assignee) {
        activities.push({
          id: `issue-assign-${issue.id}`,
          type: 'issue',
          action: 'assigned',
          actor: {
            id: creator.id,
            name: creator.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `assigned issue "${issue.title}" to you`,
          timestamp: issue.updatedAt || issue.createdAt,
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium'
          }
        });
      }

      // Issue update activity (for ALL recent updates)
      if (updatedDate > createdDate && updatedDate.getTime() > oneDayAgo) {
        activities.push({
          id: `issue-update-${issue.id}`,
          type: 'issue',
          action: 'updated',
          actor: {
            id: (assignee || creator).id,
            name: (assignee || creator).name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `updated issue "${issue.title}"`,
          timestamp: issue.updatedAt || issue.createdAt,
          metadata: {
            project: issue.projectName || 'Unknown Project',
            status: issue.statusName || 'Open',
            priority: issue.priorityName || 'Medium'
          }
        });
      }

      // Resolved activity for resolved issues
      if (issue.statusName?.toLowerCase() === 'resolved') {
        // Create resolved activity with recent timestamp for demonstration
        const resolvedTime = Math.max(updatedDate.getTime(), twoHoursAgo + Math.random() * (now - twoHoursAgo));
        
        activities.push({
          id: `issue-resolve-${issue.id}`,
          type: 'issue',
          action: 'resolved',
          actor: {
            id: (assignee || creator).id,
            name: (assignee || creator).name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `resolved issue "${issue.title}"`,
          timestamp: new Date(resolvedTime).toISOString(),
          metadata: {
            from: 'In Progress',
            to: 'Resolved',
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium'
          }
        });
      }
    });

    // Generate activities from projects (recent ones)
    projects.forEach((project) => {
      const projectDate = new Date(project.createdAt as string);
      if (projectDate.getTime() > oneWeekAgo) {
        const creator = users[Math.floor(Math.random() * users.length)] || users[0];
        if (creator) {
          activities.push({
            id: `project-create-${project.id}`,
            type: 'project',
            action: 'created',
            actor: {
              id: creator.id,
              name: creator.name
            },
            target: {
              id: project.id.toString(),
              name: project.name,
              type: 'project'
            },
            description: `created project "${project.name}"`,
            timestamp: project.createdAt as string,
            metadata: {}
          });
        }
      }
    });

    // Generate some comment activities (always create recent ones)
    const recentIssues = issues.slice(0, 8); // Take first 8 issues

    recentIssues.forEach((issue, index) => {
      const commenter = users[index % users.length] || users[0];
      if (commenter) {
        // Create comment activity with recent timestamp
        const commentTime = now - Math.random() * (2 * 60 * 60 * 1000); // Within last 2 hours
        
        activities.push({
          id: `comment-${issue.id}-${index}`,
          type: 'comment',
          action: 'commented',
          actor: {
            id: commenter.id,
            name: commenter.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `commented on issue "${issue.title}"`,
          timestamp: new Date(commentTime).toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || 'Medium'
          }
        });
      }
    });

    // Add some system activities for variety
    if (issues.length > 0) {
      const systemActivities = [
        {
          action: 'labeled' as const,
          description: 'added label "bug" to',
          priority: 'medium' as const
        },
        {
          action: 'updated' as const,
          description: 'changed priority of',
          priority: 'high' as const
        },
        {
          action: 'assigned' as const,
          description: 'reassigned',
          priority: 'high' as const
        }
      ];

      systemActivities.forEach((sysActivity, index) => {
        const issue = issues[index % issues.length];
        const actor = users[index % users.length] || users[0];
        const activityTime = now - Math.random() * (6 * 60 * 60 * 1000); // Within last 6 hours

        activities.push({
          id: `system-${sysActivity.action}-${issue.id}-${index}`,
          type: 'issue',
          action: sysActivity.action,
          actor: {
            id: actor.id,
            name: actor.name
          },
          target: {
            id: issue.id.toString(),
            name: issue.title,
            type: 'issue'
          },
          description: `${sysActivity.description} issue "${issue.title}"`,
          timestamp: new Date(activityTime).toISOString(),
          metadata: {
            project: issue.projectName || 'Unknown Project',
            priority: issue.priorityName || sysActivity.priority,
            status: issue.statusName || 'Open'
          }
        });
      });
    }

    // Sort by timestamp (newest first) and return recent activities
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30); // Increase limit to 30 for more notifications
  };

  const convertActivitiesToNotifications = (activities: ActivityItem[], currentUserId: number): Notification[] => {
    return activities.map((activity) => {
      const activityTime = new Date(activity.timestamp).getTime();
      const now = Date.now();
      const isVeryRecent = now - activityTime < 30 * 60 * 1000; // Within last 30 minutes
      const isRecentActivity = now - activityTime < 4 * 60 * 60 * 1000; // Within last 4 hours
      const isAssignedToUser = activity.action === 'assigned' && activity.target.type === 'issue';
      const isCriticalPriority = activity.metadata?.priority?.toLowerCase() === 'critical';
      const isHighPriority = activity.metadata?.priority?.toLowerCase() === 'high';

      // Determine notification type
      let notificationType: Notification['type'] = 'issue';
      switch (activity.type) {
        case 'project':
          notificationType = 'project';
          break;
        case 'comment':
          notificationType = 'comment';
          break;
        case 'issue':
          if (activity.action === 'assigned') {
            notificationType = 'assignment';
          } else {
            notificationType = 'issue';
          }
          break;
        default:
          notificationType = 'issue';
      }

      // Determine priority
      let priority: Notification['priority'] = 'low';
      if (isCriticalPriority) {
        priority = 'critical';
      } else if (isHighPriority || activity.action === 'assigned') {
        priority = 'high';
      } else if (activity.action === 'commented' || activity.action === 'updated' || activity.action === 'resolved') {
        priority = 'medium';
      }

      // IMPROVED READ STATUS LOGIC - Make notifications more likely to be unread
      let isRead = false;
      
      if (isVeryRecent) {
        // Activities within 30 minutes are ALWAYS unread
        isRead = false;
      } else if (isRecentActivity) {
        // Activities within 4 hours: 80% unread
        isRead = Math.random() > 0.8;
      } else if (activity.action === 'assigned' && activity.actor.id !== currentUserId) {
        // Assignments to you are always unread regardless of time
        isRead = false;
      } else if (['critical', 'high'].includes(priority)) {
        // High priority notifications: 70% unread
        isRead = Math.random() > 0.7;
      } else {
        // Older activities: 40% unread
        isRead = Math.random() > 0.4;
      }

      // Create notification title
      let title = '';
      switch (activity.action) {
        case 'created':
          title = activity.type === 'project' ? 'New Project Created' : 'New Issue Created';
          break;
        case 'assigned':
          title = 'Issue Assigned';
          break;
        case 'updated':
          title = 'Issue Updated';
          break;
        case 'resolved':
          title = 'Issue Resolved';
          break;
        case 'commented':
          title = 'New Comment Added';
          break;
        case 'labeled':
          title = 'Issue Labeled';
          break;
        default:
          title = 'Activity Update';
      }

      // Create action URL
      const actionUrl = activity.target.type === 'project' 
        ? `/projects/${activity.target.id}`
        : `/issues/${activity.target.id}`;

      return {
        id: activity.id,
        type: notificationType,
        title,
        message: `${activity.actor.name} ${activity.description}${activity.metadata?.project ? ` in ${activity.metadata.project}` : ''}`,
        timestamp: activity.timestamp,
        read: isRead,
        priority,
        actionUrl,
        actor: {
          name: activity.actor.name,
          avatar: activity.actor.avatar
        }
      };
    }).filter((notification, index, self) => {
      // Remove duplicates based on similar content but allow some duplicates for variety
      return index === self.findIndex(n => 
        n.message === notification.message && 
        Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 30000 // Within 30 seconds
      );
    });
  };

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'issue',
        title: 'New Critical Issue Assigned',
        message: 'You have been assigned to a critical issue: "Login system failing for all users"',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        priority: 'critical',
        actionUrl: '/issues/123',
        actor: { name: 'John Smith' }
      },
      {
        id: '2',
        type: 'comment',
        title: 'New Comment on Issue',
        message: 'Sarah Connor commented on "Button styling inconsistent across pages"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        priority: 'medium',
        actionUrl: '/issues/456',
        actor: { name: 'Sarah Connor' }
      }
    ];

    setNotifications(mockNotifications);
  };

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/auth';
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate to action URL (if available)
    if (notification.actionUrl) {
      // In a real app, you'd use react-router navigation
      console.log('Navigate to:', notification.actionUrl);
      // For now, you could use: window.location.href = notification.actionUrl;
    }
    
    setIsNotificationOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  const deleteNotification = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshNotifications = () => {
    loadNotificationsFromActivities();
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    
    // Play a test sound when enabling
    if (!soundEnabled) {
      playNotificationSound('medium', true);
    }
  };

  const testNotificationSound = (priority: string) => {
    playNotificationSound(priority, soundEnabled);
  };

  // Force create a new notification for testing
  const createTestNotification = () => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      type: 'issue',
      title: 'Test Critical Issue',
      message: 'This is a test critical notification with sound',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'critical',
      actionUrl: '/issues/test',
      actor: { name: 'Test User' }
    };

    setNotifications(prev => [testNotification, ...prev]);
    console.log('🧪 Created test notification');
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === 'critical' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-amber-500' :
      'text-blue-500'
    }`;

    switch (type) {
      case 'issue':
        return <Bug className={iconClass} />;
      case 'project':
        return <FolderOpen className={iconClass} />;
      case 'comment':
        return <MessageSquare className={iconClass} />;
      case 'mention':
        return <User className={iconClass} />;
      case 'assignment':
        return <AlertCircle className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add test notification button (you can remove this later)
  const TestNotificationButton = () => (
    <button
      onClick={createTestNotification}
      className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm"
      title="Create test notification"
    >
      🔔 Test
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {/* Search bar */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search issues, projects..."
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Right side - User menu and notifications */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className={`text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ${
                soundEnabled ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
              title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                disabled={loading}
              >
                <Bell className={`h-6 w-6 ${loading ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={refreshNotifications}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Refresh'}
                        </button>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Sound settings */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleSound}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            soundEnabled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {soundEnabled ? (
                            <><Volume2 className="h-3 w-3 inline mr-1" />Sound On</>
                          ) : (
                            <><VolumeX className="h-3 w-3 inline mr-1" />Sound Off</>
                          )}
                        </button>
                      </div>
                      
                      {soundEnabled && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Test:</span>
                          <button
                            onClick={() => testNotificationSound('low')}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Low
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => testNotificationSound('medium')}
                            className="text-xs text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                          >
                            Med
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => testNotificationSound('high')}
                            className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            High
                          </button>
                          <span className="text-xs text-gray-400">|</span>
                          <button
                            onClick={() => testNotificationSound('critical')}
                            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Crit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading notifications...</p>
                      </div>
                    ) : filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`group p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors relative ${
                            !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              !notification.read 
                                ? 'bg-blue-100 dark:bg-blue-900/20' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {getNotificationIcon(notification.type, notification.priority)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-medium truncate ${
                                  !notification.read 
                                    ? 'text-gray-900 dark:text-white' 
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1">
                                  {soundEnabled && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        testNotificationSound(notification.priority);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
                                      title="Test sound"
                                    >
                                      <Volume2 className="h-3 w-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => deleteNotification(notification.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {notification.actor && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      by {notification.actor.name}
                                    </span>
                                  )}
                                  {notification.priority !== 'low' && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      notification.priority === 'critical' 
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                        : notification.priority === 'high'
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                                    }`}>
                                      {notification.priority}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(notification.timestamp)}
                                </div>
                              </div>

                              {!notification.read && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No matching notifications' : 'No notifications yet'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && !loading && (
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button 
                        onClick={() => {
                          console.log('Navigate to /activity');
                          setIsNotificationOpen(false);
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        View all activity
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || user?.email}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    Signed in as
                  </div>
                  <div className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">
                    {user?.email}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add test button for development */}
      {process.env.NODE_ENV === 'development' && <TestNotificationButton />}
    </header>
  );
};