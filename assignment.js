// Assignment Breakdown Application JavaScript

// Backend API endpoint
const BACKEND_API = 'http://localhost:3000';

// OpenAI API Key (fallback for direct calls)
const OPENAI_API_KEY = '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';

// Global state
let classes = [];
let currentBreakdown = null;

// DOM Elements
const assignmentForm = document.getElementById('assignmentForm');
const uploadSection = document.getElementById('uploadSection');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const processingStatus = document.getElementById('processingStatus');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadClassesFromStorage();
    updateClassSelect();
    setupEventListeners();
});

function setupEventListeners() {
    assignmentForm.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('assignmentTitle').value;
    const classId = document.getElementById('assignmentClass').value;
    const dueDate = document.getElementById('finalDueDate').value;
    const instructions = document.getElementById('assignmentInstructions').value;
    
    // Show processing
    uploadSection.style.display = 'none';
    processingSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    try {
        // Call AI academic coach
        processingStatus.textContent = 'AI Coach is analyzing your assignment...';
        const breakdown = await analyzeAssignment(title, instructions, dueDate, classId);
        
        // Store breakdown
        currentBreakdown = {
            title,
            classId,
            dueDate,
            instructions,
            breakdown
        };
        
        // Display results
        displayBreakdown(breakdown);
        
        processingSection.style.display = 'none';
        resultsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error analyzing assignment:', error);
        processingSection.style.display = 'none';
        uploadSection.style.display = 'block';
        showMessage('Failed to analyze assignment: ' + error.message, 'error');
    }
}

async function analyzeAssignment(title, instructions, dueDate, classId) {
    const prompt = `You are an academic coach helping a student break down their assignment into manageable steps. Analyze the following assignment and provide a structured breakdown.

**Assignment Title:** ${title}
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

    console.log('Sending to AI Academic Coach...');
    
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
                console.log('✅ Received breakdown from backend');
                return result.data;
            }
        }
    } catch (backendError) {
        console.warn('Backend not available, using direct OpenAI call');
    }
    
    // Fallback to direct OpenAI call
    return await callOpenAIDirect(prompt);
}

async function callOpenAIDirect(prompt) {
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
                    content: 'You are an experienced academic coach who helps students break down complex assignments into manageable steps. You provide clear, actionable guidance with realistic deadlines.'
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

function displayBreakdown(breakdown) {
    resultsContent.innerHTML = '';
    
    // Simplified explanation
    if (breakdown.simplified) {
        const simplifiedCard = document.createElement('div');
        simplifiedCard.className = 'breakdown-card simplified-section';
        simplifiedCard.innerHTML = `
            <h3>📝 What You Need to Do</h3>
            <p>${breakdown.simplified}</p>
        `;
        resultsContent.appendChild(simplifiedCard);
    }
    
    // Steps breakdown
    if (breakdown.steps && breakdown.steps.length > 0) {
        const stepsCard = document.createElement('div');
        stepsCard.className = 'breakdown-card steps-section';
        
        let stepsHTML = '<h3>📋 Step-by-Step Plan</h3>';
        
        breakdown.steps.forEach(step => {
            const deadline = step.suggestedDeadline ? 
                new Date(step.suggestedDeadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '';
            
            stepsHTML += `
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
        
        stepsCard.innerHTML = stepsHTML;
        resultsContent.appendChild(stepsCard);
    }
    
    // Timeline view
    if (breakdown.steps && breakdown.steps.length > 0) {
        const timelineCard = document.createElement('div');
        timelineCard.className = 'breakdown-card timeline-section';
        
        let timelineHTML = '<h3>📅 Suggested Timeline</h3>';
        
        breakdown.steps.forEach(step => {
            if (step.suggestedDeadline) {
                const deadline = new Date(step.suggestedDeadline).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
                
                timelineHTML += `
                    <div class="timeline-item">
                        <div class="timeline-date">${deadline}</div>
                        <div class="timeline-task">${step.title}</div>
                    </div>
                `;
            }
        });
        
        timelineCard.innerHTML = timelineHTML;
        resultsContent.appendChild(timelineCard);
    }
    
    // Tips
    if (breakdown.tips && breakdown.tips.length > 0) {
        const tipsCard = document.createElement('div');
        tipsCard.className = 'breakdown-card tips-section';
        
        let tipsHTML = '<h3>💡 Tips for Success</h3>';
        
        breakdown.tips.forEach(tip => {
            tipsHTML += `
                <div class="tip-item">
                    <div class="tip-icon">💡</div>
                    <div class="tip-text">${tip}</div>
                </div>
            `;
        });
        
        tipsCard.innerHTML = tipsHTML;
        resultsContent.appendChild(tipsCard);
    }
    
    // Resources
    if (breakdown.resources && breakdown.resources.length > 0) {
        const resourcesCard = document.createElement('div');
        resourcesCard.className = 'breakdown-card';
        
        let resourcesHTML = '<h3>📚 Helpful Resources</h3><ul>';
        
        breakdown.resources.forEach(resource => {
            resourcesHTML += `<li>${resource}</li>`;
        });
        
        resourcesHTML += '</ul>';
        resourcesCard.innerHTML = resourcesHTML;
        resultsContent.appendChild(resourcesCard);
    }
}

function addAllToTodoList() {
    if (!currentBreakdown || !currentBreakdown.breakdown.steps) {
        showMessage('No steps to add', 'error');
        return;
    }
    
    try {
        const classId = currentBreakdown.classId ? parseInt(currentBreakdown.classId) : null;
        
        // Load existing todos
        let todos = JSON.parse(localStorage.getItem('todoListTodos') || '[]');
        
        // Load existing calendar todos
        let calendarTodos = JSON.parse(localStorage.getItem('calendarTodos') || '[]');
        
        // Load existing calendar events
        let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        
        let addedCount = 0;
        
        currentBreakdown.breakdown.steps.forEach(step => {
            if (step.suggestedDeadline) {
                // Add to to-do list
                const todo = {
                    id: Date.now() + Math.random(),
                    title: `${currentBreakdown.title} - ${step.title}`,
                    classId: classId,
                    priority: 'medium',
                    dueDate: step.suggestedDeadline,
                    description: step.description + (step.estimatedTime ? `\n\nEstimated time: ${step.estimatedTime}` : ''),
                    completed: false,
                    createdAt: new Date().toISOString(),
                    source: 'assignment'
                };
                todos.push(todo);
                
                // Also add to calendar todos
                const calendarTodo = {
                    id: Date.now() + Math.random() + 0.1,
                    title: `${currentBreakdown.title} - ${step.title}`,
                    classId: classId,
                    priority: 'medium',
                    dueDate: step.suggestedDeadline,
                    description: step.description,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    source: 'assignment'
                };
                calendarTodos.push(calendarTodo);
                
                // Add to calendar as an event
                const calendarEvent = {
                    id: Date.now() + Math.random() + 0.2,
                    title: `${currentBreakdown.title} - ${step.title}`,
                    date: step.suggestedDeadline,
                    time: '',
                    type: 'assignment',
                    description: step.description + (step.estimatedTime ? ` (Est. ${step.estimatedTime})` : ''),
                    classId: classId,
                    source: 'assignment',
                    worth: step.estimatedTime || ''
                };
                calendarEvents.push(calendarEvent);
                
                addedCount++;
            }
        });
        
        // Save all data
        localStorage.setItem('todoListTodos', JSON.stringify(todos));
        localStorage.setItem('calendarTodos', JSON.stringify(calendarTodos));
        localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
        
        console.log(`✅ Added ${addedCount} items to:
- To-Do List
- Calendar To-Dos
- Calendar Events`);
        
        showMessage(`Added ${addedCount} mock deadlines to calendar and to-do lists!`, 'success');
        
        // Ask where user wants to go
        const choice = confirm('Mock deadlines added successfully!\n\nClick OK to view Calendar\nClick Cancel to view To-Do List');
        if (choice) {
            window.location.href = 'calendar.html';
        } else {
            window.location.href = 'todo.html';
        }
        
    } catch (error) {
        console.error('Error adding mock deadlines:', error);
        showMessage('Failed to add mock deadlines: ' + error.message, 'error');
    }
}

function clearResults() {
    resultsSection.style.display = 'none';
    uploadSection.style.display = 'block';
    assignmentForm.reset();
    currentBreakdown = null;
}

function updateClassSelect() {
    const classSelect = document.getElementById('assignmentClass');
    classSelect.innerHTML = '<option value="">No class</option>';
    
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = `${classItem.code} - ${classItem.name}`;
        classSelect.appendChild(option);
    });
}

function loadClassesFromStorage() {
    const stored = localStorage.getItem('calendarClasses');
    if (stored) {
        classes = JSON.parse(stored);
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

// Global functions
window.addAllToTodoList = addAllToTodoList;
window.clearResults = clearResults;

