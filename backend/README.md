# Syllabus Analyzer Backend

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on http://localhost:3000

## Customizing the Prompt

The prompt is defined in `server.js` in the `generatePrompt()` function (lines 17-144). You can modify this function to:

- Change what information is extracted
- Adjust the JSON structure
- Add new fields to extract
- Change the tone or instructions

Example: To add a new field for "tutoring hours":

```javascript
function generatePrompt(text) {
    return `You are an expert syllabus analyzer...
    
    {
      "courseInfo": {
        ...
        "tutoringHours": "Available tutoring hours"  // ← Add this
      },
      ...
    }
    `;
}
```

## API Endpoints

### POST /api/analyze-syllabus

Analyzes syllabus text and returns structured data.

**Request:**
```json
{
  "text": "Course syllabus text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseInfo": {...},
    "datesAndDeadlines": [...],
    "assignments": [...],
    ...
  }
}
```

### GET /api/health

Health check endpoint.

### GET /api/cache/list

Lists all cached courses with their course codes, names, and timestamps.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "courses": [
    {
      "key": "REL100",
      "courseCode": "REL100",
      "courseName": "Religion, Race, and Social Justice",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "size": 12345
    }
  ]
}
```

### GET /api/cache/:key

Retrieves a cached course by its key (usually the course code).

### DELETE /api/cache/:key

Deletes a specific cached course.

### DELETE /api/cache

Clears all cached courses.

## Caching System

**Important**: The API automatically caches results by course code to save API calls and costs.

### How It Works

1. **First Upload**: When a syllabus is uploaded for the first time:
   - Course code is extracted from the text (e.g., "REL100", "CS 101")
   - If found, it's used as the cache key
   - If not found, a hash of the text is used as fallback
   - OpenAI API is called
   - Result is saved to `backend/cache/{courseCode}.json`

2. **Subsequent Uploads**: When the same course syllabus is uploaded again:
   - System checks cache first
   - If found, returns cached result immediately
   - **No API call is made** - saves time and money!

3. **Multiple Classes**: Each course is cached separately by course code:
   - REL100.json
   - CS101.json
   - ENG200.json
   - etc.

### Cache Location

Cached files are stored in: `backend/cache/`

The cache directory is automatically created when the server starts.

### Managing Cache

- **View all cached courses**: `GET http://localhost:3000/api/cache/list`
- **Delete a specific course**: `DELETE http://localhost:3000/api/cache/REL100`
- **Clear all cache**: `DELETE http://localhost:3000/api/cache`

## Frontend Integration

The frontend (`app.js`) automatically uses this backend if it's running. If the backend is not available, it falls back to direct OpenAI API calls.

## Environment Variables

Create a `.env` file in the `backend` directory:

```
OPENAI_API_KEY=your-api-key-here
```

Or set it when starting the server:

```bash
OPENAI_API_KEY=your-key npm start
```

