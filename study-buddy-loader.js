// Shared Study Buddy Data Loader
// This script ensures study buddy data is loaded and available on all pages

(function() {
    'use strict';
    
    // Load study buddy data from localStorage
    function loadStudyBuddyData() {
        try {
            // Load equipped items
            const savedEquipped = localStorage.getItem('studyBuddyEquipped');
            if (savedEquipped) {
                window.studyBuddyEquipped = JSON.parse(savedEquipped);
            } else {
                // Default equipped state
                window.studyBuddyEquipped = {
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
                    tail: null,
                    scene: 'default',
                    theme: 'default'
                };
            }
            
            // Load player data
            const savedPlayerData = localStorage.getItem('studyBuddyPlayerData');
            if (savedPlayerData) {
                window.studyBuddyPlayerData = JSON.parse(savedPlayerData);
            } else {
                window.studyBuddyPlayerData = {
                    points: 0,
                    level: 1,
                    completedTasks: 0,
                    streak: 0,
                    lastCompletedDate: null
                };
            }
            
            // Load character data
            const savedCharacter = localStorage.getItem('studyBuddyCharacter');
            if (savedCharacter) {
                window.studyBuddyCharacter = JSON.parse(savedCharacter);
            }
            
            // Load inventory
            const savedInventory = localStorage.getItem('studyBuddyInventory');
            if (savedInventory) {
                window.studyBuddyInventory = JSON.parse(savedInventory);
            }
            
            console.log('✅ Study Buddy data loaded');
        } catch (error) {
            console.error('Error loading study buddy data:', error);
        }
    }
    
    // Save study buddy data to localStorage
    function saveStudyBuddyData() {
        try {
            if (window.studyBuddyEquipped) {
                localStorage.setItem('studyBuddyEquipped', JSON.stringify(window.studyBuddyEquipped));
            }
            if (window.studyBuddyPlayerData) {
                localStorage.setItem('studyBuddyPlayerData', JSON.stringify(window.studyBuddyPlayerData));
            }
            if (window.studyBuddyCharacter) {
                localStorage.setItem('studyBuddyCharacter', JSON.stringify(window.studyBuddyCharacter));
            }
            if (window.studyBuddyInventory) {
                localStorage.setItem('studyBuddyInventory', JSON.stringify(window.studyBuddyInventory));
            }
            console.log('✅ Study Buddy data saved');
        } catch (error) {
            console.error('Error saving study buddy data:', error);
        }
    }
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', saveStudyBuddyData);
    
    // Load data when script runs
    loadStudyBuddyData();
    
    // Expose functions globally
    window.loadStudyBuddyData = loadStudyBuddyData;
    window.saveStudyBuddyData = saveStudyBuddyData;
})();

