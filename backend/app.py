from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import uuid
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database file paths
DB_FILE = 'todos.json'
CATEGORIES_FILE = 'categories.json'
TAGS_FILE = 'tags.json'

def load_todos():
    """Load todos from JSON file"""
    if not os.path.exists(DB_FILE):
        return []
    
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_todos(todos):
    """Save todos to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(todos, f, indent=2)

def load_categories():
    """Load categories from JSON file"""
    if not os.path.exists(CATEGORIES_FILE):
        default_categories = [
            {"id": 1, "name": "Work", "color": "#3498db", "icon": "💼"},
            {"id": 2, "name": "Personal", "color": "#e74c3c", "icon": "🏠"},
            {"id": 3, "name": "Shopping", "color": "#f39c12", "icon": "🛒"},
            {"id": 4, "name": "Health", "color": "#27ae60", "icon": "🏥"}
        ]
        save_categories(default_categories)
        return default_categories
    
    try:
        with open(CATEGORIES_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_categories(categories):
    """Save categories to JSON file"""
    with open(CATEGORIES_FILE, 'w') as f:
        json.dump(categories, f, indent=2)

def load_tags():
    """Load tags from JSON file"""
    if not os.path.exists(TAGS_FILE):
        return []
    
    try:
        with open(TAGS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

def save_tags(tags):
    """Save tags to JSON file"""
    with open(TAGS_FILE, 'w') as f:
        json.dump(tags, f, indent=2)

def extract_tags_from_text(text):
    """Extract tags from todo text (words starting with #)"""
    tag_pattern = r'#(\w+)'
    return re.findall(tag_pattern, text.lower())

def get_priority_emoji(priority):
    """Get emoji representation of priority"""
    priority_map = {
        "low": "🟢",
        "medium": "🟡", 
        "high": "🟠",
        "urgent": "🔴"
    }
    return priority_map.get(priority, "⚪")

def get_next_id(todos):
    """Get the next available ID"""
    if not todos:
        return 1
    return max(todo['id'] for todo in todos) + 1

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos with optional filtering"""
    todos = load_todos()
    
    # Filter by category
    category = request.args.get('category')
    if category:
        todos = [todo for todo in todos if todo.get('category_id') == int(category)]
    
    # Filter by priority
    priority = request.args.get('priority')
    if priority:
        todos = [todo for todo in todos if todo.get('priority') == priority]
    
    # Filter by tag
    tag = request.args.get('tag')
    if tag:
        todos = [todo for todo in todos if tag.lower() in [t.lower() for t in todo.get('tags', [])]]
    
    # Sort by due date, priority, or creation date
    sort_by = request.args.get('sort', 'created_at')
    reverse = request.args.get('order', 'desc') == 'desc'
    
    if sort_by == 'due_date':
        todos.sort(key=lambda x: x.get('due_date') or '9999-12-31', reverse=reverse)
    elif sort_by == 'priority':
        priority_order = {'urgent': 4, 'high': 3, 'medium': 2, 'low': 1}
        todos.sort(key=lambda x: priority_order.get(x.get('priority', 'low'), 1), reverse=reverse)
    else:
        todos.sort(key=lambda x: x.get(sort_by, ''), reverse=reverse)
    
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo with enhanced features"""
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    
    todos = load_todos()
    
    # Extract tags from text
    extracted_tags = extract_tags_from_text(data['text'])
    
    # Merge with provided tags
    all_tags = list(set(extracted_tags + data.get('tags', [])))
    
    # Update global tags list
    existing_tags = load_tags()
    for tag in all_tags:
        if tag not in existing_tags:
            existing_tags.append(tag)
    save_tags(existing_tags)
    
    new_todo = {
        'id': get_next_id(todos),
        'text': data['text'].strip(),
        'completed': False,
        'created_at': datetime.now().isoformat(),
        'updated_at': datetime.now().isoformat(),
        'priority': data.get('priority', 'medium'),
        'due_date': data.get('due_date'),
        'category_id': data.get('category_id'),
        'tags': all_tags,
        'notes': data.get('notes', ''),
        'estimated_time': data.get('estimated_time'),  # in minutes
        'actual_time': 0,
        'subtasks': data.get('subtasks', []),
        'reminder': data.get('reminder'),
        'recurring': data.get('recurring', False),
        'recurring_pattern': data.get('recurring_pattern'),  # daily, weekly, monthly
        'uuid': str(uuid.uuid4())
    }
    
    todos.append(new_todo)
    save_todos(todos)
    
    return jsonify(new_todo), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo with enhanced features"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    todos = load_todos()
    
    # Find the todo to update
    todo_index = None
    for i, todo in enumerate(todos):
        if todo['id'] == todo_id:
            todo_index = i
            break
    
    if todo_index is None:
        return jsonify({'error': 'Todo not found'}), 404
    
    # Update the todo
    todo = todos[todo_index]
    todo['updated_at'] = datetime.now().isoformat()
    
    if 'text' in data:
        todo['text'] = data['text'].strip()
        # Re-extract tags if text changed
        extracted_tags = extract_tags_from_text(data['text'])
        existing_tags = todo.get('tags', [])
        todo['tags'] = list(set(extracted_tags + existing_tags))
    
    if 'completed' in data:
        todo['completed'] = bool(data['completed'])
        if todo['completed']:
            todo['completed_at'] = datetime.now().isoformat()
        else:
            todo.pop('completed_at', None)
    
    # Update other fields
    updatable_fields = ['priority', 'due_date', 'category_id', 'notes', 
                       'estimated_time', 'actual_time', 'subtasks', 'reminder',
                       'recurring', 'recurring_pattern']
    
    for field in updatable_fields:
        if field in data:
            todo[field] = data[field]
    
    if 'tags' in data:
        todo['tags'] = data['tags']
        # Update global tags
        existing_tags = load_tags()
        for tag in data['tags']:
            if tag not in existing_tags:
                existing_tags.append(tag)
        save_tags(existing_tags)
    
    save_todos(todos)
    
    return jsonify(todo)

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    todos = load_todos()
    
    # Find and remove the todo
    original_length = len(todos)
    todos = [todo for todo in todos if todo['id'] != todo_id]
    
    if len(todos) == original_length:
        return jsonify({'error': 'Todo not found'}), 404
    
    save_todos(todos)
    
    return jsonify({'message': 'Todo deleted successfully'})

@app.route('/api/todos/check-duplicate', methods=['POST'])
def check_duplicate_todo():
    """Check if a todo with the given text already exists"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text_to_check = data['text'].strip().lower()
        if not text_to_check:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        todos = load_todos()
        
        # Check for exact match (case-insensitive)
        for todo in todos:
            if todo['text'].strip().lower() == text_to_check:
                return jsonify({
                    'isDuplicate': True,
                    'message': 'A todo with this text already exists!'
                })
        
        return jsonify({
            'isDuplicate': False,
            'message': ''
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Todo API is running'})

# Categories endpoints
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all categories"""
    categories = load_categories()
    return jsonify(categories)

@app.route('/api/categories', methods=['POST'])
def create_category():
    """Create a new category"""
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'Category name is required'}), 400
    
    categories = load_categories()
    
    new_category = {
        'id': max([cat['id'] for cat in categories], default=0) + 1,
        'name': data['name'].strip(),
        'color': data.get('color', '#3498db'),
        'icon': data.get('icon', '📋')
    }
    
    categories.append(new_category)
    save_categories(categories)
    
    return jsonify(new_category), 201

# Tags endpoints
@app.route('/api/tags', methods=['GET'])
def get_tags():
    """Get all tags"""
    tags = load_tags()
    return jsonify(tags)

# Statistics endpoint
@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get todo statistics"""
    todos = load_todos()
    categories = load_categories()
    
    total_todos = len(todos)
    completed_todos = len([t for t in todos if t.get('completed', False)])
    pending_todos = total_todos - completed_todos
    
    # Priority breakdown
    priority_stats = {}
    for priority in ['low', 'medium', 'high', 'urgent']:
        priority_stats[priority] = len([t for t in todos if t.get('priority') == priority])
    
    # Category breakdown
    category_stats = {}
    for category in categories:
        count = len([t for t in todos if t.get('category_id') == category['id']])
        category_stats[category['name']] = count
    
    # Overdue todos
    today = datetime.now().date()
    overdue_todos = []
    for todo in todos:
        if not todo.get('completed') and todo.get('due_date'):
            due_date = datetime.fromisoformat(todo['due_date']).date()
            if due_date < today:
                overdue_todos.append(todo)
    
    # Productivity stats (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_completed = [
        t for t in todos 
        if t.get('completed') and t.get('completed_at') and 
        datetime.fromisoformat(t['completed_at']) >= week_ago
    ]
    
    stats = {
        'total_todos': total_todos,
        'completed_todos': completed_todos,
        'pending_todos': pending_todos,
        'completion_rate': round((completed_todos / total_todos * 100) if total_todos > 0 else 0, 1),
        'priority_breakdown': priority_stats,
        'category_breakdown': category_stats,
        'overdue_count': len(overdue_todos),
        'overdue_todos': overdue_todos[:5],  # Only return first 5
        'weekly_completed': len(recent_completed),
        'weekly_productivity': round(len(recent_completed) / 7, 1)  # avg per day
    }
    
    return jsonify(stats)

# Bulk operations
@app.route('/api/todos/bulk', methods=['PUT'])
def bulk_update_todos():
    """Bulk update todos"""
    data = request.get_json()
    
    if not data or 'todo_ids' not in data or 'updates' not in data:
        return jsonify({'error': 'todo_ids and updates are required'}), 400
    
    todos = load_todos()
    updated_todos = []
    
    for todo in todos:
        if todo['id'] in data['todo_ids']:
            todo['updated_at'] = datetime.now().isoformat()
            for key, value in data['updates'].items():
                if key in ['text', 'completed', 'priority', 'due_date', 'category_id']:
                    todo[key] = value
            updated_todos.append(todo)
    
    save_todos(todos)
    
    return jsonify({
        'message': f'Updated {len(updated_todos)} todos',
        'updated_todos': updated_todos
    })

# Export/Import endpoints
@app.route('/api/export', methods=['GET'])
def export_todos():
    """Export all todos as JSON"""
    todos = load_todos()
    categories = load_categories()
    tags = load_tags()
    
    export_data = {
        'todos': todos,
        'categories': categories,
        'tags': tags,
        'exported_at': datetime.now().isoformat(),
        'version': '2.0'
    }
    
    return jsonify(export_data)

@app.route('/api/import', methods=['POST'])
def import_todos():
    """Import todos from JSON"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Backup current data
        current_todos = load_todos()
        current_categories = load_categories()
        current_tags = load_tags()
        
        # Import new data
        if 'todos' in data:
            save_todos(data['todos'])
        if 'categories' in data:
            save_categories(data['categories'])
        if 'tags' in data:
            save_tags(data['tags'])
        
        return jsonify({
            'message': 'Data imported successfully',
            'imported_todos': len(data.get('todos', [])),
            'imported_categories': len(data.get('categories', [])),
            'imported_tags': len(data.get('tags', []))
        })
    
    except Exception as e:
        # Restore backup on error
        save_todos(current_todos)
        save_categories(current_categories)
        save_tags(current_tags)
        return jsonify({'error': f'Import failed: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Enhanced Todo API server...")
    print("=" * 50)
    print("📋 Available endpoints:")
    print("  Todos:")
    print("    GET    /api/todos          - Get all todos (with filters)")
    print("    POST   /api/todos          - Create a new todo")
    print("    PUT    /api/todos/<id>     - Update a todo")
    print("    DELETE /api/todos/<id>     - Delete a todo")
    print("    PUT    /api/todos/bulk     - Bulk update todos")
    print("  Categories:")
    print("    GET    /api/categories     - Get all categories")
    print("    POST   /api/categories     - Create a new category")
    print("  Tags:")
    print("    GET    /api/tags          - Get all tags")
    print("  Analytics:")
    print("    GET    /api/stats         - Get statistics")
    print("  Data:")
    print("    GET    /api/export        - Export all data")
    print("    POST   /api/import        - Import data")
    print("  Health:")
    print("    GET    /api/health        - Health check")
    print("=" * 50)
    print("🌟 New Features:")
    print("  ✅ Priority levels (low, medium, high, urgent)")
    print("  ✅ Categories with colors and icons")
    print("  ✅ Tags (auto-extracted from #hashtags)")
    print("  ✅ Due dates and reminders")
    print("  ✅ Time tracking")
    print("  ✅ Subtasks")
    print("  ✅ Notes and descriptions")
    print("  ✅ Recurring todos")
    print("  ✅ Statistics and analytics")
    print("  ✅ Bulk operations")
    print("  ✅ Import/Export functionality")
    print("=" * 50)
    print("🌐 Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
