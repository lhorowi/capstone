# How to Use the Backend for Customizing Prompts

## Quick Start

1. **Install Node.js and npm** (if not already installed)
   - Download from https://nodejs.org/
   
2. **Navigate to the backend folder:**
   ```bash
   cd /Users/lindseyhorowitz/Desktop/capstone/capstone/backend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```

5. **The server will run on http://localhost:3000**
   - Keep this terminal open
   - Your frontend will automatically use this backend

## Customizing the Query/Prompt

### Location
Open: `backend/server.js`

### What to Edit
Find the `generatePrompt()` function (starting around line 9). This is where you can customize:

1. **What information to extract:**
   - Add new fields to the JSON structure
   - Modify existing fields
   - Change field names

2. **Instructions to the AI:**
   - Change emphasis (e.g., "Extract ALL dates" becomes "Extract critical dates only")
   - Add new requirements
   - Modify tone or specificity

3. **Prompt structure:**
   - Change the JSON schema
   - Add new sections to analyze
   - Modify existing sections

### Example: Adding Emphasis on Specific Information

```javascript
function generatePrompt(text) {
    return `You are an expert syllabus analyzer. 

PRIORITY: Focus heavily on extracting dates and deadlines. Be EXTREMELY thorough with this.

// ... rest of prompt
    `;
}
```

### Example: Adding a New Field

```javascript
{
  "courseInfo": {
    "courseName": "Full course name",
    "courseCode": "Course code/number",
    // ADD THIS:
    "creditHours": "Number of credit hours",
    "semester": "Fall 2024 / Spring 2025"
  },
  // ... rest of structure
}
```

## Important Notes

- **The frontend falls back** to direct OpenAI calls if the backend is not running
- **Restart the backend** after making changes to `server.js`
- **Test changes** by uploading a syllabus PDF
- **Check console** for any errors or debugging info

## File Structure

```
backend/
├── server.js       ← Edit prompts here
├── package.json    ← Dependencies
├── README.md       ← Full documentation
└── START-BACKEND.md ← This file
```

## Troubleshooting

- **"Cannot connect to backend"**: Make sure you ran `npm start` in the backend folder
- **"npm not found"**: Install Node.js from nodejs.org
- **Port 3000 already in use**: Change the PORT in server.js (line 5)

