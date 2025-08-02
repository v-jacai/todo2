// API Service Layer - Cleaned up version
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return null;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Todo endpoints
    async getTodos() {
        return this.request('/todos');
    }

    async createTodo(todo) {
        return this.request('/todos', {
            method: 'POST',
            body: todo
        });
    }

    async updateTodo(id, todo) {
        return this.request(`/todos/${id}`, {
            method: 'PUT',
            body: todo
        });
    }

    async deleteTodo(id) {
        return this.request(`/todos/${id}`, {
            method: 'DELETE'
        });
    }

    // Check for duplicate todo
    async checkDuplicateTodo(text) {
        return this.request('/todos/check-duplicate', {
            method: 'POST',
            body: { text }
        });
    }

    // Category endpoints
    async getCategories() {
        return this.request('/categories');
    }

    async createCategory(category) {
        return this.request('/categories', {
            method: 'POST',
            body: category
        });
    }

    // Tag endpoints
    async getTags() {
        return this.request('/tags');
    }

    // Stats endpoint
    async getStats() {
        return this.request('/stats');
    }

    // Health check endpoint
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Create and expose the API service instance
window.apiService = new ApiService();
