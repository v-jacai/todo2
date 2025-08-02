// Add Todo Component
const AddTodoComponent = {
    template: `
        <div class="add-todo-section">
            <!-- Quick Add Form -->
            <div class="quick-add-form">
                <div class="input-group">
                    <input 
                        type="text"
                        v-model="store.state.newTodoText"
                        @keyup.enter="addQuickTodo"
                        placeholder="Add a new todo..."
                        class="todo-input"
                        :disabled="store.state.loading"
                    >
                    <button 
                        @click="addQuickTodo" 
                        class="add-btn"
                        :disabled="!store.state.newTodoText.trim() || store.state.loading"
                    >
                        <i class="fas fa-plus"></i>
                    </button>
                    <button 
                        @click="store.state.showAdvancedForm = !store.state.showAdvancedForm" 
                        class="advanced-btn"
                        :class="{ active: store.state.showAdvancedForm }"
                    >
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>

            <!-- Advanced Form -->
            <div v-if="store.state.showAdvancedForm" class="advanced-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Priority</label>
                        <select v-model="store.state.newTodo.priority" class="form-select">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Category</label>
                        <select v-model="store.state.newTodo.category_id" class="form-select">
                            <option value="">No Category</option>
                            <option 
                                v-for="category in store.state.categories" 
                                :key="category.id" 
                                :value="category.id"
                            >
                                {{ category.icon }} {{ category.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Due Date</label>
                        <input 
                            type="date" 
                            v-model="store.state.newTodo.due_date" 
                            class="form-input"
                            :min="today"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label>Estimated Time</label>
                        <input 
                            type="text" 
                            v-model="store.state.newTodo.estimated_time" 
                            placeholder="e.g., 30 min, 2 hours"
                            class="form-input"
                        >
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Tags (comma separated)</label>
                        <input 
                            type="text" 
                            v-model="store.state.newTodoTags" 
                            placeholder="work, urgent, meeting"
                            class="form-input"
                        >
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group full-width">
                        <label>Notes</label>
                        <textarea 
                            v-model="store.state.newTodo.notes" 
                            placeholder="Additional notes..."
                            class="form-textarea"
                            rows="3"
                        ></textarea>
                    </div>
                </div>

                <div class="form-actions">
                    <button @click="addAdvancedTodo" class="btn btn-primary" :disabled="!store.state.newTodoText.trim()">
                        <i class="fas fa-plus"></i> Add Todo
                    </button>
                    <button @click="resetForm" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Clear
                    </button>
                </div>
            </div>
        </div>
    `,
    setup() {
        const store = todoStore;
        const today = new Date().toISOString().split('T')[0];

        const addQuickTodo = async () => {
            if (!store.state.newTodoText.trim()) return;

            const todoData = {
                text: store.state.newTodoText.trim(),
                priority: 'medium'
            };

            try {
                await store.createTodo(todoData);
                store.resetNewTodo();
            } catch (error) {
                console.error('Error creating todo:', error);
            }
        };

        const addAdvancedTodo = async () => {
            if (!store.state.newTodoText.trim()) return;

            const todoData = {
                text: store.state.newTodoText.trim(),
                priority: store.state.newTodo.priority,
                category_id: store.state.newTodo.category_id || null,
                due_date: store.state.newTodo.due_date || null,
                estimated_time: store.state.newTodo.estimated_time || null,
                notes: store.state.newTodo.notes || null,
                tags: utils.parseTagString(store.state.newTodoTags)
            };

            try {
                await store.createTodo(todoData);
                store.resetNewTodo();
            } catch (error) {
                console.error('Error creating todo:', error);
            }
        };

        const resetForm = () => {
            store.resetNewTodo();
        };

        return {
            store,
            today,
            addQuickTodo,
            addAdvancedTodo,
            resetForm
        };
    }
};

// Make AddTodoComponent globally available
window.AddTodoComponent = AddTodoComponent;
