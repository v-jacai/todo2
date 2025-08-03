// Component Registration - Clean setup
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            loading: false
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
            this.store.showError(message);
        },
        
        showSuccess(message) {
            this.store.showSuccess(message);
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
