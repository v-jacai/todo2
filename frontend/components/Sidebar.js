// Sidebar Component
const SidebarComponent = {
    template: `
        <div class="sidebar" :class="{ 'sidebar-open': store.state.sidebarOpen }">
            <div class="sidebar-header">
                <h2>📋 TodoPro</h2>
                <button @click="store.toggleSidebar()" class="sidebar-toggle">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="sidebar-section">
                <h3>Views</h3>
                <button @click="store.setView('all')" :class="{ active: store.state.currentView === 'all' }">
                    <i class="fas fa-list"></i> All Todos
                </button>
                <button @click="store.setView('today')" :class="{ active: store.state.currentView === 'today' }">
                    <i class="fas fa-calendar-day"></i> Today
                </button>
                <button @click="store.setView('upcoming')" :class="{ active: store.state.currentView === 'upcoming' }">
                    <i class="fas fa-calendar-alt"></i> Upcoming
                </button>
                <button @click="store.setView('overdue')" :class="{ active: store.state.currentView === 'overdue' }">
                    <i class="fas fa-exclamation-triangle"></i> Overdue
                </button>
            </div>

            <div class="sidebar-section">
                <h3>Categories</h3>
                <div class="category-list">
                    <button 
                        v-for="category in store.state.categories" 
                        :key="category.id"
                        @click="store.filterByCategory(category.id)"
                        :class="{ active: store.state.selectedCategory === category.id }"
                        class="category-item"
                    >
                        <span class="category-icon">{{ category.icon }}</span>
                        <span>{{ category.name }}</span>
                    </button>
                </div>
                <button @click="store.state.showCategoryModal = true" class="add-category-btn">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>

            <div class="sidebar-section">
                <h3>Statistics</h3>
                <div class="stats-summary" v-if="store.state.stats">
                    <div class="stat-item">
                        <span class="stat-number">{{ store.state.stats.total_todos }}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ store.state.stats.completed_todos }}</span>
                        <span class="stat-label">Done</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">{{ store.state.stats.completion_rate }}%</span>
                        <span class="stat-label">Rate</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        return {
            store: todoStore
        };
    }
};

// Make SidebarComponent globally available
window.SidebarComponent = SidebarComponent;
