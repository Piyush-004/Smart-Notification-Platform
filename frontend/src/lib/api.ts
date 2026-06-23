const API_BASE_URL = 'http://localhost:8000';

// Helper function to handle API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'An error occurred');
  }

  // For DELETE requests that might not return content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  // Employee login
  async loginEmployee(email: string, password: string) {
    return apiRequest<{ access_token: string }>('/auth/employee/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current employee
  async getCurrentEmployee() {
    return apiRequest<{
      employee_id: number;
      email: string;
      role: string;
    }>('/auth/employee/me');
  },

  // User login
  async loginUser(email: string, password: string) {
    return apiRequest<{ access_token: string }>('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get current user
  async getCurrentUser() {
    return apiRequest<{
      user_id: string;
      name: string;
      email: string;
      city: string | null;
      is_active: boolean;
    }>('/auth/user/me');
  },

  // User signup
  async signupUser(userData: {
    name: string;
    email: string;
    password: string;
    city?: string;
  }) {
    return apiRequest<{ user_id: string }>('/users/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// Add more API modules as needed
export const userApi = {
  // Add user-related API calls here
};

export const workspaceApi = {
  // Add workspace-related API calls here
};
