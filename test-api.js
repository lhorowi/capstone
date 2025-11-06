// Test script to show the API schema returned
// Run this with: node test-api.js

const fetch = require('node-fetch');
const fs = require('fs');

// Read the syllabus PDF and extract text (simplified)
// For now, we'll use the text extraction approach from app.js
// Or we can use a simple test with placeholder text that matches the syllabus structure

async function testAPI() {
    const BACKEND_API = 'http://localhost:3000/api/analyze-syllabus';
    
    console.log('🧪 Testing Syllabus Analyzer API\n');
    console.log('='.repeat(60));
    
    // First, let's check if the backend is running
    try {
        const healthCheck = await fetch('http://localhost:3000/api/health');
        if (healthCheck.ok) {
            console.log('✅ Backend is running on http://localhost:3000\n');
        } else {
            console.log('❌ Backend is not responding correctly\n');
            console.log('Please start the backend with: cd backend && npm start\n');
            return;
        }
    } catch (error) {
        console.log('❌ Cannot connect to backend at http://localhost:3000');
        console.log('\nPlease start the backend first:');
        console.log('  1. cd backend');
        console.log('  2. npm install');
        console.log('  3. npm start');
        console.log('\nThen run this test again.\n');
        return;
    }
    
    // For testing, we'll create a sample syllabus text
    // In production, you would extract this from the PDF
    const sampleSyllabusText = `
REL100: Religion, Race, and Social Justice

Instructor: Rev. Dr. Alan Rudnick
Email: arudnick@syr.edu
Office Hours: Thursdays 11-12 PM (Hall of Languages 501C)
Office Location: Hall of Languages 501C

Teaching Assistants:
- Rachel Carpenter - rkcarpen@syr.edu
- Carlos Andrés Ramírez Arenas - cramir03@syr.edu

Important Dates:
- September 30: Reflection Paper #1 Due
- October 16: Mid-Term Paper Due
- November 13: Reflection Paper #2 Due
- December 11: Final Paper Due by 2:45 PM

Assignments:
1. Participation (10%) - More than two unexcused absences result in zero points
2. Two Reflection Papers (20%) - 2 pages each
   - Reflection #1 - Due September 30
   - Reflection #2 - Due November 13
3. Mid-Term Paper (30%) - Due October 16 - 3-4 pages
4. Final Paper (40%) - Due December 11 - 5-7 pages or 15-20 minute video

Course Schedule:
Week 1: August 26 - Introduction
Week 2: September 2 - Religion and Race in Christian American History
Week 3: September 9 - Islam in America
Week 10: October 28 - South Africa: A Long Night's Journey Into Day
Week 11: November 4 - American Civil Rights Movement
Week 16: December 9 - Can There Be Reconciliation? (Last Class)

Required Materials:
- White Too Long: The Legacy of White Supremacy in American Christianity, Robert P. Jones (2020)
- Four Pivots: Reimagining Justice, Reimagining Ourselves, Shawn A. Ginwright (2022)
- The Little Book of Race and Restorative Justice, Fania E. Davis (2019)
`;
    
    console.log('📤 Sending test syllabus to API...\n');
    
    try {
        const response = await fetch(BACKEND_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: sampleSyllabusText })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log('='.repeat(60));
        console.log('📊 API RESPONSE SCHEMA\n');
        console.log('='.repeat(60));
        console.log(JSON.stringify(result, null, 2));
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ Test completed successfully!\n');
        
        // Also save to file for reference
        fs.writeFileSync('test-api-response.json', JSON.stringify(result, null, 2));
        console.log('📄 Full response saved to: test-api-response.json\n');
        
    } catch (error) {
        console.error('\n❌ Error testing API:', error.message);
        console.error('\nFull error:', error);
    }
}

testAPI();

