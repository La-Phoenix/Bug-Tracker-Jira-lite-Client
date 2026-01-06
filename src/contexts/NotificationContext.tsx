import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { NotificationService } from '../services/NotificationService';
import type { Notification } from '../types/interface';
import { useToast } from '../hooks/useToast';
import { shouldShowNotificationToast } from '../utils/notificationUtil';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

type NotificationAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UNREAD_COUNT'; payload: number };

interface NotificationContextType extends NotificationState {
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  connectNotifications: () => Promise<void>;
  disconnectNotifications: () => Promise<void>;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  isLoading: false,
  error: null
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_NOTIFICATIONS':
      // Ensure payload is an array and has filter method
      const notifications = Array.isArray(action.payload) ? action.payload : [];
      console.log("SET_NOTIFICATIONS notifications", notifications)
      return { 
        ...state, 
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      };
    
    case 'ADD_NOTIFICATION':
      if (!action.payload) return state;
      const newNotifications = [action.payload, ...state.notifications];
      console.log("ADD_NOTIFICATION: ", newNotifications)
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      };
    
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, isRead: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      };
    
    case 'MARK_ALL_AS_READ':
      const allReadNotifications = state.notifications.map(n => ({ ...n, isRead: true }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0
      };
    
    case 'DELETE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.isRead).length
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    
    default:
      return state;
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { showToast } = useToast();
  const isInitializedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await NotificationService.getNotifications();
      
      if (response.success && response.data) {
        // Ensure we have a notifications array
        console.log("notifications: ", response.data)
        const notifications = response.data || [];
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_ERROR', payload: null });
      } else {
        const errorMessage = response.message || 'Failed to load notifications';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        // Set empty array on error to prevent filter issues
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      // Set empty array on error to prevent filter issues
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Connect to SignalR notifications
  const connectNotifications = useCallback(async () => {
    try {
      await NotificationService.initializeNotificationConnection();
      dispatch({ type: 'SET_CONNECTED', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Set up event listeners
      NotificationService.onNotificationReceived((notification: Notification) => {
        if (notification) {
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          
          // Show toast notification if appropriate
          if (shouldShowNotificationToast(notification.type)) {
            showToast(
              notification.title,
              notification.message,
              notification.type,
              notification.priority,
              {
                duration: notification.priority === 'Critical' ? 8000 : 4000
              }
            );
          }
        }
      });

      NotificationService.onNotificationRead((notificationId: number) => {
        if (typeof notificationId === 'number') {
          dispatch({ type: 'MARK_AS_READ', payload: notificationId });
        }
      });

      NotificationService.onNotificationDeleted((notificationId: number) => {
        if (typeof notificationId === 'number') {
          dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
        }
      });

    } catch (error) {
      console.error('Failed to connect notifications:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to real-time notifications' });
      dispatch({ type: 'SET_CONNECTED', payload: false });
    }
  }, [showToast]);

  // Disconnect from SignalR
  const disconnectNotifications = useCallback(async () => {
    try {
      NotificationService.offNotificationReceived();
      NotificationService.offNotificationRead();
      NotificationService.offNotificationDeleted();
      await NotificationService.disconnectNotifications();
      dispatch({ type: 'SET_CONNECTED', payload: false });
    } catch (error) {
      console.error('Failed to disconnect notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      if (response.success) {
        dispatch({ type: 'MARK_AS_READ', payload: notificationId });
        // Also mark as read via SignalR
        NotificationService.markNotificationAsReadViaSignalR(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      if (response.success) {
        dispatch({ type: 'MARK_ALL_AS_READ' });
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const response = await NotificationService.deleteNotification(notificationId);
      if (response.success) {
        dispatch({ type: 'DELETE_NOTIFICATION', payload: notificationId });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && !isInitializedRef.current) {
      isInitializedRef.current = true;
      
      const initializeNotifications = async () => {
        try {
          await loadNotifications();
          await connectNotifications();
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      };

      initializeNotifications();

      // Set up cleanup function
      cleanupRef.current = () => {
        disconnectNotifications();
        isInitializedRef.current = false;
      };
    }

    // Cleanup when token is removed (logout)
    if (!token && isInitializedRef.current) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      dispatch({ type: 'SET_CONNECTED', payload: false });
      dispatch({ type: 'SET_ERROR', payload: null });
      isInitializedRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (isInitializedRef.current) {
        cleanupRef.current?.();
      }
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Listen for token changes separately
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token && isInitializedRef.current) {
        cleanupRef.current?.();
        cleanupRef.current = null;
        dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        dispatch({ type: 'SET_CONNECTED', payload: false });
        dispatch({ type: 'SET_ERROR', payload: null });
        isInitializedRef.current = false;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: NotificationContextType = {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    connectNotifications,
    disconnectNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};