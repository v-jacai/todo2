// Component Registration - Clean setup
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            loading: false,
            error: '',
            success: '',
             // Core data
            todos: [],
            categories: [],
            tags: [],
            stats: null,
            
            // UI state
            sidebarOpen: false,
            viewMode: 'list', // 'list' or 'grid'
            currentView: 'all', // 'all', 'today', 'upcoming', 'overdue'
            
            // Filtering and sorting
            filter: 'all', // 'all', 'active', 'completed'
            selectedCategory: null,
            sortBy: 'created_at',
            sortOrder: 'desc',
            
            // Pagination
            currentPage: 1,
            itemsPerPage: 20,
            
            // Todo creation
            newTodoText: '',
            showAdvancedForm: false,
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
        }
    },
    
    computed: {
        store() {
            return window.todoStore;
        }
    },
    
    methods: {
        async loadInitialData() {
            try {
                this.loading = true;
                this.error = '';
                
                const serverRunning = await window.apiService.checkHealth();
                if (!serverRunning) {
                    this.showError('Backend server is not running. Please start the Flask server.');
                    return;
                }
                
                await Promise.all([
                    this.store.loadTodos(),
                    this.store.loadCategories(),
                    this.store.loadTags(),
                    this.store.loadStats()
                ]);
                
                this.setupPeriodicRefresh();
                
            } catch (error) {
                console.error('Error loading initial data:', error);
                this.showError('Failed to load application data. Please check if the backend server is running.');
            } finally {
                this.loading = false;
            }
        },
        
        showError(message) {
            this.error = message;
            setTimeout(() => this.error = '', 5000);
        },
        
        showSuccess(message) {
            this.success = message;
            setTimeout(() => this.success = '', 3000);
        },
        
        setupPeriodicRefresh() {
            setInterval(() => {
                this.store.loadStats();
            }, 30000); // Every 30 seconds
        },
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                        case 'n':
                            e.preventDefault();
                            const quickInput = document.querySelector('.quick-input');
                            if (quickInput) quickInput.focus();
                            break;
                        case 'a':
                            if (this.store.filteredTodos.length > 0) {
                                e.preventDefault();
                                this.store.toggleAllSelection();
                            }
                            break;
                    }
                }
            });
        }
    },
    
    async mounted() {
        await this.loadInitialData();
        this.setupKeyboardShortcuts();
    }
});

// Register components
app.component('sidebar-component', SidebarComponent);
app.component('header-component', HeaderComponent);
app.component('add-todo-component', AddTodoComponent);
app.component('todo-item-component', TodoItemComponent);
app.component('todo-list-component', TodoListComponent);
app.component('modals-component', ModalsComponent);
app.component('notification-component', NotificationComponent);

// Mount the app
app.mount('#app');
