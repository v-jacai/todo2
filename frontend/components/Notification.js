// Notification Component
const NotificationComponent = {
    template: `
        <div class="notifications">
            <div v-if="store.state.error" class="notification error" @click="store.state.error = ''">
                <i class="fas fa-exclamation-circle"></i>
                {{ store.state.error }}
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div v-if="store.state.success" class="notification success" @click="store.state.success = ''">
                <i class="fas fa-check-circle"></i>
                {{ store.state.success }}
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `,
    setup() {
        return {
            store: todoStore
        };
    }
};

// Make NotificationComponent globally available
window.NotificationComponent = NotificationComponent;
