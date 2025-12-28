// To-Do List Application JavaScript

// Backend API endpoint
const BACKEND_API = 'http://localhost:3000';

// OpenAI API Key (fallback for direct calls)
const OPENAI_API_KEY = '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';

// Global state
let todos = [];
let classes = [];
let currentFilters = {
    status: 'all',
    priority: 'all',
    class: 'all'
};
let currentTodoForBreakdown = null;
let currentBreakdown = null;

// DOM Elements
const todoList = document.getElementById('todoList');
const addTodoBtn = document.getElementById('addTodoBtn');
const addTodoModal = document.getElementById('addTodoModal');
const closeTodoModal = document.getElementById('closeTodoModal');
const addTodoForm = document.getElementById('addTodoForm');
const filterStatus = document.getElementById('filterStatus');
const filterPriority = document.getElementById('filterPriority');
const filterClass = document.getElementById('filterClass');
const importFromCalendarBtn = document.getElementById('importFromCalendarBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodosFromStorage();
    loadClassesFromStorage();
    updateClassLegend();
    updateClassSelect();
    updateFilterClassSelect();
    updateStatistics();
    updatePointsBanner();
    updateMonsterDisplay();
    loadStudyBuddyVisibility();
    renderTodoList();
    setupEventListeners();
    checkForCalendarImport();
});

function setupEventListeners() {
    addTodoBtn.addEventListener('click', () => {
        addTodoModal.style.display = 'flex';
    });
    
    closeTodoModal.addEventListener('click', () => {
        addTodoModal.style.display = 'none';
    });
    
    addTodoModal.addEventListener('click', (e) => {
        if (e.target === addTodoModal) {
            addTodoModal.style.display = 'none';
        }
    });
    
    addTodoForm.addEventListener('submit', handleAddTodo);
    
    document.getElementById('cancelTodo').addEventListener('click', () => {
        addTodoModal.style.display = 'none';
    });
    
    filterStatus.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        renderTodoList();
    });
    
    filterPriority.addEventListener('change', (e) => {
        currentFilters.priority = e.target.value;
        renderTodoList();
    });
    
    filterClass.addEventListener('change', (e) => {
        currentFilters.class = e.target.value;
        renderTodoList();
    });
    
    importFromCalendarBtn.addEventListener('click', importFromCalendar);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Study Buddy close button
    const closeStudyBuddyBtn = document.getElementById('closeStudyBuddyBtn');
    if (closeStudyBuddyBtn) {
        closeStudyBuddyBtn.addEventListener('click', closeStudyBuddy);
    }
    
    // Study Buddy show button
    const showStudyBuddyBtn = document.getElementById('showStudyBuddyBtn');
    if (showStudyBuddyBtn) {
        showStudyBuddyBtn.addEventListener('click', showStudyBuddy);
    }
    
    // Breakdown modal listeners
    const closeBreakdownModal = document.getElementById('closeBreakdownModal');
    if (closeBreakdownModal) {
        closeBreakdownModal.addEventListener('click', () => {
            document.getElementById('breakdownModal').style.display = 'none';
        });
    }
    
    const breakdownModal = document.getElementById('breakdownModal');
    if (breakdownModal) {
        breakdownModal.addEventListener('click', (e) => {
            if (e.target === breakdownModal) {
                breakdownModal.style.display = 'none';
            }
        });
    }
}

function handleAddTodo(e) {
    e.preventDefault();
    
    const todo = {
        id: Date.now(),
        title: document.getElementById('todoTitle').value,
        classId: document.getElementById('todoClass').value || null,
        priority: document.getElementById('todoPriority').value,
        dueDate: document.getElementById('todoDueDate').value || null,
        description: document.getElementById('todoDescription').value,
        completed: false,
        createdAt: new Date().toISOString(),
        source: 'manual'
    };
    
    todos.push(todo);
    saveTodosToStorage();
    updateStatistics();
    renderTodoList();
    
    // Reset form and close modal
    addTodoForm.reset();
    addTodoModal.style.display = 'none';
    
    showMessage('Task added successfully!', 'success');
}

function renderTodoList() {
    todoList.innerHTML = '';
    
    // Apply filters
    let filteredTodos = todos.filter(todo => {
        if (currentFilters.status !== 'all') {
            if (currentFilters.status === 'active' && todo.completed) return false;
            if (currentFilters.status === 'completed' && !todo.completed) return false;
        }
        
        if (currentFilters.priority !== 'all' && todo.priority !== currentFilters.priority) {
            return false;
        }
        
        if (currentFilters.class !== 'all') {
            if (currentFilters.class === 'none' && todo.classId) return false;
            if (currentFilters.class !== 'none' && todo.classId !== parseInt(currentFilters.class)) return false;
        }
        
        return true;
    });
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add tasks or adjust your filters</p>
            </div>
        `;
        return;
    }
    
    // Sort todos: incomplete first, then by priority, then by due date
    const sortedTodos = [...filteredTodos].sort((a, b) => {
        // Completed items go to bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // Then by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        // Then by due date
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
    });
    
    sortedTodos.forEach(todo => {
        const todoCard = document.createElement('div');
        const classItem = todo.classId ? classes.find(c => c.id === todo.classId) : null;
        const classColor = classItem ? classItem.color : '';
        
        todoCard.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        if (classColor) {
            todoCard.className += ` class-${classColor}`;
        }
        
        const dueDateInfo = getDueDateInfo(todo.dueDate);
        
        todoCard.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})" class="todo-checkbox">
                <div class="todo-title">${todo.title}</div>
                ${classItem ? `<div class="todo-class-badge ${classColor}">${classItem.code}</div>` : ''}
                <div class="todo-priority priority-${todo.priority}">${todo.priority}</div>
            </div>
            ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
            ${dueDateInfo.html}
            <div class="todo-actions">
                <button onclick="openBreakdownModal(${todo.id})" class="btn btn-small btn-primary" title="Break down this assignment into steps">
                    📝 Break Down
                </button>
                <button onclick="deleteTodo(${todo.id})" class="btn btn-small btn-secondary">
                    Delete
                </button>
            </div>
        `;
        
        todoList.appendChild(todoCard);
    });
}

function getDueDateInfo(dueDate) {
    if (!dueDate) return { html: '', status: 'none' };
    
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dueDateStr = new Date(dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    let className = 'todo-due-date';
    let prefix = 'Due: ';
    
    if (diffDays < 0) {
        className += ' overdue';
        prefix = '⚠️ Overdue: ';
    } else if (diffDays <= 3) {
        className += ' due-soon';
        prefix = '⚡ Due soon: ';
    }
    
    return {
        html: `<div class="${className}">${prefix}${dueDateStr}</div>`,
        status: diffDays < 0 ? 'overdue' : (diffDays <= 3 ? 'soon' : 'normal')
    };
}

function toggleTodo(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
        const wasCompleted = todo.completed;
        todo.completed = !todo.completed;
        
        // Award points for completion
        if (!wasCompleted && todo.completed) {
            awardPointsForCompletion(todo);
        }
        
        saveTodosToStorage();
        updateStatistics();
        renderTodoList();
    }
}

function awardPointsForCompletion(todo) {
    try {
        // Load current player data
        let playerData = JSON.parse(localStorage.getItem('studyBuddyPlayerData') || '{"points":0,"level":1,"completedTasks":0,"streak":0}');
        
        // Calculate points based on priority
        const pointsMap = {
            'high': 25,
            'medium': 15,
            'low': 10
        };
        
        const basePoints = pointsMap[todo.priority] || 10;
        
        // Bonus points for tasks with due dates
        let bonusPoints = 0;
        if (todo.dueDate) {
            const dueDate = new Date(todo.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            
            // Bonus for completing on time or early
            if (dueDate >= today) {
                bonusPoints = 5;
            }
        }
        
        const totalPoints = basePoints + bonusPoints;
        
        // Update player data
        playerData.points += totalPoints;
        playerData.completedTasks += 1;
        playerData.level = Math.floor(playerData.completedTasks / 10) + 1;
        
        // Save player data
        localStorage.setItem('studyBuddyPlayerData', JSON.stringify(playerData));
        
        // Add achievement
        const achievements = JSON.parse(localStorage.getItem('studyBuddyAchievements') || '[]');
        achievements.unshift({
            id: Date.now(),
            title: 'Task Completed!',
            description: todo.title,
            icon: '✅',
            points: totalPoints,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20
        if (achievements.length > 20) {
            achievements.pop();
        }
        
        localStorage.setItem('studyBuddyAchievements', JSON.stringify(achievements));
        
        // Update points banner
        updatePointsBanner();
        
        // Show notification
        showMessage(`+${totalPoints} points earned! 🎉`, 'success');
        
        console.log(`✅ Awarded ${totalPoints} points for completing: ${todo.title}`);
        
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}

function updatePointsBanner() {
    const playerData = JSON.parse(localStorage.getItem('studyBuddyPlayerData') || '{"points":0,"level":1}');
    const pointsText = document.getElementById('currentPoints');
    
    if (pointsText) {
        pointsText.textContent = `${playerData.points} points`;
    }
    
    updateMonsterDisplay();
}

function updateMonsterDisplay() {
    const container = document.getElementById('monsterDisplaySmall');
    if (!container) return;
    
    // Load character data
    const savedEquipped = localStorage.getItem('studyBuddyEquipped');
    let equipped = {
        bodyShape: 'round',
        bodyColor: '#8B5CF6',
        eyes: [
            { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
            { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
        ],
        mouth: { type: 'smile', x: 50, y: 60, width: 20, height: 10 },
        horns: null,
        spikes: null,
        tentacles: null,
        wings: null,
        tail: null
    };
    
    if (savedEquipped) {
        const loaded = JSON.parse(savedEquipped);
        equipped = {
            bodyShape: loaded.bodyShape || 'round',
            bodyColor: loaded.bodyColor || '#8B5CF6',
            eyes: loaded.eyes || [
                { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
                { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
            ],
            mouth: loaded.mouth || { type: 'smile', x: 50, y: 60, width: 20, height: 10 },
            horns: (loaded.horns && typeof loaded.horns === 'object') ? loaded.horns : (loaded.horns ? { type: loaded.horns, x: 50, y: 0 } : null),
            spikes: loaded.spikes || null,
            tentacles: (loaded.tentacles && typeof loaded.tentacles === 'object') ? loaded.tentacles : (loaded.tentacles ? { type: loaded.tentacles, x: 50, y: 100 } : null),
            wings: loaded.wings || null,
            tail: (loaded.tail && typeof loaded.tail === 'object') ? loaded.tail : (loaded.tail ? { type: loaded.tail, x: 100, y: 50 } : null)
        };
    }
    
    // Clear and rebuild monster
    container.innerHTML = '';
    
    // Create monster body with shape
    const body = document.createElement('div');
    body.className = `monster-body-small monster-${equipped.bodyShape || 'round'}`;
    
    // For triangle, use border color instead of background
    if (equipped.bodyShape === 'triangle') {
        body.style.borderBottomColor = equipped.bodyColor || '#8B5CF6';
    } else {
        body.style.background = equipped.bodyColor || '#8B5CF6';
    }
    
    // Add horns on top (shape-based) - now positionable
    if (equipped.horns) {
        const horns = document.createElement('div');
        const hornsData = typeof equipped.horns === 'object' ? equipped.horns : { type: equipped.horns, x: 50, y: 0 };
        horns.className = `monster-horns-small monster-horns-${hornsData.type || equipped.horns}`;
        horns.style.position = 'absolute';
        horns.style.left = hornsData.x + '%';
        horns.style.top = hornsData.y + '%';
        horns.style.transform = 'translate(-50%, -50%)';
        horns.style.zIndex = '5';
        body.appendChild(horns);
    }
    
    // Add face
    const face = document.createElement('div');
    face.className = 'monster-face-small';
    
    // Add eyes as circles (white circle with colored pupil on top)
    const eyesContainer = document.createElement('div');
    eyesContainer.className = 'monster-eyes-container-small';
    
    const eyes = equipped.eyes || [];
    eyes.forEach(eye => {
        // Create eye wrapper
        const eyeWrapper = document.createElement('div');
        eyeWrapper.className = 'monster-eye-wrapper-small';
        const eyeSize = eye.size * 0.6; // Scale down for small display
        eyeWrapper.style.left = eye.x + '%';
        eyeWrapper.style.top = eye.y + '%';
        eyeWrapper.style.width = eyeSize + 'px';
        eyeWrapper.style.height = eyeSize + 'px';
        eyeWrapper.style.position = 'absolute';
        eyeWrapper.style.transform = 'translate(-50%, -50%)';
        
        // White circle (eye base)
        const eyeBase = document.createElement('div');
        eyeBase.className = 'monster-eye-base-small';
        eyeBase.style.width = '100%';
        eyeBase.style.height = '100%';
        eyeBase.style.background = '#FFFFFF';
        eyeBase.style.borderRadius = '50%';
        eyeBase.style.border = '1px solid #000000';
        eyeBase.style.position = 'relative';
        
        // Colored circle (pupil) on top
        const eyePupil = document.createElement('div');
        eyePupil.className = 'monster-eye-pupil-small';
        eyePupil.style.width = '60%';
        eyePupil.style.height = '60%';
        eyePupil.style.background = eye.color || '#000000';
        eyePupil.style.borderRadius = '50%';
        eyePupil.style.position = 'absolute';
        eyePupil.style.top = '50%';
        eyePupil.style.left = '50%';
        eyePupil.style.transform = 'translate(-50%, -50%)';
        
        eyeBase.appendChild(eyePupil);
        eyeWrapper.appendChild(eyeBase);
        eyesContainer.appendChild(eyeWrapper);
    });
    
    face.appendChild(eyesContainer);
    
    // Add mouth (shape-based)
    const mouth = document.createElement('div');
    mouth.className = `monster-mouth-small monster-mouth-${equipped.mouth?.type || 'smile'}`;
    const mouthData = equipped.mouth || { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
    mouth.style.left = mouthData.x + '%';
    mouth.style.top = mouthData.y + '%';
    mouth.style.width = (mouthData.width * 0.6) + 'px';
    mouth.style.height = (mouthData.height * 0.6) + 'px';
    mouth.style.transform = 'translate(-50%, -50%)';
    face.appendChild(mouth);
    
    body.appendChild(face);
    
    // Add spikes (shape-based)
    if (equipped.spikes) {
        const spikes = document.createElement('div');
        spikes.className = `monster-spikes-small monster-spikes-${equipped.spikes}`;
        body.appendChild(spikes);
    }
    
    // Add wings (shape-based)
    if (equipped.wings) {
        const wings = document.createElement('div');
        wings.className = `monster-wings-small monster-wings-${equipped.wings}`;
        body.appendChild(wings);
    }
    
    // Add tentacles (shape-based) - now positionable
    if (equipped.tentacles) {
        const tentacles = document.createElement('div');
        const tentaclesData = typeof equipped.tentacles === 'object' ? equipped.tentacles : { type: equipped.tentacles, x: 50, y: 100 };
        tentacles.className = `monster-tentacles-small monster-tentacles-${tentaclesData.type || equipped.tentacles}`;
        tentacles.style.position = 'absolute';
        tentacles.style.left = tentaclesData.x + '%';
        tentacles.style.top = tentaclesData.y + '%';
        tentacles.style.transform = 'translate(-50%, -50%)';
        tentacles.style.zIndex = '2';
        body.appendChild(tentacles);
    }
    
    // Add tail (shape-based) - now positionable
    if (equipped.tail) {
        const tail = document.createElement('div');
        const tailData = typeof equipped.tail === 'object' ? equipped.tail : { type: equipped.tail, x: 100, y: 50 };
        tail.className = `monster-tail-small monster-tail-${tailData.type || equipped.tail}`;
        tail.style.position = 'absolute';
        tail.style.left = tailData.x + '%';
        tail.style.top = tailData.y + '%';
        tail.style.transform = 'translate(-50%, -50%)';
        tail.style.zIndex = '2';
        body.appendChild(tail);
    }
    
    container.appendChild(body);
}

function closeStudyBuddy() {
    const pointsBanner = document.getElementById('pointsBanner');
    const showStudyBuddyBtn = document.getElementById('showStudyBuddyBtn');
    
    if (pointsBanner) {
        pointsBanner.style.display = 'none';
        localStorage.setItem('studyBuddyBannerClosed', 'true');
    }
    
    if (showStudyBuddyBtn) {
        showStudyBuddyBtn.style.display = 'inline-block';
    }
}

function showStudyBuddy() {
    const pointsBanner = document.getElementById('pointsBanner');
    const showStudyBuddyBtn = document.getElementById('showStudyBuddyBtn');
    
    if (pointsBanner) {
        pointsBanner.style.display = 'flex';
        localStorage.removeItem('studyBuddyBannerClosed');
        updateMonsterDisplay(); // Refresh monster when showing banner
    }
    
    if (showStudyBuddyBtn) {
        showStudyBuddyBtn.style.display = 'none';
    }
}

function loadStudyBuddyVisibility() {
    const isClosed = localStorage.getItem('studyBuddyBannerClosed') === 'true';
    const pointsBanner = document.getElementById('pointsBanner');
    const showStudyBuddyBtn = document.getElementById('showStudyBuddyBtn');
    
    if (pointsBanner) {
        if (isClosed) {
            pointsBanner.style.display = 'none';
        } else {
            pointsBanner.style.display = 'flex';
        }
    }
    
    if (showStudyBuddyBtn) {
        if (isClosed) {
            showStudyBuddyBtn.style.display = 'inline-block';
        } else {
            showStudyBuddyBtn.style.display = 'none';
        }
    }
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== todoId);
        saveTodosToStorage();
        updateStatistics();
        renderTodoList();
        showMessage('Task deleted successfully!', 'success');
    }
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showMessage('No completed tasks to clear', 'error');
        return;
    }
    
    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
        todos = todos.filter(t => !t.completed);
        saveTodosToStorage();
        updateStatistics();
        renderTodoList();
        showMessage(`Cleared ${completedCount} completed task(s)`, 'success');
    }
}

function updateStatistics() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    // Count tasks due within 3 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const dueSoon = todos.filter(t => {
        if (t.completed || !t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= threeDaysFromNow;
    }).length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('dueSoonTasks').textContent = dueSoon;
}

function importFromCalendar() {
    try {
        const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        
        if (calendarEvents.length === 0) {
            showMessage('No events found in calendar', 'error');
            return;
        }
        
        let importedCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        calendarEvents.forEach(event => {
            // Only import future events
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            if (eventDate >= today) {
                // Check if already imported
                const exists = todos.some(t => 
                    t.title === event.title && 
                    t.dueDate === event.date &&
                    t.source === 'calendar'
                );
                
                if (!exists) {
                    const todo = {
                        id: Date.now() + Math.random(),
                        title: event.title,
                        classId: event.classId || null,
                        priority: getPriorityFromEventType(event.type),
                        dueDate: event.date,
                        description: event.description || '',
                        completed: false,
                        createdAt: new Date().toISOString(),
                        source: 'calendar'
                    };
                    
                    todos.push(todo);
                    importedCount++;
                }
            }
        });
        
        if (importedCount > 0) {
            saveTodosToStorage();
            updateStatistics();
            renderTodoList();
            showMessage(`Imported ${importedCount} task(s) from calendar`, 'success');
        } else {
            showMessage('No new events to import', 'error');
        }
    } catch (error) {
        console.error('Error importing from calendar:', error);
        showMessage('Failed to import from calendar', 'error');
    }
}

function getPriorityFromEventType(type) {
    const priorityMap = {
        'exam': 'high',
        'quiz': 'high',
        'paper': 'high',
        'project': 'high',
        'assignment': 'medium',
        'deadline': 'medium',
        'lecture': 'low',
        'reading': 'low',
        'holiday': 'low',
        'break': 'low',
        'other': 'low'
    };
    
    return priorityMap[type] || 'medium';
}

function checkForCalendarImport() {
    // Check if there's data to import from syllabus analyzer
    const syllabusDataForTodo = localStorage.getItem('syllabusDataForTodo');
    
    if (syllabusDataForTodo) {
        try {
            const data = JSON.parse(syllabusDataForTodo);
            const confirmed = confirm('Syllabus data found! Would you like to import tasks?');
            
            if (confirmed) {
                importSyllabusDataToTodos(data);
                localStorage.removeItem('syllabusDataForTodo');
            }
        } catch (error) {
            console.error('Error importing syllabus data:', error);
        }
    }
}

function importSyllabusDataToTodos(data) {
    let importedCount = 0;
    
    // Get or create class
    let classId = null;
    if (data.courseInfo && data.courseInfo.courseName) {
        const courseCode = data.courseInfo.courseCode || 
                          data.courseInfo.courseName.split(' ').map(w => w[0]).join('').toUpperCase();
        
        let existingClass = classes.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
        
        if (!existingClass) {
            const colors = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'pink', 'indigo'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const newClass = {
                id: Date.now(),
                name: data.courseInfo.courseName,
                code: courseCode,
                color: randomColor
            };
            
            classes.push(newClass);
            saveClassesToStorage();
            updateClassLegend();
            updateClassSelect();
            updateFilterClassSelect();
            classId = newClass.id;
        } else {
            classId = existingClass.id;
        }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Import dates and deadlines
    if (data.datesAndDeadlines && Array.isArray(data.datesAndDeadlines)) {
        data.datesAndDeadlines.forEach(dateItem => {
            const parsedDate = parseDate(dateItem.date);
            if (parsedDate) {
                const itemDate = new Date(parsedDate);
                itemDate.setHours(0, 0, 0, 0);
                
                // Only import future items
                if (itemDate >= today) {
                    const todo = {
                        id: Date.now() + Math.random(),
                        title: dateItem.title || 'Task',
                        classId: classId,
                        priority: getPriorityFromEventType(dateItem.type),
                        dueDate: parsedDate,
                        description: dateItem.description || '',
                        completed: false,
                        createdAt: new Date().toISOString(),
                        source: 'syllabus'
                    };
                    
                    todos.push(todo);
                    importedCount++;
                }
            }
        });
    }
    
    saveTodosToStorage();
    updateStatistics();
    renderTodoList();
    
    showMessage(`Imported ${importedCount} task(s) from syllabus`, 'success');
}

function parseDate(dateString) {
    if (!dateString) return null;
    
    const cleaned = dateString.trim().toLowerCase();
    
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbrev = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    // Format 1: "September 30" or "September 30, 2024"
    const monthDayPattern = /([a-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?/i;
    const monthDayMatch = cleaned.match(monthDayPattern);
    if (monthDayMatch) {
        let month = monthNames.indexOf(monthDayMatch[1].toLowerCase());
        if (month === -1) {
            month = monthAbbrev.indexOf(monthDayMatch[1].toLowerCase());
        }
        if (month >= 0) {
            const day = parseInt(monthDayMatch[2]);
            const year = monthDayMatch[3] ? parseInt(monthDayMatch[3]) : new Date().getFullYear();
            if (day >= 1 && day <= 31 && year >= 2020) {
                const date = new Date(year, month, day);
                return date.toISOString().split('T')[0];
            }
        }
    }
    
    // Format 2: MM/DD/YYYY or MM-DD-YYYY
    const numericPattern1 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const numericMatch1 = cleaned.match(numericPattern1);
    if (numericMatch1) {
        const month = parseInt(numericMatch1[1]) - 1;
        const day = parseInt(numericMatch1[2]);
        const year = parseInt(numericMatch1[3]);
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 2020) {
            const date = new Date(year, month, day);
            return date.toISOString().split('T')[0];
        }
    }
    
    // Format 3: YYYY-MM-DD (ISO format)
    const isoPattern = /(\d{4})-(\d{1,2})-(\d{1,2})/;
    const isoMatch = cleaned.match(isoPattern);
    if (isoMatch) {
        const year = parseInt(isoMatch[1]);
        const month = parseInt(isoMatch[2]) - 1;
        const day = parseInt(isoMatch[3]);
        if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 2020) {
            const date = new Date(year, month, day);
            return date.toISOString().split('T')[0];
        }
    }
    
    return null;
}

function updateClassLegend() {
    const classLegend = document.getElementById('classLegend');
    const legendItems = document.getElementById('legendItems');
    
    if (classes.length === 0) {
        classLegend.style.display = 'none';
        return;
    }
    
    classLegend.style.display = 'block';
    legendItems.innerHTML = '';
    
    classes.forEach(classItem => {
        const legendItem = document.createElement('div');
        legendItem.className = `legend-item ${classItem.color}`;
        
        legendItem.innerHTML = `
            <div class="color-preview"></div>
            <div class="class-info">
                <div class="class-name">${classItem.name}</div>
                <div class="class-code">${classItem.code}</div>
            </div>
        `;
        
        legendItems.appendChild(legendItem);
    });
}

function updateClassSelect() {
    const classSelect = document.getElementById('todoClass');
    classSelect.innerHTML = '<option value="">No class</option>';
    
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = `${classItem.code} - ${classItem.name}`;
        classSelect.appendChild(option);
    });
}

function updateFilterClassSelect() {
    const filterClassSelect = document.getElementById('filterClass');
    filterClassSelect.innerHTML = '<option value="all">All Classes</option>';
    filterClassSelect.innerHTML += '<option value="none">No Class</option>';
    
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = `${classItem.code} - ${classItem.name}`;
        filterClassSelect.appendChild(option);
    });
}

function saveTodosToStorage() {
    localStorage.setItem('todoListTodos', JSON.stringify(todos));
}

function loadTodosFromStorage() {
    const stored = localStorage.getItem('todoListTodos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

function loadClassesFromStorage() {
    const stored = localStorage.getItem('calendarClasses');
    if (stored) {
        classes = JSON.parse(stored);
    }
}

function saveClassesToStorage() {
    localStorage.setItem('calendarClasses', JSON.stringify(classes));
}

function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.container').insertBefore(message, document.querySelector('.quick-actions'));
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// ========================================
// ASSIGNMENT BREAKDOWN FUNCTIONS
// ========================================

function openBreakdownModal(todoId) {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    
    currentTodoForBreakdown = todo;
    currentBreakdown = null;
    
    // Reset modal
    document.getElementById('breakdownForm').style.display = 'block';
    document.getElementById('breakdownProcessing').style.display = 'none';
    document.getElementById('breakdownResults').style.display = 'none';
    document.getElementById('breakdownInstructions').value = todo.description || '';
    
    // Show modal
    document.getElementById('breakdownModal').style.display = 'flex';
}

function closeBreakdownModal() {
    document.getElementById('breakdownModal').style.display = 'none';
    currentTodoForBreakdown = null;
    currentBreakdown = null;
}

async function analyzeAssignmentBreakdown() {
    const instructions = document.getElementById('breakdownInstructions').value.trim();
    
    if (!instructions) {
        showMessage('Please enter assignment instructions', 'error');
        return;
    }
    
    if (!currentTodoForBreakdown) {
        showMessage('No task selected', 'error');
        return;
    }
    
    // Show processing
    document.getElementById('breakdownForm').style.display = 'none';
    document.getElementById('breakdownProcessing').style.display = 'block';
    document.getElementById('breakdownResults').style.display = 'none';
    
    try {
        const dueDate = currentTodoForBreakdown.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const prompt = `You are an academic coach helping a student break down their assignment into manageable steps. Analyze the following assignment and provide a structured breakdown.

**Assignment Title:** ${currentTodoForBreakdown.title}
**Due Date:** ${dueDate}
**Instructions:**
${instructions}

Please provide a response in the following JSON format:
{
  "simplified": "A clear, concise summary of what the student needs to do (2-3 sentences)",
  "steps": [
    {
      "number": 1,
      "title": "Step title",
      "description": "Detailed description of what to do in this step",
      "estimatedTime": "How long this should take (e.g., '2-3 hours')",
      "suggestedDeadline": "Suggested date in YYYY-MM-DD format"
    }
  ],
  "tips": [
    "Practical tip #1",
    "Practical tip #2"
  ],
  "resources": [
    "Suggested resource or tool that might help"
  ]
}

Instructions for creating the breakdown:
1. **Simplified**: Write a student-friendly summary that clarifies the main goal
2. **Steps**: Break the assignment into 5-8 concrete, actionable steps. Each step should:
   - Be specific and achievable
   - Build on the previous step
   - Have realistic time estimates
   - Include suggested deadlines spread evenly from now until the final due date
3. **Tips**: Provide 3-5 practical study tips specific to this assignment type
4. **Resources**: Suggest 2-4 helpful resources, tools, or approaches

Calculate the suggested deadlines by working backwards from the due date (${dueDate}), spacing them evenly and leaving buffer time before the final deadline.

Return ONLY the JSON object with no other text.`;

        const breakdown = await callOpenAIForBreakdown(prompt);
        currentBreakdown = breakdown;
        
        // Display results
        displayBreakdownResults(breakdown);
        
        document.getElementById('breakdownProcessing').style.display = 'none';
        document.getElementById('breakdownResults').style.display = 'block';
        
    } catch (error) {
        console.error('Error analyzing assignment:', error);
        document.getElementById('breakdownProcessing').style.display = 'none';
        document.getElementById('breakdownForm').style.display = 'block';
        showMessage('Failed to analyze assignment: ' + error.message, 'error');
    }
}

async function callOpenAIForBreakdown(prompt) {
    try {
        // Try backend first
        const response = await fetch(`${BACKEND_API}/api/analyze-assignment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                return result.data;
            }
        }
    } catch (backendError) {
        console.warn('Backend not available, using direct OpenAI call');
    }
    
    // Fallback to direct OpenAI call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an experienced academic coach who helps students break down complex assignments into manageable steps. You provide clear, actionable guidance with realistic deadlines. Always return valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    let jsonText = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        jsonText = jsonMatch[1];
    } else {
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            jsonText = objectMatch[0];
        }
    }
    
    return JSON.parse(jsonText);
}

function displayBreakdownResults(breakdown) {
    const resultsDiv = document.getElementById('breakdownResults');
    resultsDiv.innerHTML = '';
    
    let html = '<div class="breakdown-content">';
    
    // Simplified
    if (breakdown.simplified) {
        html += `
            <div class="breakdown-card simplified-section">
                <h4>📝 What You Need to Do</h4>
                <p>${breakdown.simplified}</p>
            </div>
        `;
    }
    
    // Steps
    if (breakdown.steps && breakdown.steps.length > 0) {
        html += '<div class="breakdown-card steps-section"><h4>📋 Step-by-Step Plan</h4>';
        
        breakdown.steps.forEach(step => {
            const deadline = step.suggestedDeadline ? 
                new Date(step.suggestedDeadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '';
            
            html += `
                <div class="step-item">
                    <div class="step-header">
                        <span class="step-number">Step ${step.number}</span>
                        ${deadline ? `<span class="step-deadline">📅 ${deadline}</span>` : ''}
                    </div>
                    <div class="step-title">${step.title}</div>
                    <div class="step-description">${step.description}</div>
                    ${step.estimatedTime ? `<div class="step-description"><strong>⏱️ Time:</strong> ${step.estimatedTime}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // Tips
    if (breakdown.tips && breakdown.tips.length > 0) {
        html += '<div class="breakdown-card tips-section"><h4>💡 Tips for Success</h4><ul>';
        breakdown.tips.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += '</ul></div>';
    }
    
    // Resources
    if (breakdown.resources && breakdown.resources.length > 0) {
        html += '<div class="breakdown-card"><h4>📚 Helpful Resources</h4><ul>';
        breakdown.resources.forEach(resource => {
            html += `<li>${resource}</li>`;
        });
        html += '</ul></div>';
    }
    
    // Action buttons
    html += `
        <div class="form-actions" style="margin-top: 2rem;">
            <button class="btn btn-primary" onclick="addBreakdownStepsToTodo()">✅ Add All Steps to To-Do List</button>
            <button class="btn btn-secondary" onclick="closeBreakdownModal()">Close</button>
        </div>
    `;
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

function addBreakdownStepsToTodo() {
    if (!currentBreakdown || !currentBreakdown.steps || !currentTodoForBreakdown) {
        showMessage('No breakdown steps available', 'error');
        return;
    }
    
    const classId = currentTodoForBreakdown.classId;
    let addedCount = 0;
    
    currentBreakdown.steps.forEach(step => {
        if (step.suggestedDeadline) {
            const newTodo = {
                id: Date.now() + Math.random(),
                title: `${currentTodoForBreakdown.title} - ${step.title}`,
                classId: classId,
                priority: 'medium',
                dueDate: step.suggestedDeadline,
                description: step.description + (step.estimatedTime ? `\n\nEstimated time: ${step.estimatedTime}` : ''),
                completed: false,
                createdAt: new Date().toISOString(),
                source: 'breakdown'
            };
            
            todos.push(newTodo);
            
            // Also add to calendar
            let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
            calendarEvents.push({
                id: Date.now() + Math.random() + 0.1,
                title: `${currentTodoForBreakdown.title} - ${step.title}`,
                date: step.suggestedDeadline,
                time: '',
                type: 'assignment',
                description: step.description + (step.estimatedTime ? ` (Est. ${step.estimatedTime})` : ''),
                classId: classId,
                source: 'breakdown'
            });
            localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
            
            addedCount++;
        }
    });
    
    saveTodosToStorage();
    updateStatistics();
    renderTodoList();
    closeBreakdownModal();
    
    showMessage(`Added ${addedCount} breakdown steps to your to-do list and calendar!`, 'success');
}

// Global functions for external access
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.openBreakdownModal = openBreakdownModal;
window.closeBreakdownModal = closeBreakdownModal;
window.analyzeAssignmentBreakdown = analyzeAssignmentBreakdown;
window.addBreakdownStepsToTodo = addBreakdownStepsToTodo;

