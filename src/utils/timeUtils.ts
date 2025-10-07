export const formatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // If it's today, show time
  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // If it's yesterday
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  
  // If it's within a week, show day name
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // If it's this year, show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatRelativeTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return formatTime(dateString);
};

export const isToday = (dateString: string | Date): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

export const isYesterday = (dateString: string | Date): boolean => {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

export const formatChatTime = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  // Within this week
  const diffInDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // This year
  if (date.getFullYear() === new Date().getFullYear()) {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Different year
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    year: '2-digit'
  });
};