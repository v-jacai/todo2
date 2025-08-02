// Modal Components - Converted to Options API

// Category Modal Component
const CategoryModalComponent = {
    template: `
        <div v-if="store.state.showCategoryModal" class="modal-overlay" @click="closeModal">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>Add Category</h3>
                    <button @click="closeModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="form-group">
                        <label>Category Name</label>
                        <input 
                            type="text" 
                            v-model="store.state.newCategory.name" 
                            placeholder="Enter category name"
                            class="form-input"
                            ref="nameInput"
                            @keyup.enter="createCategory"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label>Icon</label>
                        <div class="icon-picker">
                            <input 
                                type="text" 
                                v-model="store.state.newCategory.icon" 
                                placeholder="Choose an icon"
                                class="form-input icon-input"
                            >
                            <div class="icon-suggestions">
                                <button 
                                    v-for="icon in iconSuggestions" 
                                    :key="icon"
                                    @click="selectIcon(icon)"
                                    class="icon-btn"
                                    :class="{ active: store.state.newCategory.icon === icon }"
                                >
                                    {{ icon }}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Color</label>
                        <div class="color-picker">
                            <input 
                                type="color" 
                                v-model="store.state.newCategory.color" 
                                class="form-input"
                            >
                            <div class="color-suggestions">
                                <button 
                                    v-for="color in colorSuggestions" 
                                    :key="color"
                                    @click="selectColor(color)"
                                    class="color-btn"
                                    :style="{ backgroundColor: color }"
                                    :class="{ active: store.state.newCategory.color === color }"
                                ></button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button @click="createCategory" class="btn btn-primary" :disabled="!store.state.newCategory.name.trim()">
                        <i class="fas fa-plus"></i> Add Category
                    </button>
                    <button @click="closeModal" class="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `,
    computed: {
        store() {
            return window.todoStore;
        },
        iconSuggestions() {
            return ['📋', '💼', '🏠', '🎯', '📚', '💡', '🎨', '🔧', '⚡', '🌟'];
        },
        colorSuggestions() {
            return ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22'];
        }
    },
    methods: {
        closeModal() {
            this.store.state.showCategoryModal = false;
            this.store.resetNewCategory();
        },

        async createCategory() {
            if (!this.store.state.newCategory.name.trim()) return;

            try {
                await this.store.createCategory(this.store.state.newCategory);
                this.closeModal();
            } catch (error) {
                console.error('Error creating category:', error);
            }
        },

        selectIcon(icon) {
            this.store.state.newCategory.icon = icon;
        },

        selectColor(color) {
            this.store.state.newCategory.color = color;
        }
    },
    
    watch: {
        'store.state.showCategoryModal'(show) {
            if (show) {
                this.$nextTick(() => {
                    if (this.$refs.nameInput) {
                        this.$refs.nameInput.focus();
                    }
                });
            }
        }
    }
};

// Stats Modal Component
const StatsModalComponent = {
    template: `
        <div v-if="store.state.showStatsModal" class="modal-overlay" @click="closeModal">
            <div class="modal modal-large" @click.stop>
                <div class="modal-header">
                    <h3>📊 Statistics</h3>
                    <button @click="closeModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" v-if="store.state.stats">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-tasks"></i>
                                </div>
                                <div class="stat-trend">
                                    <i class="fas fa-arrow-up"></i> +{{ store.state.stats.total_todos || 0 }}
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ store.state.stats.total_todos }}</div>
                                <div class="stat-label">Total Todos</div>
                                <div class="stat-description">All tasks in your workspace</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: '100%' }"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-trend">
                                    <i class="fas fa-arrow-up"></i> {{ Math.round(store.state.stats.completion_rate || 0) }}%
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ store.state.stats.completed_todos }}</div>
                                <div class="stat-label">Completed</div>
                                <div class="stat-description">Successfully finished tasks</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: store.state.stats.completion_rate + '%' }"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-trend">
                                    <i class="fas fa-arrow-up"></i> Active
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ store.state.stats.active_todos }}</div>
                                <div class="stat-label">Active</div>
                                <div class="stat-description">Tasks in progress</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: (store.state.stats.active_todos / store.state.stats.total_todos * 100) + '%' }"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="stat-trend down" v-if="store.state.stats.overdue_todos > 0">
                                    <i class="fas fa-arrow-down"></i> Overdue
                                </div>
                                <div class="stat-trend" v-else>
                                    <i class="fas fa-check"></i> On Track
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ store.state.stats.overdue_todos }}</div>
                                <div class="stat-label">Overdue</div>
                                <div class="stat-description">Tasks past due date</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: store.state.stats.overdue_todos > 0 ? (store.state.stats.overdue_todos / store.state.stats.total_todos * 100) + '%' : '0%' }"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-folder"></i>
                                </div>
                                <div class="stat-trend">
                                    <i class="fas fa-plus"></i> Categories
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ store.state.stats.total_categories }}</div>
                                <div class="stat-label">Categories</div>
                                <div class="stat-description">Organized task groups</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: Math.min(store.state.stats.total_categories * 20, 100) + '%' }"></div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon">
                                    <i class="fas fa-percentage"></i>
                                </div>
                                <div class="stat-trend">
                                    <i class="fas fa-chart-line"></i> Rate
                                </div>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">{{ Math.round(store.state.stats.completion_rate) }}%</div>
                                <div class="stat-label">Completion Rate</div>
                                <div class="stat-description">Overall productivity</div>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" :style="{ width: store.state.stats.completion_rate + '%' }"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-section" v-if="store.state.stats.category_distribution">
                        <h4>Category Distribution</h4>
                        <div class="category-stats">
                            <div 
                                v-for="cat in store.state.stats.category_distribution" 
                                :key="cat.name"
                                class="category-stat"
                            >
                                <span class="category-name">{{ cat.icon }} {{ cat.name }}</span>
                                <span class="category-count">{{ cat.count }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-section" v-if="store.state.stats.priority_distribution">
                        <h4>Priority Distribution</h4>
                        <div class="priority-stats">
                            <div 
                                v-for="priority in store.state.stats.priority_distribution" 
                                :key="priority.priority"
                                class="priority-stat"
                            >
                                <span class="priority-name">{{ priority.priority }}</span>
                                <span class="priority-count">{{ priority.count }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button @click="closeModal" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `,
    computed: {
        store() {
            return window.todoStore;
        }
    },
    methods: {
        closeModal() {
            this.store.state.showStatsModal = false;
        }
    }
};

// Todo Details Modal Component
const TodoDetailsModalComponent = {
    template: `
        <div v-if="store.state.selectedTodo" class="modal-overlay" @click="closeModal">
            <div class="modal modal-large" @click.stop>
                <div class="modal-header">
                    <h3>Todo Details</h3>
                    <button @click="closeModal" class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body" v-if="store.state.selectedTodo">
                    <div class="todo-details">
                        <h4>{{ store.state.selectedTodo.text }}</h4>
                        
                        <div class="detail-row">
                            <strong>Status:</strong>
                            <span :class="'status status-' + (store.state.selectedTodo.completed ? 'completed' : 'active')">
                                {{ store.state.selectedTodo.completed ? 'Completed' : 'Active' }}
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <strong>Priority:</strong>
                            <span :class="'priority priority-' + store.state.selectedTodo.priority">
                                {{ store.state.selectedTodo.priority }}
                            </span>
                        </div>
                        
                        <div class="detail-row" v-if="store.state.selectedTodo.category">
                            <strong>Category:</strong>
                            <span>{{ store.state.selectedTodo.category.icon }} {{ store.state.selectedTodo.category.name }}</span>
                        </div>
                        
                        <div class="detail-row" v-if="store.state.selectedTodo.due_date">
                            <strong>Due Date:</strong>
                            <span>{{ formatDate(store.state.selectedTodo.due_date) }}</span>
                        </div>
                        
                        <div class="detail-row" v-if="store.state.selectedTodo.tags && store.state.selectedTodo.tags.length">
                            <strong>Tags:</strong>
                            <div class="tags">
                                <span v-for="tag in store.state.selectedTodo.tags" :key="tag" class="tag">
                                    #{{ tag }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="detail-row" v-if="store.state.selectedTodo.notes">
                            <strong>Notes:</strong>
                            <p>{{ store.state.selectedTodo.notes }}</p>
                        </div>
                        
                        <div class="detail-row">
                            <strong>Created:</strong>
                            <span>{{ formatDate(store.state.selectedTodo.created_at) }}</span>
                        </div>
                        
                        <div class="detail-row" v-if="store.state.selectedTodo.completed_at">
                            <strong>Completed:</strong>
                            <span>{{ formatDate(store.state.selectedTodo.completed_at) }}</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button @click="editTodo" class="btn btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button @click="closeModal" class="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `,
    computed: {
        store() {
            return window.todoStore;
        }
    },
    methods: {
        closeModal() {
            this.store.state.selectedTodo = null;
        },

        editTodo() {
            this.store.startEdit(this.store.state.selectedTodo);
            this.closeModal();
        },

        formatDate(dateString) {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString();
        }
    }
};

// Main Modals Component
const ModalsComponent = {
    template: `
        <div>
            <category-modal-component></category-modal-component>
            <stats-modal-component></stats-modal-component>
            <todo-details-modal-component></todo-details-modal-component>
        </div>
    `,
    
    computed: {
        store() {
            return window.todoStore;
        }
    },
    
    components: {
        'category-modal-component': CategoryModalComponent,
        'stats-modal-component': StatsModalComponent,
        'todo-details-modal-component': TodoDetailsModalComponent
    }
};

// Make ModalsComponent globally available
window.ModalsComponent = ModalsComponent;
