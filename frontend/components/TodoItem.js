// Todo Item Component
const TodoItemComponent = {
    props: ['todo', 'viewMode'],
    template: `
        <div class="todo-item" :class="{ 
            'todo-completed': todo.completed, 
            'todo-overdue': isOverdue(todo),
            'todo-grid': viewMode === 'grid',
            'selected': isSelected
        }">
            <div class="todo-check">
                <input 
                    type="checkbox" 
                    :checked="isSelected" 
                    @change="toggleSelection"
                    :id="'select-' + todo.id"
                >
                <label :for="'select-' + todo.id"></label>
            </div>
            
            <div class="todo-content" @dblclick="showDetails" title="Double-click to view details">
                <div class="todo-text" v-if="!isEditing">
                    <span class="todo-title" :class="{ 'completed': todo.completed }">{{ todo.text }}</span>
                    <div class="todo-meta" v-if="hasMeta">
                        <span v-if="todo.due_date" class="todo-due-date" :class="{ 'overdue': isOverdue(todo) }">
                            <i class="fas fa-calendar"></i> {{ formatDate(todo.due_date) }}
                        </span>
                        <span v-if="categoryName" class="todo-category">
                            <span class="category-icon">{{ category.icon }}</span>
                            {{ category.name }}
                        </span>
                        <span v-if="todo.estimated_time" class="todo-time">
                            <i class="fas fa-clock"></i> {{ todo.estimated_time }}
                        </span>
                    </div>
                    <div class="todo-tags" v-if="todo.tags && todo.tags.length">
                        <span v-for="tag in todo.tags" :key="tag" class="tag">{{ tag }}</span>
                    </div>
                </div>
                
                <div class="todo-edit" v-else>
                    <input 
                        v-model="editText" 
                        @keyup.enter="saveEdit" 
                        @keyup.escape="cancelEdit"
                        @blur="saveEdit"
                        ref="editInput"
                        class="todo-edit-input"
                    >
                </div>
            </div>
            
            <div class="todo-actions">
                <button @click="toggleTodo" class="action-btn complete-btn" :class="{ 'completed': todo.completed }" :title="todo.completed ? 'Mark as Active' : 'Mark as Complete'">
                    <i :class="todo.completed ? 'fas fa-undo' : 'fas fa-check'"></i>
                </button>
                <button @click="startEdit" class="action-btn edit-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTodo" class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `,
    setup(props, { emit }) {
        const store = todoStore;
        const editText = Vue.ref('');
        const localIsEditing = Vue.ref(false);
        const editInput = Vue.ref(null);

        const category = Vue.computed(() => {
            return utils.getCategoryById(store.state.categories, props.todo.category_id);
        });

        const categoryName = Vue.computed(() => {
            return category.value ? category.value.name : '';
        });

        const hasMeta = Vue.computed(() => {
            return props.todo.due_date || categoryName.value || props.todo.estimated_time;
        });

        // Check if this todo is being edited (either locally or globally)
        const isEditing = Vue.computed(() => {
            return localIsEditing.value || store.state.editingId === props.todo.id;
        });

        // Check if this todo is selected
        const isSelected = Vue.computed(() => {
            return store.state.selectedTodos.includes(props.todo.id);
        });

        const toggleSelection = () => {
            store.toggleSelection(props.todo.id);
        };

        const toggleTodo = async () => {
            await store.toggleTodo(props.todo.id);
        };

        const deleteTodo = async () => {
            if (confirm('Are you sure you want to delete this todo?')) {
                await store.deleteTodo(props.todo.id);
            }
        };

        const startEdit = () => {
            editText.value = props.todo.text;
            localIsEditing.value = true;
            // Also set global editing state
            store.state.editingId = props.todo.id;
            store.state.editText = props.todo.text;
            Vue.nextTick(() => {
                editInput.value?.focus();
            });
        };

        const saveEdit = async () => {
            if (editText.value.trim() && editText.value !== props.todo.text) {
                await store.updateTodo(props.todo.id, { text: editText.value.trim() });
            }
            localIsEditing.value = false;
            // Clear global editing state
            store.state.editingId = null;
            store.state.editText = '';
        };

        const cancelEdit = () => {
            localIsEditing.value = false;
            // Clear global editing state
            store.state.editingId = null;
            store.state.editText = '';
        };

        const showDetails = () => {
            if (!isEditing.value) {
                store.state.selectedTodo = props.todo;
                store.state.showDetailsModal = true;
            }
        };

        // Watch for global editing state changes
        Vue.watch(() => store.state.editingId, (newEditingId) => {
            if (newEditingId === props.todo.id && !localIsEditing.value) {
                // This todo is being edited from outside (e.g., details modal)
                editText.value = store.state.editText || props.todo.text;
                Vue.nextTick(() => {
                    editInput.value?.focus();
                });
            }
        });

        const formatDate = utils.formatDate;
        const isOverdue = utils.isOverdue;
        const getPriorityColor = utils.getPriorityColor;
        const getPriorityIcon = utils.getPriorityIcon;

        return {
            store,
            editText,
            localIsEditing,
            isEditing,
            isSelected,
            editInput,
            category,
            categoryName,
            hasMeta,
            toggleSelection,
            toggleTodo,
            deleteTodo,
            startEdit,
            saveEdit,
            cancelEdit,
            showDetails,
            formatDate,
            isOverdue,
            getPriorityColor,
            getPriorityIcon
        };
    }
};

// Make TodoItemComponent globally available
window.TodoItemComponent = TodoItemComponent;
