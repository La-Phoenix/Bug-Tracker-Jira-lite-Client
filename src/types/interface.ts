export interface CreateIssueRequest {
  title: string;
  description: string;
  reporterId: number;
  assigneeId: number;
  projectId: number;
  statusId: number;
  priorityId: number;
  labelIds: number[];
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  reporterId: number;
  reporterName: string;
  assigneeId: number;
  assigneeName: string;
  projectId: number;
  projectName: string;
  statusId: number;
  statusName: string;
  priorityId: number;
  priorityName: string;
  createdAt: string;
  updatedAt: string;
  labels: Label[];
}

export interface Label {
  id: number;
  name: string;
  color: string;
  description?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  statusCode: number;
  message: string;
  errors: string[];
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface Status {
  id: number;
  name: string;
}

export interface Priority {
  id: number;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  token: string;
  roles: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  role?: "Admin" | "User";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UpdateIssueRequest {
  id: number;
  title: string;
  description: string;
  assigneeId: number;
  statusId: number;
  priorityId: number;
  labelIds: number[];
}


// Chat
export interface ChatRoom {
  id: number;
  name: string;
  type: 'direct' | 'group' | 'project';
  description?: string;
  projectId?: number;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: number;
  userName: string;
  userEmail: string;
  role: 'Admin' | 'Member';
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  replyTo?: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRoomRequest {
  name: string;
  type: 'direct' | 'group' | 'project';
  description?: string;
  projectId?: number;
  participantIds: number[];
}

export interface SendMessageRequest {
  roomId: number;
  content: string;
  type: 'text' | 'file' | 'image';
  replyTo?: number;
  fileData?: File;
}

// Admin
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  activeProjects: number;
  totalIssues: number;
  resolvedIssues: number;
  systemHealth: number;
  storageUsed: number;
  storageLimit: number;
}

export interface SystemActivity {
  id: number;
  type: 'user_login' | 'user_registered' | 'project_created' | 'issue_created' | 'system_event';
  description: string;
  userId?: number;
  userName?: string;
  timestamp: string;
  metadata?: any;
}

export interface UserActivity {
  userId: number;
  userName: string;
  userEmail: string;
  lastLogin: string;
  issuesCreated: number;
  issuesResolved: number;
  projectsCount: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface ProjectActivity {
  projectId: number;
  projectName: string;
  createdBy: string;
  membersCount: number;
  issuesCount: number;
  completionRate: number;
  lastActivity: string;
  status: 'active' | 'completed' | 'archived';
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  database: number;
  apiResponseTime: number;
  uptime: string;
  lastChecked: string;
}