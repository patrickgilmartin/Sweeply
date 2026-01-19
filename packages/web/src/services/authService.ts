/**
 * Authentication service
 * Handles user authentication and session management
 */

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Store auth token in localStorage
 */
function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Remove auth token from localStorage
 */
function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  const result: AuthResponse = await response.json();
  setAuthToken(result.token);
  return result;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  const result: AuthResponse = await response.json();
  setAuthToken(result.token);
  return result;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  removeAuthToken();
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return null;
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    removeAuthToken();
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get auth token for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
}
