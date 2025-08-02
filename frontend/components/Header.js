// Header Component
const HeaderComponent = {
    template: `
        <header class="app-header">
            <div class="header-left">
                <button @click="store.toggleSidebar()" class="menu-btn">
                    <i class="fas fa-bars"></i>
                </button>
                <h1>{{ getViewTitle() }}</h1>
            </div>
            <div class="header-right">
                <button @click="store.state.showStatsModal = true" class="stats-btn">
                    <i class="fas fa-chart-pie"></i> Stats
                </button>
                <div class="view-toggle">
                    <button @click="store.state.viewMode = 'list'" :class="{ active: store.state.viewMode === 'list' }">
                        <i class="fas fa-list"></i>
                    </button>
                    <button @click="store.state.viewMode = 'grid'" :class="{ active: store.state.viewMode === 'grid' }">
                        <i class="fas fa-th"></i>
                    </button>
                </div>
            </div>
        </header>
    `,
    setup() {
        const store = todoStore;

        const getViewTitle = () => {
            if (store.state.selectedCategory) {
                const category = utils.getCategoryById(store.state.categories, store.state.selectedCategory);
                return category ? `${category.icon} ${category.name}` : 'Category';
            }
            
            switch (store.state.currentView) {
                case 'today': return '📅 Today';
                case 'upcoming': return '📆 Upcoming';
                case 'overdue': return '⚠️ Overdue';
                default: return '📋 All Todos';
            }
        };

        return {
            store,
            getViewTitle
        };
    }
};

// Make HeaderComponent globally available
window.HeaderComponent = HeaderComponent;
