// ========================================
// CONFIGURATION
// ========================================
const OPENAI_API_KEY = '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';
const BACKEND_API = 'http://localhost:3000';

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Global data storage
let extractedSyllabusData = null;
let lastExtractedRawText = '';
let classes = [];
let selectedClassId = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const processingSection = document.getElementById('processingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const processingStatus = document.getElementById('processingStatus');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedSyllabi();
    loadClassesFromStorage();
});

// Load saved syllabi from localStorage on page load
function loadSavedSyllabi() {
    try {
        const savedList = JSON.parse(localStorage.getItem('saved_syllabi_list') || '[]');
        console.log(`📚 Found ${savedList.length} saved syllabi in localStorage`);
        
        // Log all saved syllabi
        savedList.forEach(item => {
            console.log(`   - ${item.courseCode}: ${item.courseName || 'Untitled'}`);
        });
        
        // Store for access via cache manager
        if (savedList.length > 0) {
            console.log(`✅ Saved syllabi ready to load`);
        }
    } catch (error) {
        console.error('Error loading saved syllabi:', error);
    }
}

function setupEventListeners() {
    fileInput.addEventListener('change', handleFileSelect);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

async function processFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }
    
    showProcessing();
    
    try {
        processingStatus.textContent = 'Extracting text from PDF...';
        const text = await extractTextFromPDF(file);
        
        if (!text || text.trim().length === 0) {
            throw new Error('No text could be extracted from the PDF. The file might be scanned or corrupted.');
        }
        
        processingStatus.textContent = `Analyzing document with OpenAI... (${Math.round(text.length/1000)}k characters)`;
        const analysis = await analyzeWithOpenAI(text);
        
        console.log('✅ Analysis received:', analysis);
        displayResults(analysis);
        
    } catch (error) {
        console.error('Error processing file:', error);
        showError(error.message);
    }
}

function showProcessing() {
    uploadArea.style.display = 'none';
    processingSection.style.display = 'block';
    resultsSection.style.display = 'none';
}

function showError(message) {
    processingSection.style.display = 'none';
    uploadArea.style.display = 'block';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = `Error: ${message}`;
    uploadArea.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Extract text from PDF with table reconstruction
async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = async function() {
            try {
                const arrayBuffer = fileReader.result;
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                
                let allPagesTextContent = [];
                
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    textContent.items.forEach(item => {
                        item._pageNum = pageNum;
                    });
                    allPagesTextContent.push(textContent);
                }
                
                const fullText = reconstructAllPagesWithTables(allPagesTextContent);
                lastExtractedRawText = fullText;
                
                const compressedText = compressText(fullText);
                console.log(`Original: ${fullText.length} chars, Compressed: ${compressedText.length} chars`);
                
                resolve(compressedText);
            } catch (error) {
                reject(new Error('Failed to extract text from PDF: ' + error.message));
            }
        };
        
        fileReader.onerror = () => {
            reject(new Error('Failed to read the PDF file.'));
        };
        
        fileReader.readAsArrayBuffer(file);
    });
}

function reconstructAllPagesWithTables(allPagesTextContent) {
    let allItems = [];
    allPagesTextContent.forEach(pageContent => {
        allItems = allItems.concat(pageContent.items);
    });
    
    const rows = [];
    const yGroups = {};
    const TOLERANCE = 2;
    
    allItems.forEach(item => {
        const y = Math.round(item.transform[5] / TOLERANCE) * TOLERANCE;
        if (!yGroups[y]) yGroups[y] = [];
        yGroups[y].push({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            pageNum: item._pageNum || 1
        });
    });
    
    const sortedYPositions = Object.keys(yGroups).sort((a, b) => {
        const aItems = yGroups[a];
        const bItems = yGroups[b];
        if (aItems[0] && bItems[0] && aItems[0].pageNum !== bItems[0].pageNum) {
            return aItems[0].pageNum - bItems[0].pageNum;
        }
        return parseFloat(b) - parseFloat(a);
    });
    
    sortedYPositions.forEach(yPos => {
        const itemsInRow = yGroups[yPos].sort((a, b) => {
            if (a.pageNum === b.pageNum) {
                return a.x - b.x;
            }
            return a.pageNum - b.pageNum;
        });
        
        if (itemsInRow.length > 1) {
            rows.push(itemsInRow);
        } else {
            rows.push([{ text: itemsInRow[0].text, isParagraph: true, pageNum: itemsInRow[0].pageNum }]);
        }
    });
    
    let output = '';
    let inTable = false;
    let currentPage = 0;
    
    rows.forEach((row, rowIndex) => {
        const rowPage = row[0]?.pageNum || 1;
        
        if (rowPage !== currentPage) {
            if (inTable) {
                output += `\n[CONTINUED ON PAGE ${rowPage}]\n`;
            } else {
                output += `\n=== Page ${rowPage} ===\n\n`;
            }
            currentPage = rowPage;
        }
        
        const isTableRow = row.length > 1 && row.every(item => !item.isParagraph);
        
        if (isTableRow) {
            if (!inTable) {
                output += '\n[TABLE START]\n';
                inTable = true;
            }
            const rowText = row.map(item => item.text.trim()).join(' | ');
            output += rowText + '\n';
            
            const nextRow = rows[rowIndex + 1];
            if (!nextRow || nextRow.length <= 1 || nextRow[0].isParagraph) {
                output += '[TABLE END]\n\n';
                inTable = false;
            }
        } else {
            if (inTable) {
                output += '[TABLE END]\n\n';
                inTable = false;
            }
            const text = row.map(item => item.text).join(' ');
            output += text + '\n';
        }
    });
    
    if (inTable) {
        output += '[TABLE END]\n\n';
    }
    
    return output;
}

function compressText(text) {
    // Initial cleanup
    let compressed = text
        .replace(/\s+/g, ' ')  // Multiple spaces to single
        .replace(/\n\s*\n/g, '\n')  // Multiple newlines to single
        .trim();
    
    // Remove PDF artifacts
    compressed = compressed
        .replace(/\f/g, '')  // Form feeds
        .replace(/\r/g, '')  // Carriage returns
        .replace(/\t/g, ' ')  // Tabs to spaces
        .replace(/[^\x20-\x7E\n]/g, '')  // Non-printable chars
        .replace(/\s+/g, ' ')  // Clean up spaces again
        .trim();
    
    // Remove duplicate lines (headers/footers)
    const lines = compressed.split('\n');
    const cleanedLines = [];
    const seenLines = new Set();
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 3) {  // Skip very short lines
            const lower = trimmedLine.toLowerCase();
            // Skip exact duplicates (case-insensitive)
            if (!seenLines.has(lower)) {
                seenLines.add(lower);
                cleanedLines.push(trimmedLine);
            }
        }
    }
    
    const result = cleanedLines.join('\n');
    console.log(`Text compressed from ${text.length} to ${result.length} characters (${Math.round((1 - result.length/text.length) * 100)}% reduction)`);
    
    return result;
}

async function analyzeWithOpenAI(text) {
    const maxTokens = 8000; // OpenAI context limit is ~8000 tokens, using conservative estimate
    const estimatedTokens = Math.ceil(text.length / 3.5); // More accurate token estimate
    
    console.log(`Estimated tokens: ${estimatedTokens}, Text length: ${text.length} characters`);
    
    if (estimatedTokens > maxTokens) {
        console.log(`Text too large (${estimatedTokens} estimated tokens). Compressing...`);
        const compressed = aggressiveCompressText(text);
        const compressedTokens = Math.ceil(compressed.length / 3.5);
        console.log(`After compression: ${compressedTokens} estimated tokens, ${compressed.length} characters`);
        
        // If still too large after compression, use even more aggressive compression
        if (compressedTokens > maxTokens) {
            console.log('Still too large, using ultra-compressed version...');
            const ultraCompressed = ultraCompressText(compressed.length > 5000 ? text : compressed);
            const ultraTokens = Math.ceil(ultraCompressed.length / 3.5);
            console.log(`Ultra-compressed tokens: ${ultraTokens}`);
            
            // If STILL too large, truncate hard
            if (ultraTokens > maxTokens) {
                console.warn(`⚠️ File extremely large. Truncating to ${maxTokens * 3.5} characters...`);
                const truncated = ultraCompressed.substring(0, Math.floor(maxTokens * 3.5));
                return await makeOpenAIRequest(truncated, null);
            }
            
            return await makeOpenAIRequest(ultraCompressed, null);
        }
        
        return await makeOpenAIRequest(compressed, null);
    }
    
    return await makeOpenAIRequest(text, null);
}

function aggressiveCompressText(text) {
    // Remove common PDF artifacts and clean up
    let compressed = text
        .replace(/\s+/g, ' ')  // Multiple spaces to single
        .replace(/\n\s*\n/g, '\n')  // Multiple newlines to single
        .trim();
    
    // Remove repetitive headers/footers
    const lines = compressed.split('\n');
    const seenLines = new Set();
    const cleanedLines = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 3 && trimmed.length < 200) {  // Skip very short or very long lines
            const lower = trimmed.toLowerCase();
            // Skip if we've seen this exact line before (likely header/footer)
            if (!seenLines.has(lower)) {
                seenLines.add(lower);
                cleanedLines.push(trimmed);
            }
        } else if (trimmed.length >= 200) {
            // Keep long lines (might be important content)
            cleanedLines.push(trimmed);
        }
    }
    
    return cleanedLines.join('\n');
}

function ultraCompressText(text) {
    // Extremely aggressive compression - only extract key information
    const keywords = [
        'course', 'instructor', 'professor', 'ta', 'teaching assistant',
        'assignment', 'exam', 'quiz', 'project', 'paper',
        'due', 'date', 'deadline', 'submit',
        'grade', 'grading', 'percentage', 'weight', 'points',
        'policy', 'attendance', 'late', 'academic integrity',
        'schedule', 'week', 'class', 'lecture',
        'reading', 'textbook', 'required', 'material',
        'office', 'hours', 'email', 'contact',
        'semester', 'fall', 'spring', 'summer'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const importantSections = [];
    const contextWindow = 15; // Words before and after keyword
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, '');
        if (keywords.some(keyword => word.includes(keyword))) {
            const start = Math.max(0, i - contextWindow);
            const end = Math.min(words.length, i + contextWindow);
            const section = words.slice(start, end).join(' ');
            importantSections.push(section);
        }
    }
    
    // Remove duplicates while preserving order
    const uniqueSections = [];
    const seen = new Set();
    for (const section of importantSections) {
        if (!seen.has(section) && section.length > 10) {
            seen.add(section);
            uniqueSections.push(section);
        }
    }
    
    let result = uniqueSections.join(' ');
    
    // Final cleanup
    result = result
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,;:!?()-]/g, '')
        .substring(0, 6000)  // Hard limit to ~6000 chars (~1700 tokens)
        .trim();
    
    console.log(`Ultra-compressed from ${text.length} to ${result.length} characters`);
    
    return result;
}

async function makeOpenAIRequest(text, prompt) {
    console.log('Sending request to backend API:', BACKEND_API);
    
    try {
        const response = await fetch(`${BACKEND_API}/api/analyze-syllabus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.details || `Backend API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Backend API response:', data);
        
        if (!data.success || !data.data) {
            console.error('Invalid backend response structure:', data);
            throw new Error('Invalid response from backend API - missing data field');
        }
        
        console.log('Extracted data from backend:', Object.keys(data.data));
        return data.data;
        
    } catch (error) {
        console.error('Backend API error:', error);
        console.log('Falling back to direct OpenAI API call...');
        return await makeDirectOpenAIRequest(text);
    }
}

async function makeDirectOpenAIRequest(text) {
    const prompt = `You are an information extraction system. Analyze the full syllabus text (PDF, DOCX, or TXT) provided and extract *all structured course information* in the following JSON format. Include every class meeting date, topic, reading, assignment, project, exam, break, and policy listed.

Return ONLY valid JSON. Do not include any explanations or notes.

{
  "courseInfo": {
    "courseName": "",
    "courseCode": "",
    "semester": "",
    "schedule": "",
    "location": "",
    "instructor": {
      "name": "",
      "email": "",
      "officeHours": "",
      "officeLocation": ""
    },
    "teachingAssistants": [
      {
        "name": "",
        "email": "",
        "officeHours": ""
      }
    ]
  },
  "gradingBreakdown": [
    {
      "category": "",
      "weight": "",
      "description": ""
    }
  ],
  "policies": [
    {
      "type": "",
      "title": "",
      "description": ""
    }
  ],
  "requiredMaterials": [
    {
      "type": "textbook|article|website|supplemental",
      "title": "",
      "author": "",
      "year": "",
      "details": ""
    }
  ],
  "datesAndDeadlines": [
    {
      "date": "",
      "title": "",
      "type": "lecture|assignment|exam|quiz|deadline|holiday|break|paper|project|reading",
      "description": "",
      "worth": ""
    }
  ]
}

Extraction rules:
1. Parse all instructor and TA info accurately (names, emails, office hours, locations).
2. For “gradingBreakdown,” include all components with weights and short descriptions.
3. For “policies,” include every stated policy (attendance, communication, academic integrity, technology, religious observance, disability, Title IX, etc.).
4. For “requiredMaterials,” list all textbooks, readings, and online materials mentioned, including publication years if available.
5. For “datesAndDeadlines,” include:
   - Every class meeting date (lecture, topic, reading, or discussion)
   - Every due date, project, reflection paper, exam, quiz, or submission
   - Every break, holiday, or no-class day
   - Every reading assignment or online resource (include title and URL in “description”)
   - Multiple entries for the same day if multiple tasks are listed
6. Use ISO date format (YYYY-MM-DD) for all dates whenever possible.
7. If any field cannot be found, leave it as an empty string ("").
8. Return the complete JSON object only — no markdown, commentary, or explanations.
DOCUMENT TEXT:
${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000,
            temperature: 0.1
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response from OpenAI API');
    }
    
    const result = data.choices[0].message.content;
    
    try {
        let jsonText = result;
        const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        } else {
            const objectMatch = result.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                jsonText = objectMatch[0];
            }
        }
        
        return JSON.parse(jsonText);
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        throw new Error('Failed to parse analysis results. Raw response: ' + result);
    }
}

function displayResults(analysis) {
    console.log('=== DISPLAY RESULTS ===');
    console.log('Full analysis object:', JSON.stringify(analysis, null, 2));
    
    processingSection.style.display = 'none';
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
    
    // Keep upload section visible but make it compact
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.style.display = 'block';
        uploadSection.classList.add('compact');
    }
    
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
    
    // Hide the main header to save space
    const header = document.querySelector('header');
    if (header) {
        header.style.display = 'none';
    }
    
    // Save data globally
    extractedSyllabusData = analysis;
    
    // Automatically create class from syllabus if it doesn't exist
    if (analysis && analysis.courseInfo) {
        const courseInfo = analysis.courseInfo;
        const courseCode = courseInfo.courseCode || '';
        const courseName = courseInfo.courseName || '';
        
        if (courseCode && courseName) {
            // Check if class already exists
            const existingClass = classes.find(c => 
                c.code.toUpperCase() === courseCode.toUpperCase()
            );
            
            if (!existingClass) {
                // Create new class with random color
                const colors = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'pink', 'indigo'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                const newClass = {
                    id: Date.now(),
                    name: courseName,
                    code: courseCode,
                    color: randomColor
                };
                
                classes.push(newClass);
                saveClassesToStorage();
                
                console.log(`✅ Created new class: ${courseCode} - ${courseName} (${randomColor})`);
            } else {
                console.log(`ℹ️ Class already exists: ${courseCode}`);
            }
        }
    }
    
    // Save to localStorage for persistence across page reloads
    try {
        const courseCode = analysis?.courseInfo?.courseCode || 'unknown';
        const saveKey = `syllabus_${courseCode}`;
        const dataToSave = {
            data: analysis,
            timestamp: new Date().toISOString(),
            courseCode: courseCode,
            courseName: analysis?.courseInfo?.courseName || ''
        };
        localStorage.setItem(saveKey, JSON.stringify(dataToSave));
        console.log(`✅ Saved to localStorage: ${saveKey}`);
        
        // Also save a list of all saved syllabi
        const savedList = JSON.parse(localStorage.getItem('saved_syllabi_list') || '[]');
        if (!savedList.find(item => item.key === saveKey)) {
            savedList.push({
                key: saveKey,
                courseCode: courseCode,
                courseName: analysis?.courseInfo?.courseName || '',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('saved_syllabi_list', JSON.stringify(savedList));
        }
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
    
    if (!resultsContent) {
        console.error('Results content element not found!');
        return;
    }
    
    resultsContent.innerHTML = '';
    
    if (!analysis || Object.keys(analysis).length === 0) {
        resultsContent.innerHTML = `
            <div class="result-card">
                <h3>⚠️ No Data Found</h3>
                <p>No information could be extracted from the syllabus.</p>
            </div>
        `;
        return;
    }
    
    // Build simple HTML display
    let html = '';
    
    // Course Information - ALWAYS show this section, even if fields are empty
    html += '<div class="result-card"><h3>📚 Course Information</h3>';
    const info = analysis.courseInfo || {};
    
    console.log('Course info object:', info);
    console.log('Course info keys:', Object.keys(info));
    
    // Show all fields, even if empty - this helps debug
    html += `<p><strong>Course:</strong> ${info.courseName || '(not found)'}</p>`;
    html += `<p><strong>Code:</strong> ${info.courseCode || '(not found)'}</p>`;
    html += `<p><strong>Semester:</strong> ${info.semester || '(not found)'}</p>`;
    html += `<p><strong>Schedule:</strong> ${info.schedule || '(not found)'}</p>`;
    html += `<p><strong>Location:</strong> ${info.location || '(not found)'}</p>`;
    
    // Instructor - handle both object and string format
    if (info.instructor) {
        if (typeof info.instructor === 'object' && info.instructor !== null) {
            html += `<p><strong>Instructor:</strong> ${info.instructor.name || '(name not found)'}</p>`;
            html += `<p><strong>Email:</strong> ${info.instructor.email || '(email not found)'}</p>`;
            html += `<p><strong>Office Hours:</strong> ${info.instructor.officeHours || '(not specified)'}</p>`;
            html += `<p><strong>Office Location:</strong> ${info.instructor.officeLocation || '(not specified)'}</p>`;
        } else if (typeof info.instructor === 'string') {
            html += `<p><strong>Instructor:</strong> ${info.instructor}</p>`;
        }
    } else {
        html += `<p><strong>Instructor:</strong> (not found)</p>`;
    }
    
    // Teaching Assistants
    if (info.teachingAssistants && Array.isArray(info.teachingAssistants) && info.teachingAssistants.length > 0) {
        html += '<p><strong>Teaching Assistants:</strong></p><ul>';
        info.teachingAssistants.forEach(ta => {
            html += '<li>';
            html += ta.name || '(no name)';
            if (ta.email) html += ` (${ta.email})`;
            if (ta.officeHours) html += ` - Hours: ${ta.officeHours}`;
            html += '</li>';
        });
        html += '</ul>';
    } else {
        html += '<p><strong>Teaching Assistants:</strong> (none listed)</p>';
    }
    
    html += '</div>';
    
    // Dates and Deadlines
    if (analysis.datesAndDeadlines && Array.isArray(analysis.datesAndDeadlines) && analysis.datesAndDeadlines.length > 0) {
        html += '<div class="result-card"><h3>📅 Dates & Deadlines</h3><ul>';
        analysis.datesAndDeadlines.forEach(date => {
            html += '<li>';
            if (date.date) html += `<strong>${date.date}</strong> - `;
            if (date.title) html += date.title;
            if (date.description) html += `: ${date.description}`;
            if (date.worth) html += ` (${date.worth})`;
            if (date.type) html += ` [${date.type}]`;
            html += '</li>';
        });
        html += '</ul></div>';
    }
    
    // Assignments
    if (analysis.assignments && Array.isArray(analysis.assignments) && analysis.assignments.length > 0) {
        html += '<div class="result-card"><h3>✏️ Assignments</h3><ul>';
        analysis.assignments.forEach(assignment => {
            html += '<li>';
            if (assignment.name) html += `<strong>${assignment.name}</strong>`;
            if (assignment.description) html += `: ${assignment.description}`;
            if (assignment.dueDate) html += ` <em>(Due: ${assignment.dueDate})</em>`;
            if (assignment.weight) html += ` - ${assignment.weight}`;
            html += '</li>';
        });
        html += '</ul></div>';
    }
    
    // Grading Breakdown
    if (analysis.gradingBreakdown && Array.isArray(analysis.gradingBreakdown) && analysis.gradingBreakdown.length > 0) {
        html += '<div class="result-card"><h3>🎯 Grading Breakdown</h3><ul>';
        analysis.gradingBreakdown.forEach(grade => {
            html += '<li>';
            if (grade.category) html += `<strong>${grade.category}</strong>`;
            if (grade.weight) html += ` - ${grade.weight}`;
            if (grade.description) html += `: ${grade.description}`;
            html += '</li>';
        });
        html += '</ul></div>';
    }
    
    // Policies
    if (analysis.policies && Array.isArray(analysis.policies) && analysis.policies.length > 0) {
        html += '<div class="result-card"><h3>📋 Policies</h3>';
        analysis.policies.forEach(policy => {
            html += '<div style="margin-bottom: 1rem;">';
            if (policy.title) html += `<h4>${policy.title}</h4>`;
            if (policy.description) html += `<p>${policy.description}</p>`;
            if (policy.type) html += `<small style="color: #666;">Type: ${policy.type}</small>`;
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Required Materials
    if (analysis.requiredMaterials && Array.isArray(analysis.requiredMaterials) && analysis.requiredMaterials.length > 0) {
        html += '<div class="result-card"><h3>📖 Required Materials</h3><ul>';
        analysis.requiredMaterials.forEach(material => {
            html += '<li>';
            if (material.title) html += `<strong>${material.title}</strong>`;
            if (material.author) html += ` by ${material.author}`;
            if (material.year) html += ` (${material.year})`;
            if (material.details) html += ` - ${material.details}`;
            if (material.type) html += ` [${material.type}]`;
            html += '</li>';
        });
        html += '</ul></div>';
    }
    
    // If no sections were created, show raw data
    if (!html || html.trim() === '') {
        html = `
            <div class="result-card">
                <h3>📋 Analysis Results</h3>
                <p>Raw data from OpenAI:</p>
                <pre style="background: #f8f9fa; padding: 1rem; border-radius: 6px; overflow: auto; font-size: 12px; max-height: 500px; white-space: pre-wrap;">${JSON.stringify(analysis, null, 2)}</pre>
            </div>
        `;
    } else {
        // Add debug section showing raw data
        html += `
            <div class="result-card" style="margin-top: 2rem; border-top: 2px dashed #ccc; padding-top: 1rem;">
                <details>
                    <summary style="cursor: pointer; color: #666; font-size: 0.9rem;">🔍 Debug: View Raw JSON Data</summary>
                    <pre style="background: #f8f9fa; padding: 1rem; border-radius: 6px; overflow: auto; font-size: 11px; max-height: 300px; margin-top: 0.5rem; white-space: pre-wrap;">${JSON.stringify(analysis, null, 2)}</pre>
                </details>
            </div>
        `;
    }
    
    resultsContent.innerHTML = html;
    console.log('✅ Display complete');
}

function clearResults() {
    resultsSection.style.display = 'none';
    
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.classList.remove('compact');
    }
    
    // Show the main header again
    const header = document.querySelector('header');
    if (header) {
        header.style.display = 'block';
    }
    
    uploadArea.style.display = 'block';
    fileInput.value = '';
    lastExtractedRawText = '';
    extractedSyllabusData = null;
}

function downloadExtractedText() {
    try {
        const content = lastExtractedRawText && lastExtractedRawText.trim() ? lastExtractedRawText :
            (extractedSyllabusData ? JSON.stringify(extractedSyllabusData, null, 2) : '');
        if (!content) {
            alert('There is no extracted text to download yet. Please upload a syllabus PDF first.');
            return;
        }
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'syllabus-extracted.txt';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Failed to download text:', e);
        alert('Could not download the extracted text.');
    }
}

// Cache management functions
function showCacheManager() {
    const cacheSection = document.getElementById('cacheSection');
    const resultsSection = document.getElementById('resultsSection');
    const uploadSection = document.getElementById('uploadSection');
    const uploadArea = document.getElementById('uploadArea');
    const header = document.querySelector('header');
    
    resultsSection.style.display = 'none';
    
    if (uploadSection) {
        uploadSection.style.display = 'none';
    }
    
    if (uploadArea) {
        uploadArea.style.display = 'none';
    }
    
    if (header) {
        header.style.display = 'none';
    }
    
    cacheSection.style.display = 'block';
    
    loadCacheList();
}

function hideCacheManager() {
    const cacheSection = document.getElementById('cacheSection');
    cacheSection.style.display = 'none';
    
    const uploadSection = document.getElementById('uploadSection');
    if (uploadSection) {
        uploadSection.style.display = 'block';
    }
    
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.style.display = 'block';
    }
    
    // Show header if no results are displayed
    if (resultsSection.style.display === 'none') {
        const header = document.querySelector('header');
        if (header) {
            header.style.display = 'block';
        }
    }
}

async function loadCacheList() {
    const cacheContent = document.getElementById('cacheContent');
    cacheContent.innerHTML = '<p>Loading saved courses...</p>';
    
    try {
        // Load from backend cache
        let backendCourses = [];
        try {
            const response = await fetch(`${BACKEND_API}/api/cache/list`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.count > 0) {
                    backendCourses = result.courses.map(c => ({...c, source: 'backend'}));
                }
            }
        } catch (backendError) {
            console.warn('Backend cache not available:', backendError.message);
        }
        
        // Load from localStorage
        const localStorageCourses = [];
        try {
            const savedList = JSON.parse(localStorage.getItem('saved_syllabi_list') || '[]');
            savedList.forEach(item => {
                localStorageCourses.push({
                    key: item.key,
                    courseCode: item.courseCode,
                    courseName: item.courseName || 'No course name',
                    timestamp: item.timestamp,
                    source: 'localStorage'
                });
            });
        } catch (localError) {
            console.warn('Error loading localStorage:', localError);
        }
        
        // Combine both sources
        const allCourses = [...backendCourses, ...localStorageCourses];
        
        if (allCourses.length === 0) {
            cacheContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <p style="color: #666;">No saved courses found.</p>
                    <p style="color: #999; font-size: 0.9rem; margin-top: 0.5rem;">Upload and analyze a syllabus to save it here.</p>
                </div>
            `;
            return;
        }
        
        let html = `<div class="cache-list">`;
        
        allCourses.forEach(course => {
            const date = course.timestamp ? new Date(course.timestamp).toLocaleString() : 'Unknown';
            const sourceBadge = course.source === 'backend' 
                ? '<span style="background: #4CAF50; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">Backend</span>'
                : '<span style="background: #2196F3; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px;">Local</span>';
            
            html += `
                <div class="cache-item">
                    <div class="cache-item-info">
                        <div class="cache-item-code">${course.courseCode || course.key}${sourceBadge}</div>
                        <div class="cache-item-name">${course.courseName || 'No course name'}</div>
                        <div class="cache-item-time">Saved: ${date}</div>
                    </div>
                    <div class="cache-item-actions">
                        <button class="btn btn-secondary" onclick="loadCachedCourse('${course.key}', '${course.source}')">View</button>
                        <button class="btn btn-danger" onclick="deleteCachedCourse('${course.key}', '${course.source}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        html += `<p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">Total: ${allCourses.length} saved course(s) (${backendCourses.length} backend, ${localStorageCourses.length} local)</p>`;
        
        cacheContent.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading cache list:', error);
        cacheContent.innerHTML = `
            <div class="error">
                <p><strong>Error loading cache</strong></p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

async function loadCachedCourse(key, source = 'backend') {
    try {
        let data = null;
        
        if (source === 'localStorage') {
            // Load from localStorage
            const saved = localStorage.getItem(key);
            if (!saved) {
                throw new Error('Course not found in localStorage');
            }
            const parsed = JSON.parse(saved);
            data = parsed.data;
            console.log(`✅ Loaded from localStorage: ${key}`);
        } else {
            // Load from backend
            const response = await fetch(`${BACKEND_API}/api/cache/${key}`);
            
            if (!response.ok) {
                throw new Error('Failed to load cached course');
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                data = result.data;
                console.log(`✅ Loaded from backend: ${key}`);
            } else {
                throw new Error('No data in response');
            }
        }
        
        if (data) {
            extractedSyllabusData = data;
            hideCacheManager();
            displayResults(data); // This will handle showing results at top and compact upload at bottom
        }
        
    } catch (error) {
        console.error('Error loading cached course:', error);
        alert('Failed to load cached course: ' + error.message);
    }
}

async function deleteCachedCourse(key, source = 'backend') {
    if (!confirm(`Are you sure you want to delete the saved course "${key}"?`)) {
        return;
    }
    
    try {
        if (source === 'localStorage') {
            // Delete from localStorage
            localStorage.removeItem(key);
            
            // Remove from saved list
            const savedList = JSON.parse(localStorage.getItem('saved_syllabi_list') || '[]');
            const filtered = savedList.filter(item => item.key !== key);
            localStorage.setItem('saved_syllabi_list', JSON.stringify(filtered));
            
            console.log(`✅ Deleted from localStorage: ${key}`);
        } else {
            // Delete from backend
            const response = await fetch(`${BACKEND_API}/api/cache/${key}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete cached course');
            }
            
            console.log(`✅ Deleted from backend: ${key}`);
        }
        
        loadCacheList();
        
    } catch (error) {
        console.error('Error deleting cached course:', error);
        alert('Failed to delete cached course: ' + error.message);
    }
}

async function clearAllCache() {
    if (!confirm('Are you sure you want to delete ALL cached courses? This cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_API}/api/cache`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear cache');
        }
        
        const result = await response.json();
        alert(result.message || 'All cache cleared successfully');
        loadCacheList();
        
    } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Failed to clear cache: ' + error.message);
    }
}

function refreshCacheList() {
    loadCacheList();
}

// Make functions globally accessible
window.showCacheManager = showCacheManager;
window.hideCacheManager = hideCacheManager;
window.loadCachedCourse = loadCachedCourse;
window.deleteCachedCourse = deleteCachedCourse;
window.clearAllCache = clearAllCache;
window.refreshCacheList = refreshCacheList;
window.downloadExtractedText = downloadExtractedText;
window.clearResults = clearResults;
window.sendToCalendar = sendToCalendar;

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

// Send extracted syllabus data to calendar and to-do list
function sendToCalendar() {
    if (!extractedSyllabusData) {
        alert('No syllabus data available. Please analyze a syllabus first.');
        return;
    }
    
    try {
        // Save data to localStorage so calendar and to-do list can pick it up
        localStorage.setItem('syllabusDataForCalendar', JSON.stringify(extractedSyllabusData));
        localStorage.setItem('syllabusDataForTodo', JSON.stringify(extractedSyllabusData));
        
        console.log('✅ Data saved for calendar and to-do list');
        
        // Ask user where they want to go
        const choice = confirm('Syllabus data saved!\n\nClick OK to go to Calendar\nClick Cancel to go to To-Do List');
        
        if (choice) {
            window.location.href = 'calendar.html';
        } else {
            window.location.href = 'todo.html';
        }
    } catch (error) {
        console.error('Error sending to calendar:', error);
        alert('Failed to send data: ' + error.message);
    }
}
