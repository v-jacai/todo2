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
        const colors = {
            'low': '#28a745',
            'medium': '#ffc107', 
            'high': '#fd7e14',
            'urgent': '#dc3545'
        };
        return colors[priority] || '#6c757d';
    }

    static getPriorityIcon(priority) {
        const icons = {
            'low': '🟢',
            'medium': '🟡',
            'high': '🟠', 
            'urgent': '🔴'
        };
        return icons[priority] || '⚪';
    }

    static getPriorityOrder(priority) {
        const orders = {
            'low': 1,
            'medium': 2,
            'high': 3,
            'urgent': 4
        };
        return orders[priority] || 0;
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
}

// Make it available globally (for backward compatibility)
window.utils = Utils;
