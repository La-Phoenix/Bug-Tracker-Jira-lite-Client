export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    id: string;
    email: string;
    token: string;
    roles: string;
  }
  errors?: string[];
}
