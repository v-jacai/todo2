// Simple state management store
class TodoStore {
    constructor() {
        this.state = Vue.reactive({
            // Core data
            todos: [],
            categories: [],
            tags: [],
            stats: null,
            
            // UI state
            loading: false,
            error: '',
            success: '',
            sidebarOpen: false,
            viewMode: 'list',
            currentView: 'all',
            
            // Filtering and sorting
            filter: 'all',
            selectedCategory: null,
            sortBy: 'created_at',
            sortOrder: 'desc',
            
            // Pagination
            currentPage: 1,
            itemsPerPage: 20,
            
            // Todo creation
            newTodoText: '',
            showAdvancedForm: false,
            duplicateWarning: '',
            newTodo: {
                priority: 'medium',
                category_id: '',
                due_date: '',
                estimated_time: '',
                notes: ''
            },
            newTodoTags: '',
            
            // Editing
            editingId: null,
            editText: '',
            
            // Selection and bulk operations
            selectedTodos: [],
            
            // Modals
            showCategoryModal: false,
            showStatsModal: false,
            showDetailsModal: false,
            selectedTodo: null,
            
            // New category
            newCategory: {
                name: '',
                icon: '📋',
                color: '#3498db'
            }
        });
    }

    // Getters
    get filteredTodos() {
        let filtered = [...this.state.todos];
        
        // Filter by view
        switch (this.state.currentView) {
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(todo => todo.due_date === today);
                break;
            case 'upcoming':
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                filtered = filtered.filter(todo => 
                    todo.due_date && new Date(todo.due_date) >= tomorrow
                );
                break;
            case 'overdue':
                const now = new Date();
                filtered = filtered.filter(todo => 
                    todo.due_date && new Date(todo.due_date) < now && !todo.completed
                );
                break;
        }
        
        // Filter by category
        if (this.state.selectedCategory) {
            filtered = filtered.filter(todo => todo.category_id === this.state.selectedCategory);
        }
        
        // Filter by completion status
        if (this.state.filter === 'active') {
            filtered = filtered.filter(todo => !todo.completed);
        } else if (this.state.filter === 'completed') {
            filtered = filtered.filter(todo => todo.completed);
        }
        
        // Sort todos
        filtered.sort((a, b) => {
            let comparison = 0;
            
            switch (this.state.sortBy) {
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
                    comparison = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
                    break;
                case 'due_date':
                    comparison = new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
                    break;
                case 'created_at':
                default:
                    comparison = new Date(a.created_at) - new Date(b.created_at);
                    break;
            }
            
            return this.state.sortOrder === 'desc' ? -comparison : comparison;
        });
        
        return filtered;
    }

    get paginatedTodos() {
        const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
        return this.filteredTodos.slice(start, start + this.state.itemsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.filteredTodos.length / this.state.itemsPerPage);
    }

    get completedCount() {
        return this.state.todos.filter(todo => todo.completed).length;
    }

    get activeCount() {
        return this.state.todos.filter(todo => !todo.completed).length;
    }

    // Actions
    async loadTodos() {
        try {
            this.state.loading = true;
            this.state.error = '';
            this.state.todos = await apiService.getTodos();
        } catch (error) {
            this.state.error = 'Failed to load todos. Make sure the backend server is running.';
            console.error('Error loading todos:', error);
        } finally {
            this.state.loading = false;
        }
    }

    async loadCategories() {
        try {
            this.state.categories = await apiService.getCategories();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadTags() {
        try {
            this.state.tags = await apiService.getTags();
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    async loadStats() {
        try {
            this.state.stats = await apiService.getStats();
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async createTodo(todoData) {
        try {
            this.state.loading = true;
            
            // Check for duplicate todo
            if (this.isDuplicateTodo(todoData.text)) {
                this.showError('A todo with this text already exists!');
                return null;
            }
            
            // Add tags from the tags input
            if (this.state.newTodoTags) {
                todoData.tags = this.state.newTodoTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
            
            const newTodo = await apiService.createTodo(todoData);
            this.state.todos.unshift(newTodo);
            this.showSuccess('Todo added successfully!');
            this.loadStats(); // Refresh stats
            return newTodo;
        } catch (error) {
            this.state.error = 'Failed to create todo';
            console.error('Error creating todo:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    async updateTodo(id, todoData) {
        try {
            const updatedTodo = await apiService.updateTodo(id, todoData);
            const index = this.state.todos.findIndex(todo => todo.id === id);
            if (index !== -1) {
                this.state.todos[index] = updatedTodo;
            }
            this.showSuccess('Todo updated successfully!');
            this.loadStats(); // Refresh stats
            return updatedTodo;
        } catch (error) {
            this.state.error = 'Failed to update todo';
            console.error('Error updating todo:', error);
            throw error;
        }
    }

    async deleteTodo(id) {
        try {
            await apiService.deleteTodo(id);
            this.state.todos = this.state.todos.filter(todo => todo.id !== id);
            this.showSuccess('Todo deleted successfully!');
            this.loadStats(); // Refresh stats
        } catch (error) {
            this.state.error = 'Failed to delete todo';
            console.error('Error deleting todo:', error);
            throw error;
        }
    }

    async toggleTodo(id) {
        try {
            const todo = this.state.todos.find(t => t.id === id);
            if (!todo) return;
            
            const updatedTodo = await apiService.updateTodo(id, { completed: !todo.completed });
            const index = this.state.todos.findIndex(todo => todo.id === id);
            if (index !== -1) {
                this.state.todos[index] = updatedTodo;
            }
            this.loadStats(); // Refresh stats
        } catch (error) {
            this.state.error = 'Failed to toggle todo';
            console.error('Error toggling todo:', error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        try {
            const newCategory = await apiService.createCategory(categoryData);
            this.state.categories.push(newCategory);
            this.showSuccess('Category created successfully!');
            return newCategory;
        } catch (error) {
            this.state.error = 'Failed to create category';
            console.error('Error creating category:', error);
            throw error;
        }
    }

    // Selection and bulk operations
    toggleTodoSelection(todoId) {
        const index = this.state.selectedTodos.indexOf(todoId);
        if (index > -1) {
            this.state.selectedTodos.splice(index, 1);
        } else {
            this.state.selectedTodos.push(todoId);
        }
    }

    selectAllTodos() {
        this.state.selectedTodos = this.filteredTodos.map(todo => todo.id);
    }

    clearSelection() {
        this.state.selectedTodos = [];
    }

    async bulkMarkComplete(completed = true) {
        try {
            this.state.loading = true;
            const promises = this.state.selectedTodos.map(todoId => 
                apiService.updateTodo(todoId, { completed })
            );
            
            const updatedTodos = await Promise.all(promises);
            
            // Update todos in state with forced reactivity
            updatedTodos.forEach(updatedTodo => {
                const index = this.state.todos.findIndex(todo => todo.id === updatedTodo.id);
                if (index !== -1) {
                    // Use Vue.set or direct replacement to ensure reactivity
                    this.state.todos.splice(index, 1, updatedTodo);
                }
            });
            
            const action = completed ? 'completed' : 'marked as active';
            this.showSuccess(`${this.state.selectedTodos.length} todos ${action}!`);
            this.clearSelection();
            this.loadStats(); // Refresh stats
            
            // Force Vue to detect changes
            this.state.todos = [...this.state.todos];
        } catch (error) {
            this.state.error = 'Failed to update todos';
            console.error('Error in bulk operation:', error);
        } finally {
            this.state.loading = false;
        }
    }

    async bulkDelete() {
        try {
            this.state.loading = true;
            const promises = this.state.selectedTodos.map(todoId => 
                apiService.deleteTodo(todoId)
            );
            
            await Promise.all(promises);
            
            // Remove todos from state
            this.state.selectedTodos.forEach(todoId => {
                const index = this.state.todos.findIndex(todo => todo.id === todoId);
                if (index !== -1) {
                    this.state.todos.splice(index, 1);
                }
            });
            
            this.showSuccess(`${this.state.selectedTodos.length} todos deleted!`);
            this.clearSelection();
            this.loadStats(); // Refresh stats
        } catch (error) {
            this.state.error = 'Failed to delete todos';
            console.error('Error in bulk delete:', error);
        } finally {
            this.state.loading = false;
        }
    }

    // UI Actions
    toggleSidebar() {
        this.state.sidebarOpen = !this.state.sidebarOpen;
    }

    setView(view) {
        this.state.currentView = view;
        this.state.selectedCategory = null;
        this.state.currentPage = 1;
    }

    filterByCategory(categoryId) {
        this.state.selectedCategory = this.state.selectedCategory === categoryId ? null : categoryId;
        this.state.currentPage = 1;
    }

    toggleAdvancedForm() {
        this.state.showAdvancedForm = !this.state.showAdvancedForm;
    }

    toggleSortOrder() {
        this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    showTodoDetails(todo) {
        this.state.selectedTodo = todo;
        this.state.showDetailsModal = true;
    }

    resetNewTodo() {
        this.state.newTodoText = '';
        this.state.newTodoTags = '';
        this.state.duplicateWarning = '';
        this.state.newTodo = {
            priority: 'medium',
            category_id: '',
            due_date: '',
            estimated_time: '',
            notes: ''
        };
        this.state.showAdvancedForm = false;
    }

    resetNewCategory() {
        this.state.newCategory = {
            name: '',
            icon: '📋',
            color: '#3498db'
        };
    }

    // Selection and bulk operations
    toggleSelection(todoId) {
        const index = this.state.selectedTodos.indexOf(todoId);
        if (index > -1) {
            this.state.selectedTodos.splice(index, 1);
        } else {
            this.state.selectedTodos.push(todoId);
        }
    }

    toggleAllSelection() {
        if (this.state.selectedTodos.length === this.filteredTodos.length) {
            this.state.selectedTodos = [];
        } else {
            this.state.selectedTodos = this.filteredTodos.map(t => t.id);
        }
    }

    async bulkComplete() {
        if (this.state.selectedTodos.length === 0) return;
        
        try {
            this.state.loading = true;
            
            for (const todoId of this.state.selectedTodos) {
                const todo = this.state.todos.find(t => t.id === todoId);
                if (todo && !todo.completed) {
                    await this.updateTodo(todoId, { completed: true });
                }
            }
            
            this.state.selectedTodos = [];
            this.showSuccess('Todos marked as completed!');
            
        } catch (error) {
            console.error('Error bulk updating todos:', error);
            this.showError('Failed to update todos. Please try again.');
        } finally {
            this.state.loading = false;
        }
    }

    async bulkDelete() {
        if (this.state.selectedTodos.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${this.state.selectedTodos.length} todos?`)) return;
        
        try {
            this.state.loading = true;
            
            for (const todoId of this.state.selectedTodos) {
                await this.deleteTodo(todoId);
            }
            
            this.state.selectedTodos = [];
            this.showSuccess('Todos deleted successfully!');
            
        } catch (error) {
            console.error('Error deleting todos:', error);
            this.showError('Failed to delete todos. Please try again.');
        } finally {
            this.state.loading = false;
        }
    }

    // Edit functionality
    startEdit(todo) {
        this.state.editingId = todo.id;
        this.state.editText = todo.text;
        this.state.showDetailsModal = false;
    }

    async saveEdit(todoId) {
        if (!this.state.editText.trim()) {
            this.cancelEdit();
            return;
        }
        
        await this.updateTodo(todoId, { text: this.state.editText.trim() });
        this.cancelEdit();
    }

    cancelEdit() {
        this.state.editingId = null;
        this.state.editText = '';
    }

    showSuccess(message) {
        this.state.success = message;
        setTimeout(() => this.state.success = '', 3000);
    }

    showError(message) {
        this.state.error = message;
        setTimeout(() => this.state.error = '', 5000);
    }

    // Check if a todo with the same text already exists
    isDuplicateTodo(text) {
        if (!text || !text.trim()) return false;
        const trimmedText = text.trim().toLowerCase();
        return this.state.todos.some(todo => 
            todo.text.toLowerCase() === trimmedText
        );
    }

    // Check for duplicate and set warning
    checkDuplicateWarning(text) {
        if (this.isDuplicateTodo(text)) {
            this.state.duplicateWarning = 'A todo with this text already exists!';
        } else {
            this.state.duplicateWarning = '';
        }
    }
}

window.todoStore = new TodoStore();
