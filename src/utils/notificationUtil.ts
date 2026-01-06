import type { Notification, NotificationType } from '../types/interface';

export interface NotificationData {
  issueId?: number;
  projectId?: number;
  roomId?: number;
  userId?: number;
  commentId?: number;
}

export const parseNotificationData = (notification: Notification): NotificationData | null => {
  if (!notification.data) return null;
  
  try {
    return JSON.parse(notification.data) as NotificationData;
  } catch (error) {
    console.error('Failed to parse notification data:', error);
    return null;
  }
};

export const getNotificationTypeLabel = (type: NotificationType): string => {
  switch (type) {
    case 'IssueAssigned': return 'Issue Assigned';
    case 'IssueCreated': return 'Issue Created';
    case 'IssueUpdated': return 'Issue Updated';
    case 'IssueCommented': return 'New Comment';
    case 'UserMentioned': return 'You were mentioned';
    case 'ProjectInvitation': return 'Project Invitation';
    case 'ProjectUpdate': return 'Project Update';
    case 'ChatMessage': return 'New Message';
    case 'ChatInvitation': return 'Chat Invitation';
    case 'ChatGroupCreated': return 'Group Created';
    case 'SystemAlert': return 'System Alert';
    case 'WeeklyDigest': return 'Weekly Digest';
    default: return 'Notification';
  }
};

export const shouldShowNotificationToast = (type: NotificationType): boolean => {
  // Don't show toast for digest notifications or low priority system alerts
  return type !== 'WeeklyDigest';
};

export const getNotificationUrl = (notification: Notification): string | null => {
  const data = parseNotificationData(notification);
  if (!data) return null;

  switch (notification.type) {
    case 'IssueAssigned':
    case 'IssueCreated':
    case 'IssueUpdated':
    case 'IssueCommented':
      return data.issueId ? `/issues/${data.issueId}` : null;
    
    case 'ProjectInvitation':
    case 'ProjectUpdate':
      return data.projectId ? `/projects/${data.projectId}` : null;
    
    case 'ChatMessage':
    case 'ChatInvitation':
    case 'ChatGroupCreated':
      return data.roomId ? `/chat/${data.roomId}` : null;
    
    case 'UserMentioned':
      if (data.issueId) return `/issues/${data.issueId}`;
      if (data.roomId) return `/chat/${data.roomId}`;
      return null;
    
    default:
      return null;
  }
};