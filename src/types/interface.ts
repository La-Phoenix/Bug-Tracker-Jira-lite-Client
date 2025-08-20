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
  color?: string;
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

