// Backend Server for Syllabus Analyzer
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Cache directory
const CACHE_DIR = path.join(__dirname, 'cache');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log('Created cache directory:', CACHE_DIR);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large text payloads

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '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'
});

// Cache management functions
function getCacheKey(text, courseCode = null) {
    // If course code is provided, use it as the key
    if (courseCode) {
        return courseCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    }
    // Otherwise, create a hash of the text content
    return crypto.createHash('sha256').update(text.substring(0, 1000)).digest('hex').substring(0, 16);
}

function getCacheFilePath(key) {
    return path.join(CACHE_DIR, `${key}.json`);
}

function loadFromCache(key) {
    try {
        const filePath = getCacheFilePath(key);
        if (fs.existsSync(filePath)) {
            const cachedData = fs.readFileSync(filePath, 'utf8');
            const parsed = JSON.parse(cachedData);
            console.log(`✅ Cache hit for key: ${key}`);
            return parsed;
        }
    } catch (error) {
        console.error('Error loading from cache:', error);
    }
    return null;
}

function saveToCache(key, data) {
    try {
        // Ensure cache directory exists
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            console.log('📁 Created cache directory:', CACHE_DIR);
        }
        
        const filePath = getCacheFilePath(key);
        const jsonData = JSON.stringify(data, null, 2);
        
        // Write file
        fs.writeFileSync(filePath, jsonData, 'utf8');
        
        // Verify file was written
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            console.log(`💾 Cached result for key: ${key}`);
            console.log(`   📁 File saved to: ${filePath}`);
            console.log(`   📊 File size: ${stats.size} bytes`);
            
            // Verify it can be read back
            const verifyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (verifyData && verifyData.data) {
                console.log(`   ✅ Verification successful: ${Object.keys(verifyData.data).length} top-level keys in cached data`);
            }
        } else {
            console.error(`❌ Failed to verify cache file: ${filePath}`);
        }
    } catch (error) {
        console.error('❌ Error saving to cache:', error);
        console.error('   Stack:', error.stack);
    }
}

// Compress text for API if too large
function compressTextForAPI(text) {
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
    
    // Remove repetitive lines (headers/footers)
    const lines = text.split('\n');
    const seen = new Set();
    const uniqueLines = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 5) {
            const lower = trimmed.toLowerCase();
            if (!seen.has(lower)) {
                seen.add(lower);
                uniqueLines.push(trimmed);
            }
        }
    }
    
    let compressed = uniqueLines.join('\n');
    
    // Extract key sections with context
    const words = compressed.toLowerCase().split(/\s+/);
    const importantSections = [];
    const contextWindow = 20;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^\w]/g, '');
        if (keywords.some(keyword => word.includes(keyword))) {
            const start = Math.max(0, i - contextWindow);
            const end = Math.min(words.length, i + contextWindow);
            const section = words.slice(start, end).join(' ');
            if (section.length > 20) {
                importantSections.push(section);
            }
        }
    }
    
    // Remove duplicates
    const uniqueSections = [...new Set(importantSections)];
    let result = uniqueSections.join(' ');
    
    // Final limit
    if (result.length > 25000) {
        result = result.substring(0, 25000);
    }
    
    return result || compressed.substring(0, 25000); // Fallback to compressed original
}

// Try to extract course code from text (quick heuristic)
function extractCourseCode(text) {
    // Look for common patterns like "REL100", "CS 101", "ENG-200", etc.
    const patterns = [
        /([A-Z]{2,4}\s*\d{3})/i,  // "REL100" or "CS 101"
        /([A-Z]{2,4}-?\d{3})/i,   // "ENG-200"
        /Course\s+([A-Z]{2,4}\s*\d{3})/i,
        /([A-Z]{2,4}\s*\d{3}[A-Z]?)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    return null;
}

// Customizable prompt template
function generatePrompt(text) {
    return `You are an information extraction system.  
Analyze the following syllabus text and return a structured JSON object containing all major course details in this exact structure and hierarchy.

Extract all relevant information according to the following schema:

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
      "type": "assignment|exam|quiz|deadline|holiday|break|paper|project",
      "description": "",
      "worth": ""
    }
  ]
}

Extraction Instructions:
- Identify the course title, code, semester, meeting times, and location.
- Under "instructor", extract the instructor’s name, email, office hours, and location.
- Under "teachingAssistants", include **all TAs** with their names, emails, and office hours (if listed).
- In "gradingBreakdown", list each graded component, its percentage weight, and any related description.
- In "policies", extract major policy sections (attendance, late work, academic integrity, technology use, etc.) with their titles and full explanations.
- In "requiredMaterials", include each required or supplemental text with title, author, year, and any relevant details like edition or ISBN.
- In "datesAndDeadlines", extract all important due dates (assignments, exams, holidays, breaks, etc.), along with a brief description and percentage weight or points if mentioned.
- Use consistent formatting for all dates (e.g., "September 30" not "9/30").
- Exclude unnecessary text like URLs unless they are part of a reading or assignment.
- Return only clean, well-structured JSON with no commentary or explanation.
${text}`;
}

// API endpoint to analyze syllabus
app.post('/api/analyze-syllabus', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }
        
        console.log(`\n📄 Received ${text.length} characters of text to analyze`);
        
        // Compress text if too large (OpenAI has token limits)
        const maxTextLength = 25000; // Conservative limit (~7000 tokens)
        let textToAnalyze = text;
        
        if (text.length > maxTextLength) {
            console.log(`⚠️ Text too large (${text.length} chars). Compressing...`);
            textToAnalyze = compressTextForAPI(text);
            console.log(`📉 Compressed to ${textToAnalyze.length} characters`);
        }
        
        // Try to extract course code from text for better caching
        let courseCode = extractCourseCode(text);
        
        // Generate initial cache key
        let cacheKey = getCacheKey(text, courseCode);
        console.log(`🔑 Cache key: ${cacheKey}${courseCode ? ` (from course code: ${courseCode})` : ' (from text hash)'}`);
        
        // Check cache first
        const cachedResult = loadFromCache(cacheKey);
        if (cachedResult) {
            console.log(`🚀 Returning cached result - no API call needed!\n`);
            return res.json({ success: true, data: cachedResult.data, cached: true });
        }
        
        console.log(`🔄 Cache miss - calling OpenAI API...`);
        
        // Generate the prompt with compressed text
        const prompt = generatePrompt(textToAnalyze);
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4000,
            temperature: 0.1
        });
        
        const result = completion.choices[0].message.content;
        
        // Extract JSON from response
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
        
        const analysis = JSON.parse(jsonText);
        
        console.log('✅ Analysis complete:', Object.keys(analysis));
        
        // Update cache key if we got a course code from the analysis
        if (analysis.courseInfo && analysis.courseInfo.courseCode) {
            const extractedCode = analysis.courseInfo.courseCode.trim();
            if (extractedCode && extractedCode !== courseCode) {
                const newCacheKey = getCacheKey(text, extractedCode);
                console.log(`🔑 Updating cache key to: ${newCacheKey} (using course code from analysis: ${extractedCode})`);
                cacheKey = newCacheKey;
            }
        }
        
        // Save to cache for future use
        saveToCache(cacheKey, { data: analysis, timestamp: new Date().toISOString() });
        
        return res.json({ success: true, data: analysis, cached: false });
        
    } catch (error) {
        console.error('❌ Error analyzing syllabus:', error);
        return res.status(500).json({ 
            error: 'Failed to analyze syllabus', 
            details: error.message 
        });
    }
});

// Assignment breakdown endpoint
app.post('/api/analyze-assignment', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        console.log(`\n📝 Analyzing assignment...`);
        
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
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
        });
        
        const result = completion.choices[0].message.content;
        
        // Extract JSON from response
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
        
        const breakdown = JSON.parse(jsonText);
        
        console.log('✅ Assignment breakdown complete');
        
        return res.json({ success: true, data: breakdown });
        
    } catch (error) {
        console.error('❌ Error analyzing assignment:', error);
        return res.status(500).json({ 
            error: 'Failed to analyze assignment', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Syllabus Analyzer API is running' });
});

// List all cached courses
app.get('/api/cache/list', (req, res) => {
    try {
        const files = fs.readdirSync(CACHE_DIR);
        const cacheList = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                try {
                    const filePath = path.join(CACHE_DIR, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    return {
                        key: file.replace('.json', ''),
                        courseCode: data.data?.courseInfo?.courseCode || null,
                        courseName: data.data?.courseInfo?.courseName || null,
                        timestamp: data.timestamp || null,
                        size: fs.statSync(filePath).size,
                        filePath: filePath,
                        fileName: file
                    };
                } catch (error) {
                    return {
                        key: file.replace('.json', ''),
                        error: 'Could not parse cache file'
                    };
                }
            });
        
        res.json({ success: true, count: cacheList.length, courses: cacheList });
    } catch (error) {
        res.status(500).json({ error: 'Failed to list cache', details: error.message });
    }
});

// Get cached course by key
app.get('/api/cache/:key', (req, res) => {
    try {
        const key = req.params.key;
        const cachedResult = loadFromCache(key);
        if (cachedResult) {
            res.json({ success: true, data: cachedResult.data, cached: true });
        } else {
            res.status(404).json({ error: 'Cache not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load cache', details: error.message });
    }
});

// Clear specific cache entry
app.delete('/api/cache/:key', (req, res) => {
    try {
        const key = req.params.key;
        const filePath = getCacheFilePath(key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: `Cache for ${key} deleted` });
        } else {
            res.status(404).json({ error: 'Cache not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete cache', details: error.message });
    }
});

// Clear all cache
app.delete('/api/cache', (req, res) => {
    try {
        const files = fs.readdirSync(CACHE_DIR);
        let deleted = 0;
        files.forEach(file => {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(CACHE_DIR, file));
                deleted++;
            }
        });
        res.json({ success: true, message: `Deleted ${deleted} cache files` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cache', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 Syllabus Analyzer Backend Server`);
    console.log(`   Listening on http://localhost:${PORT}`);
    console.log(`   API Endpoint: http://localhost:${PORT}/api/analyze-syllabus`);
    console.log(`   📁 Cache Directory: ${CACHE_DIR}`);
    console.log(`   💾 Cache files are saved as: ${path.join(CACHE_DIR, '{courseCode}.json')}\n`);
});

