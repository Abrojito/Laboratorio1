// src/api/config.ts
export const BASE = 'http://localhost:8080';
export const API_URL = 'http://localhost:8080/users';
export const AUTH_URL = 'http://localhost:8080/auth';
export const INGREDIENT_URL = 'http://localhost:8080/ingredients';

export const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
        ...options.headers,
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
    };

    return fetch(`${BASE}/api${endpoint}`, {
        ...options,
        headers,
    });
};
