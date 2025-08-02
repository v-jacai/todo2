// Todo List Component
const TodoListComponent = {
    template: `
        <div class="todo-section">
            <!-- Bulk Actions Bar -->
            <div v-if="store.state.selectedTodos.length > 0" class="bulk-actions-bar">
                <div class="bulk-actions-info">
                    <span class="selected-count">{{ store.state.selectedTodos.length }} selected</span>
                    <button @click="store.selectAllTodos()" class="select-all-btn" v-if="store.state.selectedTodos.length < store.filteredTodos.length">
                        Select All ({{ store.filteredTodos.length }})
                    </button>
                    <button @click="store.clearSelection()" class="clear-selection-btn">
                        Clear Selection
                    </button>
                </div>
                <div class="bulk-actions-buttons">
                    <button @click="bulkMarkComplete" class="bulk-btn complete-btn">
                        <i class="fas fa-check"></i> Mark Complete
                    </button>
                    <button @click="bulkMarkActive" class="bulk-btn active-btn">
                        <i class="fas fa-undo"></i> Mark Active
                    </button>
                    <button @click="bulkDelete" class="bulk-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>

            <!-- Filters and Controls -->
            <div class="todo-controls">
                <div class="filter-tabs">
                    <button 
                        @click="store.state.filter = 'all'" 
                        :class="{ active: store.state.filter === 'all' }"
                    >
                        All ({{ store.state.todos.length }})
                    </button>
                    <button 
                        @click="store.state.filter = 'active'" 
                        :class="{ active: store.state.filter === 'active' }"
                    >
                        Active ({{ store.activeCount }})
                    </button>
                    <button 
                        @click="store.state.filter = 'completed'" 
                        :class="{ active: store.state.filter === 'completed' }"
                    >
                        Completed ({{ store.completedCount }})
                    </button>
                </div>
                
                <div class="sort-controls">
                    <select v-model="store.state.sortBy" class="sort-select">
                        <option value="created_at">Date Created</option>
                        <option value="text">Name</option>
                        <option value="priority">Priority</option>
                        <option value="due_date">Due Date</option>
                    </select>
                    <button 
                        @click="toggleSortOrder" 
                        class="sort-order-btn"
                        :title="store.state.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
                    >
                        <i :class="store.state.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    </button>
                </div>
            </div>

            <!-- Todo List -->
            <div class="todo-list" :class="{ 'todo-grid': store.state.viewMode === 'grid' }">
                <div v-if="store.state.loading" class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Loading todos...
                </div>
                
                <div v-else-if="store.paginatedTodos.length === 0" class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>{{ getEmptyMessage() }}</h3>
                    <p>{{ getEmptySubMessage() }}</p>
                </div>
                
                <todo-item
                    v-else
                    v-for="todo in store.paginatedTodos"
                    :key="todo.id"
                    :todo="todo"
                    :view-mode="store.state.viewMode"
                ></todo-item>
            </div>

            <!-- Pagination -->
            <div v-if="store.totalPages > 1" class="pagination">
                <button 
                    @click="store.state.currentPage--" 
                    :disabled="store.state.currentPage === 1"
                    class="pagination-btn"
                >
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <span class="pagination-info">
                    Page {{ store.state.currentPage }} of {{ store.totalPages }}
                </span>
                
                <button 
                    @click="store.state.currentPage++" 
                    :disabled="store.state.currentPage === store.totalPages"
                    class="pagination-btn"
                >
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `,
    components: {
        TodoItem: TodoItemComponent
    },
    setup() {
        const store = todoStore;

        const toggleSortOrder = () => {
            store.state.sortOrder = store.state.sortOrder === 'asc' ? 'desc' : 'asc';
        };

        const getEmptyMessage = () => {
            if (store.state.filter === 'completed') return 'No completed todos';
            if (store.state.filter === 'active') return 'No active todos';
            if (store.state.currentView === 'today') return 'No todos for today';
            if (store.state.currentView === 'upcoming') return 'No upcoming todos';
            if (store.state.currentView === 'overdue') return 'No overdue todos';
            if (store.state.selectedCategory) return 'No todos in this category';
            return 'No todos yet';
        };

        const getEmptySubMessage = () => {
            if (store.state.filter === 'completed') return 'Complete some todos to see them here.';
            if (store.state.currentView === 'today') return 'Nothing scheduled for today!';
            return 'Add your first todo to get started.';
        };

        const bulkMarkComplete = async () => {
            if (confirm(`Mark ${store.state.selectedTodos.length} todos as complete?`)) {
                try {
                    await store.bulkMarkComplete(true);
                    // Force re-render by updating a reactive property
                    await store.loadTodos();
                } catch (error) {
                    console.error('Error in bulk mark complete:', error);
                }
            }
        };

        const bulkMarkActive = async () => {
            if (confirm(`Mark ${store.state.selectedTodos.length} todos as active?`)) {
                try {
                    await store.bulkMarkComplete(false);
                    // Force re-render by updating a reactive property
                    await store.loadTodos();
                } catch (error) {
                    console.error('Error in bulk mark active:', error);
                }
            }
        };

        const bulkDelete = async () => {
            if (confirm(`Delete ${store.state.selectedTodos.length} todos? This action cannot be undone.`)) {
                try {
                    await store.bulkDelete();
                    // Force re-render by updating a reactive property
                    await store.loadTodos();
                } catch (error) {
                    console.error('Error in bulk delete:', error);
                }
            }
        };

        return {
            store,
            toggleSortOrder,
            getEmptyMessage,
            getEmptySubMessage,
            bulkMarkComplete,
            bulkMarkActive,
            bulkDelete
        };
    }
};

// Make TodoListComponent globally available
window.TodoListComponent = TodoListComponent;
