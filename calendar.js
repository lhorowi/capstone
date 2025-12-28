// Calendar Application JavaScript

// Global state
let currentDate = new Date();
let currentView = 'month'; // 'month' or 'week'
let events = [];
let syllabusData = null;
let classes = [];
let todos = [];

// DOM Elements
const currentMonthEl = document.getElementById('currentMonth');
const calendarGrid = document.getElementById('calendarGrid');
const eventsList = document.getElementById('eventsList');
const todoList = document.getElementById('todoList');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const importDataBtn = document.getElementById('importData');
const addEventBtn = document.getElementById('addEventBtn');
const addTodoBtn = document.getElementById('addTodoBtn');
const manageClassesBtn = document.getElementById('manageClasses');

// Modal elements
const eventModal = document.getElementById('eventModal');
const addEventModal = document.getElementById('addEventModal');
const addTodoModal = document.getElementById('addTodoModal');
const importModal = document.getElementById('importModal');
const closeModal = document.getElementById('closeModal');
const closeAddModal = document.getElementById('closeAddModal');
const closeTodoModal = document.getElementById('closeTodoModal');
const closeImportModal = document.getElementById('closeImportModal');

// Form elements
const addEventForm = document.getElementById('addEventForm');
const addTodoForm = document.getElementById('addTodoForm');
const jsonFileInput = document.getElementById('jsonFileInput');
const jsonDataInput = document.getElementById('jsonDataInput');

// Initialize calendar
document.addEventListener('DOMContentLoaded', () => {
    loadEventsFromStorage();
    loadTodosFromStorage();
    loadClassesFromStorage();
    checkForSyllabusData();
    // Load view preference
    const savedView = localStorage.getItem('calendarView');
    if (savedView === 'week' || savedView === 'month') {
        currentView = savedView;
    }
    updateViewButtons();
    renderCalendar();
    updateEventsList();
    updateTodoList();
    updateClassLegend();
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation buttons
    prevMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else {
            // Move back one week
            currentDate.setDate(currentDate.getDate() - 7);
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        if (currentView === 'month') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else {
            // Move forward one week
            currentDate.setDate(currentDate.getDate() + 7);
        }
        renderCalendar();
    });
    
    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });
    
    // View toggle buttons
    document.getElementById('monthViewBtn')?.addEventListener('click', () => {
        currentView = 'month';
        localStorage.setItem('calendarView', 'month');
        updateViewButtons();
        renderCalendar();
    });
    
    document.getElementById('weekViewBtn')?.addEventListener('click', () => {
        currentView = 'week';
        localStorage.setItem('calendarView', 'week');
        updateViewButtons();
        renderCalendar();
    });
    
    // Modal buttons
    importDataBtn.addEventListener('click', () => {
        importModal.style.display = 'flex';
    });
    
    addEventBtn.addEventListener('click', () => {
        addEventModal.style.display = 'flex';
    });
    
    addTodoBtn.addEventListener('click', () => {
        addTodoModal.style.display = 'flex';
    });
    
    // Close modals
    closeModal.addEventListener('click', () => {
        eventModal.style.display = 'none';
    });
    
    closeAddModal.addEventListener('click', () => {
        addEventModal.style.display = 'none';
    });
    
    closeTodoModal.addEventListener('click', () => {
        addTodoModal.style.display = 'none';
    });
    
    closeImportModal.addEventListener('click', () => {
        importModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    [eventModal, addEventModal, addTodoModal, importModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Form submission
    addEventForm.addEventListener('submit', handleAddEvent);
    addTodoForm.addEventListener('submit', handleAddTodo);
    
    // Import buttons
    document.getElementById('uploadJsonBtn').addEventListener('click', handleJsonFileUpload);
    document.getElementById('importJsonBtn').addEventListener('click', handleJsonDataImport);
    
    // Cancel buttons
    document.getElementById('cancelTodo').addEventListener('click', () => {
        addTodoModal.style.display = 'none';
    });
    
    // Class management
    manageClassesBtn.addEventListener('click', showClassManagement);
    document.getElementById('addClassForm').addEventListener('submit', handleAddClass);
    document.getElementById('closeClassModal').addEventListener('click', () => {
        document.getElementById('classModal').style.display = 'none';
    });
    
    // Update class select when opening add event modal
    addEventBtn.addEventListener('click', () => {
        updateClassSelect();
        addEventModal.style.display = 'flex';
    });
    
    // Cancel buttons
    document.getElementById('cancelAddEvent').addEventListener('click', () => {
        addEventModal.style.display = 'none';
    });
}

function renderCalendar() {
    if (currentView === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

function renderMonthView() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    calendarGrid.className = 'calendar-grid month-view';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const dayEl = createDayElement(null, true);
        calendarGrid.appendChild(dayEl);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createDayElement(day, false);
        calendarGrid.appendChild(dayEl);
    }
}

function renderWeekView() {
    // Get the start of the week (Sunday)
    const weekStart = new Date(currentDate);
    const dayOfWeek = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    
    // Update display to show week range
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const year = weekStart.getFullYear();
    
    if (startMonth === endMonth) {
        currentMonthEl.textContent = `${startMonth} ${startDay}-${endDay}, ${year}`;
    } else {
        currentMonthEl.textContent = `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    calendarGrid.className = 'calendar-grid week-view';
    
    // Render 7 days of the week
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        const dayEl = createWeekDayElement(dayDate);
        calendarGrid.appendChild(dayEl);
    }
}

function createWeekDayElement(dayDate) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day week-day';
    
    const dayNumber = dayDate.getDate();
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Check if this is today
    const today = new Date();
    if (dayDate.toDateString() === today.toDateString()) {
        dayEl.classList.add('today');
    }
    
    dayEl.innerHTML = `
        <div class="week-day-header">
            <div class="week-day-name">${dayName}</div>
            <div class="day-number">${dayNumber}</div>
        </div>
        <div class="week-day-events"></div>
    `;
    
    // Add events for this day
    const dayEvents = getEventsForDate(dayDate);
    const eventsContainer = dayEl.querySelector('.week-day-events');
    
    if (dayEvents.length > 0) {
        dayEl.classList.add('has-events');
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event-item ${getEventColorClass(event)}`;
            eventEl.innerHTML = `
                <div class="event-time">${event.time || ''}</div>
                <div class="event-title">${event.title}</div>
            `;
            eventEl.title = `${event.title} - ${event.description || ''}`;
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                showEventDetails(event);
            });
            eventsContainer.appendChild(eventEl);
        });
    }
    
    // Add click listener for adding events
    dayEl.addEventListener('click', () => {
        addEventToDate(dayDate);
    });
    
    return dayEl;
}

function getEventsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => {
        const eventDate = new Date(event.date);
        const eventDateString = eventDate.toISOString().split('T')[0];
        return eventDateString === dateString;
    });
}

function addEventToDate(date) {
    const dateString = date.toISOString().split('T')[0];
    document.getElementById('eventDate').value = dateString;
    addEventModal.style.display = 'flex';
}

function updateViewButtons() {
    const monthBtn = document.getElementById('monthViewBtn');
    const weekBtn = document.getElementById('weekViewBtn');
    
    if (monthBtn && weekBtn) {
        if (currentView === 'month') {
            monthBtn.classList.add('active');
            weekBtn.classList.remove('active');
        } else {
            weekBtn.classList.add('active');
            monthBtn.classList.remove('active');
        }
    }
    
    // Update button labels
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn && nextBtn) {
        if (currentView === 'month') {
            prevBtn.textContent = '← Previous';
            nextBtn.textContent = 'Next →';
        } else {
            prevBtn.textContent = '← Previous Week';
            nextBtn.textContent = 'Next Week →';
        }
    }
}

function createDayElement(dayNumber, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    } else {
        dayEl.innerHTML = `<div class="day-number">${dayNumber}</div>`;
        
        // Check if this is today
        const today = new Date();
        if (currentDate.getFullYear() === today.getFullYear() &&
            currentDate.getMonth() === today.getMonth() &&
            dayNumber === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        // Add events for this day
        const dayEvents = getEventsForDay(dayNumber);
        if (dayEvents.length > 0) {
            dayEl.classList.add('has-events');
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'day-events';
            
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event-item ${getEventColorClass(event)}`;
            eventEl.textContent = event.title;
            eventEl.title = `${event.title} - ${event.description || ''}`;
            eventEl.addEventListener('click', (e) => {
                e.stopPropagation();
                showEventDetails(event);
            });
            eventsContainer.appendChild(eventEl);
        });
            
            dayEl.appendChild(eventsContainer);
        }
        
        // Add click listener for adding events
        dayEl.addEventListener('click', () => {
            if (!isOtherMonth) {
                addEventToDay(dayNumber);
            }
        });
    }
    
    return dayEl;
}

function getEventsForDay(dayNumber) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year &&
               eventDate.getMonth() === month &&
               eventDate.getDate() === dayNumber;
    });
}

function addEventToDay(dayNumber) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    
    document.getElementById('eventDate').value = dateString;
    addEventModal.style.display = 'flex';
}

function handleAddEvent(e) {
    e.preventDefault();
    
    const classId = document.getElementById('eventClass').value;
    if (!classId) {
        showMessage('Please select a class', 'error');
        return;
    }
    
    const event = {
        id: Date.now(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        type: document.getElementById('eventType').value,
        description: document.getElementById('eventDescription').value,
        classId: classId
    };
    
    events.push(event);
    saveEventsToStorage();
    renderCalendar();
    updateEventsList();
    
    // Reset form and close modal
    addEventForm.reset();
    addEventModal.style.display = 'none';
    
    showMessage('Event added successfully!', 'success');
}

function showEventDetails(event) {
    const modalTitle = document.getElementById('modalTitle');
    const eventDetails = document.getElementById('eventDetails');
    
    modalTitle.textContent = event.title;
    
    const eventDate = new Date(event.date);
    const dateString = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    eventDetails.innerHTML = `
        <div class="event-detail">
            <strong>Date:</strong> ${dateString}
        </div>
        ${event.time ? `<div class="event-detail"><strong>Time:</strong> ${event.time}</div>` : ''}
        <div class="event-detail">
            <strong>Type:</strong> <span class="event-type ${event.type}">${event.type}</span>
        </div>
        ${event.description ? `<div class="event-detail"><strong>Description:</strong> ${event.description}</div>` : ''}
        <div class="event-actions" style="margin-top: 1.5rem;">
            <button onclick="deleteEvent(${event.id})" class="btn btn-secondary" style="background: #dc3545;">
                Delete Event
            </button>
        </div>
    `;
    
    eventModal.style.display = 'flex';
}

function deleteEvent(eventId) {
    events = events.filter(event => event.id !== eventId);
    saveEventsToStorage();
    renderCalendar();
    updateEventsList();
    eventModal.style.display = 'none';
    showMessage('Event deleted successfully!', 'success');
}

function updateEventsList() {
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = `
            <div class="empty-state">
                <h3>No events scheduled</h3>
                <p>Add events manually or import data from the Syllabus Analyzer</p>
                <button onclick="importModal.style.display='flex'" class="btn btn-primary">
                    Import Syllabus Data
                </button>
            </div>
        `;
        return;
    }
    
    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `event-card ${event.type}`;
        
        const eventDate = new Date(event.date);
        const dateString = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        eventCard.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-date">${dateString}${event.time ? ` at ${event.time}` : ''}</div>
            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
        `;
        
        eventCard.addEventListener('click', () => showEventDetails(event));
        eventsList.appendChild(eventCard);
    });
}

function handleJsonFileUpload() {
    const file = jsonFileInput.files[0];
    if (!file) {
        showMessage('Please select a JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            importSyllabusData(data);
        } catch (error) {
            showMessage('Invalid JSON file', 'error');
        }
    };
    reader.readAsText(file);
}

function handleJsonDataImport() {
    const jsonData = jsonDataInput.value.trim();
    if (!jsonData) {
        showMessage('Please enter JSON data', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(jsonData);
        importSyllabusData(data);
    } catch (error) {
        showMessage('Invalid JSON data', 'error');
    }
}

function importSyllabusData(data) {
    syllabusData = data;
    let importedCount = 0;
    
    // Create class from course info if it doesn't exist
    let classId = null;
    if (data.courseInfo && data.courseInfo.courseName) {
        const courseCode = data.courseInfo.courseCode || 
                          data.courseInfo.courseName.split(' ').map(w => w[0]).join('').toUpperCase();
        
        // Check if class already exists
        let existingClass = classes.find(c => c.code.toLowerCase() === courseCode.toLowerCase());
        
        if (!existingClass) {
            // Create new class with random color
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
            classId = newClass.id;
            
            showMessage(`Created new class: ${newClass.name} (${newClass.code})`, 'success');
        } else {
            classId = existingClass.id;
        }
    }
    
    // Import dates and deadlines (using datesAndDeadlines from new schema)
    if (data.datesAndDeadlines && Array.isArray(data.datesAndDeadlines)) {
        data.datesAndDeadlines.forEach(dateItem => {
            const event = {
                id: Date.now() + Math.random(),
                title: dateItem.title || 'Important Date',
                date: parseDate(dateItem.date),
                type: dateItem.type || 'deadline',
                description: dateItem.description || '',
                worth: dateItem.worth || '',
                source: 'syllabus',
                classId: classId
            };
            
            if (event.date) {
                // Add worth/points to description if available
                if (event.worth && !event.description.includes(event.worth)) {
                    event.description = event.description ? `${event.description} (${event.worth})` : event.worth;
                }
                events.push(event);
                importedCount++;
            }
        });
    }
    
    // Fallback: Import important dates (old schema support)
    if (data.importantDates && Array.isArray(data.importantDates)) {
        data.importantDates.forEach(dateItem => {
            const event = {
                id: Date.now() + Math.random(),
                title: dateItem.title || 'Important Date',
                date: parseDate(dateItem.date),
                type: dateItem.type || 'other',
                description: dateItem.description || '',
                source: 'syllabus',
                classId: classId
            };
            
            if (event.date) {
                events.push(event);
                importedCount++;
            }
        });
    }
    
    // Fallback: Import assignments (old schema support)
    if (data.assignments && Array.isArray(data.assignments)) {
        data.assignments.forEach(assignment => {
            if (assignment.dueDate) {
                const event = {
                    id: Date.now() + Math.random(),
                    title: assignment.name || 'Assignment',
                    date: parseDate(assignment.dueDate),
                    type: 'assignment',
                    description: assignment.description || '',
                    source: 'syllabus',
                    classId: classId
                };
                
                if (event.date) {
                    events.push(event);
                    importedCount++;
                }
            }
        });
    }
    
    // Remove duplicates
    events = events.filter((event, index, self) => 
        index === self.findIndex(e => e.title === event.title && e.date === event.date)
    );
    
    saveEventsToStorage();
    renderCalendar();
    updateEventsList();
    
    importModal.style.display = 'none';
    showMessage(`Successfully imported ${importedCount} events from syllabus data!`, 'success');
}

function parseDate(dateString) {
    if (!dateString) return null;
    
    // Clean the date string
    const cleaned = dateString.trim().toLowerCase();
    
    // Try different date formats
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
    
    // Format 4: "Month DD, YYYY" with comma
    const commaPattern = /([a-z]+)\s+(\d{1,2}),\s+(\d{4})/i;
    const commaMatch = cleaned.match(commaPattern);
    if (commaMatch) {
        let month = monthNames.indexOf(commaMatch[1].toLowerCase());
        if (month === -1) {
            month = monthAbbrev.indexOf(commaMatch[1].toLowerCase());
        }
        if (month >= 0) {
            const day = parseInt(commaMatch[2]);
            const year = parseInt(commaMatch[3]);
            if (day >= 1 && day <= 31 && year >= 2020) {
                const date = new Date(year, month, day);
                return date.toISOString().split('T')[0];
            }
        }
    }
    
    return null;
}

function saveEventsToStorage() {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function loadEventsFromStorage() {
    const stored = localStorage.getItem('calendarEvents');
    if (stored) {
        events = JSON.parse(stored);
    }
}

function checkForSyllabusData() {
    const syllabusData = localStorage.getItem('syllabusDataForCalendar');
    if (syllabusData) {
        try {
            const data = JSON.parse(syllabusData);
            const confirmed = confirm('Syllabus data found! Would you like to import it to your calendar?');
            if (confirmed) {
                importSyllabusData(data);
                localStorage.removeItem('syllabusDataForCalendar'); // Clear after import
            }
        } catch (error) {
            console.error('Error parsing syllabus data:', error);
        }
    }
}

function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.container').insertBefore(message, document.querySelector('.nav').nextSibling);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// ========================================
// CLASS MANAGEMENT FUNCTIONS
// ========================================

function loadClassesFromStorage() {
    const stored = localStorage.getItem('calendarClasses');
    if (stored) {
        classes = JSON.parse(stored);
    }
}

function saveClassesToStorage() {
    localStorage.setItem('calendarClasses', JSON.stringify(classes));
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
        
        const colorPreview = document.createElement('div');
        colorPreview.className = 'color-preview';
        
        // Add color shades for different assignment types
        const shades = ['assignment', 'exam', 'quiz', 'deadline', 'holiday', 'other'];
        shades.forEach(shade => {
            const shadeEl = document.createElement('div');
            shadeEl.className = `shade ${classItem.color}-${shade}`;
            colorPreview.appendChild(shadeEl);
        });
        
        const classInfo = document.createElement('div');
        classInfo.className = 'class-info';
        classInfo.innerHTML = `
            <div class="class-name">${classItem.name}</div>
            <div class="class-code">${classItem.code}</div>
        `;
        
        legendItem.appendChild(colorPreview);
        legendItem.appendChild(classInfo);
        legendItems.appendChild(legendItem);
    });
}

function updateClassSelect() {
    const classSelect = document.getElementById('eventClass');
    classSelect.innerHTML = '<option value="">Select a class</option>';
    
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = `${classItem.code} - ${classItem.name}`;
        classSelect.appendChild(option);
    });
}

function showClassManagement() {
    const classModal = document.getElementById('classModal');
    updateExistingClassesList();
    classModal.style.display = 'flex';
}

function updateExistingClassesList() {
    const existingClasses = document.getElementById('existingClasses');
    existingClasses.innerHTML = '';
    
    if (classes.length === 0) {
        existingClasses.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No classes added yet</p>';
        return;
    }
    
    classes.forEach(classItem => {
        const classEl = document.createElement('div');
        classEl.className = `class-item ${classItem.color}`;
        
        classEl.innerHTML = `
            <div class="class-details">
                <div class="class-name">${classItem.name}</div>
                <div class="class-code">${classItem.code}</div>
            </div>
            <div class="class-actions">
                <button onclick="deleteClass('${classItem.id}')" class="btn btn-small" style="background: #dc3545; color: white;">
                    Delete
                </button>
            </div>
        `;
        
        existingClasses.appendChild(classEl);
    });
}

function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class? This will also remove all associated events.')) {
        classes = classes.filter(c => c.id !== classId);
        events = events.filter(e => e.classId !== classId);
        saveClassesToStorage();
        saveEventsToStorage();
        updateClassLegend();
        updateClassSelect();
        updateExistingClassesList();
        renderCalendar();
        updateEventsList();
        showMessage('Class deleted successfully!', 'success');
    }
}

function handleAddClass(e) {
    e.preventDefault();
    
    const className = document.getElementById('className').value;
    const classCode = document.getElementById('classCode').value;
    const classColor = document.getElementById('classColor').value;
    
    // Check if class code already exists
    if (classes.some(c => c.code.toLowerCase() === classCode.toLowerCase())) {
        showMessage('A class with this code already exists!', 'error');
        return;
    }
    
    const newClass = {
        id: Date.now(),
        name: className,
        code: classCode,
        color: classColor
    };
    
    classes.push(newClass);
    saveClassesToStorage();
    updateClassLegend();
    updateClassSelect();
    updateExistingClassesList();
    
    // Reset form
    document.getElementById('addClassForm').reset();
    
    showMessage('Class added successfully!', 'success');
}

function getEventColorClass(event) {
    if (!event.classId) return 'blue'; // Default color
    
    const classItem = classes.find(c => c.id === event.classId);
    if (!classItem) return 'blue';
    
    return `${classItem.color}-${event.type}`;
}

// ========================================
// TO-DO LIST FUNCTIONS
// ========================================

function handleAddTodo(e) {
    e.preventDefault();
    
    const todo = {
        id: Date.now(),
        title: document.getElementById('todoTitle').value,
        priority: document.getElementById('todoPriority').value,
        dueDate: document.getElementById('todoDueDate').value || null,
        description: document.getElementById('todoDescription').value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveTodosToStorage();
    updateTodoList();
    
    // Reset form and close modal
    addTodoForm.reset();
    addTodoModal.style.display = 'none';
    
    showMessage('Task added successfully!', 'success');
}

function updateTodoList() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks yet</h3>
                <p>Add tasks to track your work</p>
            </div>
        `;
        return;
    }
    
    // Sort todos: incomplete first, then by priority, then by due date
    const sortedTodos = [...todos].sort((a, b) => {
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
        todoCard.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        
        const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '';
        
        todoCard.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="toggleTodo(${todo.id})" class="todo-checkbox">
                <div class="todo-title">${todo.title}</div>
                <div class="todo-priority priority-${todo.priority}">${todo.priority}</div>
            </div>
            ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
            ${todo.dueDate ? `<div class="todo-due-date">Due: ${dueDateStr}</div>` : ''}
            <div class="todo-actions">
                <button onclick="deleteTodo(${todo.id})" class="btn btn-small" style="background: #dc3545; color: white;">
                    Delete
                </button>
            </div>
        `;
        
        todoList.appendChild(todoCard);
    });
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
        updateTodoList();
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
        
        // Show notification
        showMessage(`+${totalPoints} points earned! 🎉`, 'success');
        
        console.log(`✅ Awarded ${totalPoints} points for completing: ${todo.title}`);
        
    } catch (error) {
        console.error('Error awarding points:', error);
    }
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== todoId);
        saveTodosToStorage();
        updateTodoList();
        showMessage('Task deleted successfully!', 'success');
    }
}

function saveTodosToStorage() {
    localStorage.setItem('calendarTodos', JSON.stringify(todos));
}

function loadTodosFromStorage() {
    const stored = localStorage.getItem('calendarTodos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// Global functions for external access
window.getCalendarEvents = () => events;
window.addCalendarEvent = (event) => {
    events.push({...event, id: Date.now()});
    saveEventsToStorage();
    renderCalendar();
    updateEventsList();
};
window.clearCalendarEvents = () => {
    events = [];
    saveEventsToStorage();
    renderCalendar();
    updateEventsList();
};
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
