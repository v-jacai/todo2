// Utility functions - Cleaned and organized
class Utils {
    // Date utilities
    static formatDate(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            console.warn('Invalid date format:', dateString);
            return '';
        }
    }

    static formatDateTime(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleString();
        } catch (error) {
            console.warn('Invalid datetime format:', dateString);
            return '';
        }
    }

    static isToday(dateString) {
        if (!dateString) return false;
        const today = new Date().toISOString().split('T')[0];
        return dateString === today;
    }

    static isOverdue(todo) {
        if (!todo.due_date || todo.completed) return false;
        return new Date(todo.due_date) < new Date();
    }

    static getRelativeTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return this.formatDate(dateString);
    }

    // Priority utilities
    static getPriorityColor(priority) {
        return window.CONFIG?.PRIORITY_CONFIG[priority]?.color || '#6c757d';
    }

    static getPriorityIcon(priority) {
        return window.CONFIG?.PRIORITY_CONFIG[priority]?.icon || '⚪';
    }

    static getPriorityOrder(priority) {
        return window.CONFIG?.PRIORITY_CONFIG[priority]?.order || 0;
    }

    // Category utilities
    static getCategoryById(categories, id) {
        if (!categories || !id) return null;
        return categories.find(cat => cat.id === parseInt(id));
    }

    static getCategoryName(categories, id) {
        const category = this.getCategoryById(categories, id);
        return category ? category.name : '';
    }

    static getCategoryIcon(categories, id) {
        const category = this.getCategoryById(categories, id);
        return category ? category.icon : '';
    }

    // Tag utilities
    static parseTagString(tagString) {
        if (!tagString) return [];
        return tagString.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    static formatTags(tags) {
        if (!Array.isArray(tags)) return '';
        return tags.join(', ');
    }

    // Validation utilities
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static sanitizeHtml(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Debounce utility
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Deep clone utility
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === "object") {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = this.deepClone(obj[key]);
            });
            return copy;
        }
    }
}

// Make it available globally (for backward compatibility)
window.utils = Utils;
