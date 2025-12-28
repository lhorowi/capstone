// Rewards and Character System JavaScript

// Global state
let originalEquipped = null; // Store original equipped state when trying items

let character = {
    name: 'My Study Buddy',
    bodyShape: 'round', // round, square, triangle, blob, star, hexagon
    bodyColor: '#8B5CF6', // Purple default
    eyes: [ // Array of eye objects with position and size
        { id: 1, x: 40, y: 35, size: 12, color: '#000000' }, // Left eye
        { id: 2, x: 60, y: 35, size: 12, color: '#000000' }  // Right eye
    ],
    mouth: { type: 'smile', x: 50, y: 60, width: 20, height: 10 }, // Shape-based mouth with position
    horns: null, // Horns on head (shape-based) - { type: 'small', x: 50, y: 0 }
    spikes: null, // Spikes on body (shape-based)
    tentacles: null, // Tentacles (shape-based) - { type: 'two', x: 50, y: 100 }
    wings: null, // Wings (shape-based)
    tail: null, // Tail (shape-based) - { type: 'short', x: 100, y: 50 }
    scene: 'default'
};

let playerData = {
    points: 0,
    level: 1,
    completedTasks: 0,
    streak: 0,
    lastCompletedDate: null
};

let inventory = {
    bodyShapes: ['round'], // Default body shape unlocked
    bodyColors: ['#8B5CF6'], // Default color unlocked
    eyeColors: ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'], // Eye colors unlocked
    mouthTypes: ['smile', 'frown', 'straight', 'open'], // Mouth types unlocked
    horns: [],
    spikes: [],
    tentacles: [],
    wings: [],
    tails: [],
    scenes: ['default'], // Default scene unlocked
    themes: ['default'], // Default theme unlocked
    rewards: []
};

let equipped = {
    bodyShape: 'round',
    bodyColor: '#8B5CF6',
    eyes: [ // Array of eye objects
        { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
        { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
    ],
    mouth: { type: 'smile', x: 50, y: 60, width: 20, height: 10 },
    horns: null, // Will be { type: 'small', x: 50, y: 0 } when equipped
    spikes: null,
    tentacles: null, // Will be { type: 'two', x: 50, y: 100 } when equipped
    wings: null,
    tail: null, // Will be { type: 'short', x: 100, y: 50 } when equipped
    scene: 'default',
    theme: 'default'
};

// Shop items catalog
const shopItems = {
    bodyShapes: [
        { id: 'round', name: 'Round Monster', price: 0, owned: true },
        { id: 'square', name: 'Square Monster', price: 5 },
        { id: 'triangle', name: 'Triangle Monster', price: 5 },
        { id: 'blob', name: 'Blob Monster', price: 5 },
        { id: 'star', name: 'Star Monster', price: 5 },
        { id: 'hexagon', name: 'Hexagon Monster', price: 5 }
    ],
    bodyColors: [
        { id: 'purple', color: '#8B5CF6', name: 'Purple', price: 0, owned: true },
        { id: 'blue', color: '#3B82F6', name: 'Blue', price: 0, owned: true },
        { id: 'green', color: '#10B981', name: 'Green', price: 0, owned: true },
        { id: 'red', color: '#EF4444', name: 'Red', price: 0, owned: true },
        { id: 'orange', color: '#F97316', name: 'Orange', price: 0, owned: true },
        { id: 'pink', color: '#EC4899', name: 'Pink', price: 0, owned: true },
        { id: 'yellow', color: '#FBBF24', name: 'Yellow', price: 0, owned: true },
        { id: 'cyan', color: '#06B6D4', name: 'Cyan', price: 0, owned: true },
        { id: 'lime', color: '#84CC16', name: 'Lime', price: 0, owned: true },
        { id: 'indigo', color: '#6366F1', name: 'Indigo', price: 0, owned: true }
    ],
    eyeColors: [
        { id: 'black', color: '#000000', name: 'Black', price: 0, owned: true },
        { id: 'white', color: '#FFFFFF', name: 'White', price: 0, owned: true },
        { id: 'red', color: '#FF0000', name: 'Red', price: 0, owned: true },
        { id: 'blue', color: '#0000FF', name: 'Blue', price: 0, owned: true },
        { id: 'green', color: '#00FF00', name: 'Green', price: 0, owned: true },
        { id: 'yellow', color: '#FFFF00', name: 'Yellow', price: 0, owned: true },
        { id: 'purple', color: '#8B5CF6', name: 'Purple', price: 0, owned: true },
        { id: 'glow', color: '#00FFFF', name: 'Glowing', price: 0, owned: true }
    ],
    mouthTypes: [
        { id: 'smile', name: 'Smile', price: 0, owned: true },
        { id: 'frown', name: 'Frown', price: 5 },
        { id: 'straight', name: 'Straight', price: 5 },
        { id: 'open', name: 'Open', price: 5 },
        { id: 'big-smile', name: 'Big Smile', price: 5 },
        { id: 'teeth', name: 'Teeth', price: 5 }
    ],
    horns: [
        { id: 'small', name: 'Small Horns', price: 5 },
        { id: 'big', name: 'Big Horns', price: 5 },
        { id: 'curved', name: 'Curved Horns', price: 5 },
        { id: 'spiral', name: 'Spiral Horns', price: 5 }
    ],
    spikes: [
        { id: 'back', name: 'Back Spikes', price: 5 },
        { id: 'all-over', name: 'All Over Spikes', price: 5 },
        { id: 'sharp', name: 'Sharp Spikes', price: 5 }
    ],
    tentacles: [
        { id: 'two', name: 'Two Tentacles', price: 5 },
        { id: 'four', name: 'Four Tentacles', price: 5 },
        { id: 'eight', name: 'Eight Tentacles', price: 5 }
    ],
    wings: [
        { id: 'bat', name: 'Bat Wings', price: 5 },
        { id: 'angel', name: 'Angel Wings', price: 5 },
        { id: 'dragon', name: 'Dragon Wings', price: 5 }
    ],
    tails: [
        { id: 'short', name: 'Short Tail', price: 5 },
        { id: 'long', name: 'Long Tail', price: 5 },
        { id: 'spiked', name: 'Spiked Tail', price: 5 }
    ],
    scenes: [
        { id: 'default', icon: '🌤️', name: 'Sunny Day', price: 0, owned: true },
        { id: 'library', icon: '📚', name: 'Library', price: 5 },
        { id: 'beach', icon: '🏖️', name: 'Beach', price: 5 },
        { id: 'space', icon: '🚀', name: 'Space', price: 5 },
        { id: 'forest', icon: '🌲', name: 'Forest', price: 5 },
        { id: 'city', icon: '🌆', name: 'City Skyline', price: 5 }
    ],
    themes: [
        { id: 'default', icon: '💜', name: 'Purple Dream', price: 0, owned: true, colors: { primary: '#667eea', secondary: '#764ba2', accent: '#667eea' } },
        { id: 'ocean', icon: '🌊', name: 'Ocean Breeze', price: 5, colors: { primary: '#4facfe', secondary: '#00f2fe', accent: '#4facfe' } },
        { id: 'sunset', icon: '🌅', name: 'Sunset Glow', price: 5, colors: { primary: '#fa709a', secondary: '#fee140', accent: '#fa709a' } },
        { id: 'forest', icon: '🌲', name: 'Forest Green', price: 5, colors: { primary: '#11998e', secondary: '#38ef7d', accent: '#11998e' } },
        { id: 'lavender', icon: '💐', name: 'Lavender Fields', price: 5, colors: { primary: '#a8edea', secondary: '#fed6e3', accent: '#a8edea' } },
        { id: 'midnight', icon: '🌙', name: 'Midnight Blue', price: 5, colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#2c3e50' } },
        { id: 'coral', icon: '🪸', name: 'Coral Reef', price: 5, colors: { primary: '#ff6b6b', secondary: '#feca57', accent: '#ff6b6b' } },
        { id: 'aurora', icon: '🌌', name: 'Aurora Borealis', price: 5, colors: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' } }
    ],
    rewards: [
        { id: 'break5', icon: '☕', name: '5-Min Break Pass', price: 5, type: 'consumable' },
        { id: 'break15', icon: '🍕', name: '15-Min Break Pass', price: 5, type: 'consumable' },
        { id: 'motivate', icon: '💪', name: 'Motivation Boost', price: 5, type: 'consumable' },
        { id: 'skip', icon: '⏭️', name: 'Skip Minor Task', price: 5, type: 'consumable' }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadGameData();
    loadTheme(); // Load saved theme
    updatePointsDisplay();
    updateCharacterDisplay();
    populateShop();
    loadAchievements();
    checkForCompletedTasks();
});

function loadGameData() {
    // Load equipped items FIRST (this is the source of truth)
    // Check window object first (from loader), then localStorage
    if (window.studyBuddyEquipped) {
        const loaded = window.studyBuddyEquipped;
        // Merge with defaults and migrate old structure
        equipped = {
            bodyShape: loaded.bodyShape || 'round',
            bodyColor: loaded.bodyColor || '#8B5CF6',
            eyes: Array.isArray(loaded.eyes) ? loaded.eyes : [
                { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
                { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
            ],
            mouth: (loaded.mouth && typeof loaded.mouth === 'object') ? loaded.mouth : { type: 'smile', x: 50, y: 60, width: 20, height: 10 },
            horns: (loaded.horns && typeof loaded.horns === 'object') ? loaded.horns : (loaded.horns ? { type: loaded.horns, x: 50, y: 0 } : null),
            spikes: loaded.spikes || null,
            tentacles: (loaded.tentacles && typeof loaded.tentacles === 'object') ? loaded.tentacles : (loaded.tentacles ? { type: loaded.tentacles, x: 50, y: 100 } : null),
            wings: loaded.wings || null,
            tail: (loaded.tail && typeof loaded.tail === 'object') ? loaded.tail : (loaded.tail ? { type: loaded.tail, x: 100, y: 50 } : null),
            scene: loaded.scene || 'default',
            theme: loaded.theme || 'default'
        };
    } else {
        const savedEquipped = localStorage.getItem('studyBuddyEquipped');
        if (savedEquipped) {
            const loaded = JSON.parse(savedEquipped);
            // Merge with defaults and migrate old structure
            equipped = {
                bodyShape: loaded.bodyShape || 'round',
                bodyColor: loaded.bodyColor || '#8B5CF6',
                eyes: Array.isArray(loaded.eyes) ? loaded.eyes : [
                    { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
                    { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
                ],
                mouth: (loaded.mouth && typeof loaded.mouth === 'object') ? loaded.mouth : { type: 'smile', x: 50, y: 60, width: 20, height: 10 },
                horns: (loaded.horns && typeof loaded.horns === 'object') ? loaded.horns : (loaded.horns ? { type: loaded.horns, x: 50, y: 0 } : null),
                spikes: loaded.spikes || null,
                tentacles: (loaded.tentacles && typeof loaded.tentacles === 'object') ? loaded.tentacles : (loaded.tentacles ? { type: loaded.tentacles, x: 50, y: 100 } : null),
                wings: loaded.wings || null,
                tail: (loaded.tail && typeof loaded.tail === 'object') ? loaded.tail : (loaded.tail ? { type: loaded.tail, x: 100, y: 50 } : null),
                scene: loaded.scene || 'default',
                theme: loaded.theme || 'default'
            };
        }
    }
    
    // Load character (but equipped takes precedence)
    const savedCharacter = localStorage.getItem('studyBuddyCharacter');
    if (savedCharacter) {
        const loaded = JSON.parse(savedCharacter);
        // Merge with defaults to handle new properties, but sync from equipped
        character = { ...character, ...loaded };
    }
    
    // Load player data - check window object first (from loader), then localStorage
    if (window.studyBuddyPlayerData) {
        playerData = window.studyBuddyPlayerData;
    } else {
        const savedPlayerData = localStorage.getItem('studyBuddyPlayerData');
        if (savedPlayerData) {
            playerData = JSON.parse(savedPlayerData);
        }
    }
    
    // Give 1000 points if player doesn't have points or has less than 1000
    if (!playerData.points || playerData.points < 1000) {
        playerData.points = 1000;
        saveGameData();
    }
    
    // Load inventory - check window object first (from loader), then localStorage
    if (window.studyBuddyInventory) {
        const loaded = window.studyBuddyInventory;
        inventory = {
            bodyShapes: loaded.bodyShapes || ['round'],
            bodyColors: loaded.bodyColors || ['#8B5CF6'],
            eyeColors: loaded.eyeColors || ['#000000', '#FFFFFF'],
            mouthTypes: loaded.mouthTypes || ['smile'],
            horns: loaded.horns || [],
            spikes: loaded.spikes || [],
            tentacles: loaded.tentacles || [],
            wings: loaded.wings || [],
            tails: loaded.tails || [],
            scenes: loaded.scenes || ['default'],
            themes: loaded.themes || ['default'],
            rewards: loaded.rewards || []
        };
    } else {
        const savedInventory = localStorage.getItem('studyBuddyInventory');
        if (savedInventory) {
            const loaded = JSON.parse(savedInventory);
            // Merge with defaults and migrate old structure
            inventory = {
                bodyShapes: loaded.bodyShapes || ['round'],
                bodyColors: loaded.bodyColors || ['#8B5CF6'],
                eyeColors: loaded.eyeColors || ['#000000', '#FFFFFF'],
                mouthTypes: loaded.mouthTypes || ['smile'],
                horns: loaded.horns || [],
                spikes: loaded.spikes || [],
                tentacles: loaded.tentacles || [],
                wings: loaded.wings || [],
                tails: loaded.tails || [],
                scenes: loaded.scenes || ['default'],
                themes: loaded.themes || ['default'],
                rewards: loaded.rewards || []
            };
        }
    }
    
    // Sync equipped to character (equipped is the source of truth)
    character.bodyShape = equipped.bodyShape;
    character.bodyColor = equipped.bodyColor;
    character.eyes = equipped.eyes || [
        { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
        { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
    ];
    character.mouth = equipped.mouth || { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
    character.horns = equipped.horns;
    character.spikes = equipped.spikes;
    character.tentacles = equipped.tentacles;
    character.wings = equipped.wings;
    character.tail = equipped.tail;
}

function saveGameData() {
    localStorage.setItem('studyBuddyCharacter', JSON.stringify(character));
    localStorage.setItem('studyBuddyPlayerData', JSON.stringify(playerData));
    localStorage.setItem('studyBuddyInventory', JSON.stringify(inventory));
    localStorage.setItem('studyBuddyEquipped', JSON.stringify(equipped));
    
    // Also update global window objects if they exist (for cross-page compatibility)
    if (window.studyBuddyEquipped !== undefined) {
        window.studyBuddyEquipped = equipped;
    }
    if (window.studyBuddyPlayerData !== undefined) {
        window.studyBuddyPlayerData = playerData;
    }
    if (window.studyBuddyCharacter !== undefined) {
        window.studyBuddyCharacter = character;
    }
    if (window.studyBuddyInventory !== undefined) {
        window.studyBuddyInventory = inventory;
    }
    
    // Trigger save in loader if available
    if (window.saveStudyBuddyData) {
        window.saveStudyBuddyData();
    }
}

function updatePointsDisplay() {
    document.getElementById('pointsValue').textContent = playerData.points;
}

function updateCharacterDisplay() {
    const container = document.getElementById('characterContainer');
    if (!container) return;
    
    // Clear and rebuild monster
    container.innerHTML = '';
    
    // Create monster body with shape
    const body = document.createElement('div');
    body.className = `monster-body monster-${equipped.bodyShape || 'round'}`;
    
    // For triangle, use border color instead of background
    if (equipped.bodyShape === 'triangle') {
        body.style.borderBottomColor = equipped.bodyColor || '#8B5CF6';
    } else {
        body.style.background = equipped.bodyColor || '#8B5CF6';
    }
    
    // Add horns on top (shape-based) - now positionable
    if (equipped.horns) {
        const horns = document.createElement('div');
        horns.className = `monster-horns monster-horns-${equipped.horns.type || equipped.horns}`;
        const hornsData = typeof equipped.horns === 'object' ? equipped.horns : { type: equipped.horns, x: 50, y: 0 };
        horns.style.position = 'absolute';
        horns.style.left = hornsData.x + '%';
        horns.style.top = hornsData.y + '%';
        horns.style.transform = 'translate(-50%, -50%)';
        horns.style.zIndex = '5';
        body.appendChild(horns);
    }
    
    // Add face
    const face = document.createElement('div');
    face.className = 'monster-face';
    
    // Add eyes as circles
    const eyesContainer = document.createElement('div');
    eyesContainer.className = 'monster-eyes-container';
    
    const eyes = equipped.eyes || character.eyes || [
        { id: 1, x: 40, y: 35, size: 12, color: '#000000' },
        { id: 2, x: 60, y: 35, size: 12, color: '#000000' }
    ];
    
    eyes.forEach(eye => {
        // Create eye wrapper
        const eyeWrapper = document.createElement('div');
        eyeWrapper.className = 'monster-eye-wrapper';
        eyeWrapper.style.left = eye.x + '%';
        eyeWrapper.style.top = eye.y + '%';
        eyeWrapper.style.width = eye.size + 'px';
        eyeWrapper.style.height = eye.size + 'px';
        eyeWrapper.style.position = 'absolute';
        eyeWrapper.style.transform = 'translate(-50%, -50%)';
        eyeWrapper.dataset.eyeId = eye.id;
        
        // White circle (eye base)
        const eyeBase = document.createElement('div');
        eyeBase.className = 'monster-eye-base';
        eyeBase.style.width = '100%';
        eyeBase.style.height = '100%';
        eyeBase.style.background = '#FFFFFF';
        eyeBase.style.borderRadius = '50%';
        eyeBase.style.border = '1px solid #000000';
        eyeBase.style.position = 'relative';
        
        // Colored circle (pupil) on top
        const eyePupil = document.createElement('div');
        eyePupil.className = 'monster-eye-pupil';
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
    mouth.className = `monster-mouth monster-mouth-${equipped.mouth?.type || 'smile'}`;
    const mouthData = equipped.mouth || character.mouth || { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
    mouth.style.left = mouthData.x + '%';
    mouth.style.top = mouthData.y + '%';
    mouth.style.width = mouthData.width + 'px';
    mouth.style.height = mouthData.height + 'px';
    mouth.style.transform = 'translate(-50%, -50%)';
    face.appendChild(mouth);
    
    body.appendChild(face);
    
    // Add spikes (shape-based)
    if (equipped.spikes) {
        const spikes = document.createElement('div');
        spikes.className = `monster-spikes monster-spikes-${equipped.spikes}`;
        body.appendChild(spikes);
    }
    
    // Add wings (shape-based)
    if (equipped.wings) {
        const wings = document.createElement('div');
        wings.className = `monster-wings monster-wings-${equipped.wings}`;
        body.appendChild(wings);
    }
    
    // Add tentacles (shape-based) - now positionable
    if (equipped.tentacles) {
        const tentacles = document.createElement('div');
        const tentaclesData = typeof equipped.tentacles === 'object' ? equipped.tentacles : { type: equipped.tentacles, x: 50, y: 100 };
        tentacles.className = `monster-tentacles monster-tentacles-${tentaclesData.type || equipped.tentacles}`;
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
        tail.className = `monster-tail monster-tail-${tailData.type || equipped.tail}`;
        tail.style.position = 'absolute';
        tail.style.left = tailData.x + '%';
        tail.style.top = tailData.y + '%';
        tail.style.transform = 'translate(-50%, -50%)';
        tail.style.zIndex = '2';
        body.appendChild(tail);
    }
    
    container.appendChild(body);
    
    // Update scene
    const sceneBackground = document.getElementById('sceneBackground');
    if (sceneBackground) {
        sceneBackground.className = 'scene-background ' + (equipped.scene || 'default');
    }
    
    // Update name
    const nameEl = document.getElementById('characterName');
    if (nameEl) {
        nameEl.textContent = character.name || 'My Study Buddy';
    }
}

// Eye management functions
function addEye() {
    // Ensure eyes array exists
    if (!equipped.eyes) {
        equipped.eyes = [];
    }
    
    const newEye = {
        id: Date.now(),
        x: 50,
        y: 50,
        size: 12,
        color: '#000000'
    };
    equipped.eyes.push(newEye);
    character.eyes = equipped.eyes;
    saveGameData();
    updateCharacterDisplay();
    updateEyeManagerList(); // Refresh the eye manager list to show the new eye
}

function removeEye(eyeId) {
    // Convert eyeId to number for comparison
    const id = typeof eyeId === 'string' ? parseInt(eyeId, 10) : eyeId;
    equipped.eyes = equipped.eyes.filter(e => e.id !== id);
    character.eyes = equipped.eyes;
    saveGameData();
    updateCharacterDisplay();
    updateEyeManagerList(); // Refresh the eye manager list after removal
}

function updateEyePosition(eyeId, x, y) {
    // Convert eyeId to number for comparison
    const id = typeof eyeId === 'string' ? parseInt(eyeId, 10) : eyeId;
    const eye = equipped.eyes.find(e => e.id === id);
    if (eye) {
        eye.x = Math.max(0, Math.min(100, x)); // Clamp between 0 and 100
        eye.y = Math.max(0, Math.min(100, y)); // Clamp between 0 and 100
        character.eyes = equipped.eyes;
        saveGameData();
        updateCharacterDisplay();
        updateEyeManagerList(); // Refresh the list to show updated position
    }
}

function moveEye(eyeId, direction) {
    // Convert eyeId to number for comparison
    const id = typeof eyeId === 'string' ? parseInt(eyeId, 10) : eyeId;
    const eye = equipped.eyes.find(e => e.id === id);
    if (eye) {
        const step = 2; // Move by 2% each time
        switch(direction) {
            case 'up':
                updateEyePosition(id, eye.x, eye.y - step);
                break;
            case 'down':
                updateEyePosition(id, eye.x, eye.y + step);
                break;
            case 'left':
                updateEyePosition(id, eye.x - step, eye.y);
                break;
            case 'right':
                updateEyePosition(id, eye.x + step, eye.y);
                break;
        }
    } else {
        console.error('Eye not found with id:', id, 'Available eyes:', equipped.eyes);
    }
}

function updateEyeSize(eyeId, size) {
    // Convert eyeId to number for comparison
    const id = typeof eyeId === 'string' ? parseInt(eyeId, 10) : eyeId;
    const eye = equipped.eyes.find(e => e.id === id);
    if (eye) {
        eye.size = parseInt(size, 10);
        character.eyes = equipped.eyes;
        saveGameData();
        updateCharacterDisplay();
        updateEyeManagerList(); // Refresh the eye manager list to show updated size
    }
}

function updateEyeColor(eyeId, color) {
    // Convert eyeId to number for comparison
    const id = typeof eyeId === 'string' ? parseInt(eyeId, 10) : eyeId;
    const eye = equipped.eyes.find(e => e.id === id);
    if (eye) {
        eye.color = color;
        character.eyes = equipped.eyes;
        saveGameData();
        updateCharacterDisplay();
        updateEyeManagerList(); // Refresh the eye manager list to show updated color
    }
}

function populateShop() {
    populateShopTab('bodyShapes', shopItems.bodyShapes);
    populateShopTab('bodyColors', shopItems.bodyColors);
    populateShopTab('eyeColors', shopItems.eyeColors);
    populateShopTab('mouthTypes', shopItems.mouthTypes);
    populateShopTab('horns', shopItems.horns);
    populateShopTab('tentacles', shopItems.tentacles);
    populateShopTab('scenes', shopItems.scenes);
    populateShopTab('themes', shopItems.themes);
    populateShopTab('rewards', shopItems.rewards);
    
    // Initialize eye manager when eyes tab is shown
    updateEyeManagerList();
}

function populateShopTab(category, items) {
    const grid = document.getElementById(category + 'Grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    items.forEach(item => {
        const owned = inventory[category] && inventory[category].includes(item.id);
        let isEquipped = false;
        
        // Check if item is equipped
        if (category === 'bodyShapes') {
            isEquipped = equipped.bodyShape === item.id;
        } else if (category === 'bodyColors') {
            isEquipped = equipped.bodyColor === item.color;
        } else if (category === 'eyeColors') {
            // Check if any eye uses this color
            isEquipped = (equipped.eyes || []).some(eye => eye.color === item.color);
        } else if (category === 'mouthTypes') {
            isEquipped = equipped.mouth?.type === item.id;
        } else if (category === 'horns') {
            isEquipped = equipped.horns === item.id;
        } else if (category === 'spikes') {
            isEquipped = equipped.spikes === item.id;
        } else if (category === 'tentacles') {
            isEquipped = equipped.tentacles === item.id;
        } else if (category === 'wings') {
            isEquipped = equipped.wings === item.id;
        } else if (category === 'tails') {
            isEquipped = equipped.tail === item.id;
        } else if (category === 'scenes') {
            isEquipped = equipped.scene === item.id;
        } else if (category === 'themes') {
            isEquipped = equipped.theme === item.id;
        }
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `shop-item ${owned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
        itemDiv.onclick = () => handleShopItemClick(category, item);
        
        // For themes, show color preview
        let previewHtml = '';
        if (category === 'themes' && item.colors) {
            previewHtml = `<div class="theme-preview" style="background: linear-gradient(135deg, ${item.colors.primary} 0%, ${item.colors.secondary} 100%); height: 40px; border-radius: 6px; margin-bottom: 0.5rem;"></div>`;
        }
        
        // For body colors, show color preview
        if (category === 'bodyColors' && item.color) {
            previewHtml = `<div class="theme-preview" style="background: ${item.color}; height: 40px; border-radius: 6px; margin-bottom: 0.5rem;"></div>`;
        }
        
        // For eye colors, show color preview
        if (category === 'eyeColors' && item.color) {
            previewHtml = `<div class="theme-preview" style="background: ${item.color}; height: 40px; width: 40px; border-radius: 50%; margin: 0 auto 0.5rem;"></div>`;
        }
        
        // For other items, show shape preview instead of icon
        let itemDisplay = '';
        if (category === 'bodyShapes') {
            const shapeClass = `preview-shape preview-${item.id}`;
            itemDisplay = `<div class="${shapeClass}"></div>`;
        } else if (category === 'mouthTypes') {
            const mouthClass = `preview-mouth preview-mouth-${item.id}`;
            itemDisplay = `<div class="${mouthClass}"></div>`;
        } else if (category === 'horns' || category === 'spikes' || category === 'tentacles' || category === 'wings' || category === 'tails') {
            const featureClass = `preview-feature preview-${category}-${item.id}`;
            itemDisplay = `<div class="${featureClass}"></div>`;
        } else if (category === 'scenes' || category === 'rewards') {
            // Keep icons for scenes and rewards
            itemDisplay = `<div class="shop-item-icon">${item.icon || '🎨'}</div>`;
        } else {
            // No icon for other categories
            itemDisplay = '';
        }
        
        itemDiv.innerHTML = `
            ${previewHtml}
            ${itemDisplay}
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price ${owned ? 'owned' : ''}">
                ${owned ? (isEquipped ? 'Active' : 'Owned') : `⭐ ${item.price}`}
            </div>
            ${!owned ? `<button class="btn btn-small btn-secondary shop-try-btn" onclick="event.stopPropagation(); tryItem('${category}', '${item.id || item.color || ''}')">Try</button>` : ''}
        `;
        
        // Store item data for try function
        if (!owned) {
            itemDiv.dataset.tryCategory = category;
            itemDiv.dataset.tryItemId = item.id || item.color || '';
        }
        
        grid.appendChild(itemDiv);
    });
}

function handleShopItemClick(category, item) {
    // For body colors and eye colors, check by color value
    let owned = false;
    if (category === 'bodyColors' || category === 'eyeColors') {
        owned = inventory[category] && inventory[category].includes(item.color || item.id);
    } else {
        owned = inventory[category] && inventory[category].includes(item.id);
    }
    
    if (owned) {
        // Equip the item
        equipItem(category, item);
    } else {
        // Try to purchase
        purchaseItem(category, item);
    }
}

function purchaseItem(category, item) {
    if (playerData.points < item.price) {
        showMessage(`Not enough points! You need ${item.price} points but only have ${playerData.points}.`, 'error');
        return;
    }
    
    const confirmPurchase = confirm(`Purchase ${item.name} for ${item.price} points?`);
    
    if (confirmPurchase) {
        playerData.points -= item.price;
        
        // For body colors and eye colors, store the color value
        if (category === 'bodyColors' || category === 'eyeColors') {
            if (!inventory[category]) {
                inventory[category] = [];
            }
            if (!inventory[category].includes(item.color || item.id)) {
                inventory[category].push(item.color || item.id);
            }
        } else {
            if (!inventory[category]) {
                inventory[category] = [];
            }
            if (!inventory[category].includes(item.id)) {
                inventory[category].push(item.id);
            }
        }
        
        saveGameData();
        updatePointsDisplay();
        populateShop();
        updateResetButton();
        
        showMessage(`Purchased ${item.name}! ${item.price} points spent.`, 'success');
        
        // Auto-equip after purchase
        equipItem(category, item);
        
        // Clear try state when purchasing
        if (originalEquipped) {
            originalEquipped = null;
            hideTryCancelButton();
        }
    }
}

function equipItem(category, item) {
    if (category === 'bodyShapes') {
        equipped.bodyShape = item.id;
        character.bodyShape = item.id;
    } else if (category === 'bodyColors') {
        equipped.bodyColor = item.color;
        character.bodyColor = item.color;
    } else if (category === 'eyeColors') {
        // Change color of all eyes to the selected color
        if (!equipped.eyes || equipped.eyes.length === 0) {
            equipped.eyes = [
                { id: 1, x: 40, y: 35, size: 12, color: item.color },
                { id: 2, x: 60, y: 35, size: 12, color: item.color }
            ];
        } else {
            equipped.eyes.forEach(eye => {
                eye.color = item.color;
            });
        }
        character.eyes = equipped.eyes;
    } else if (category === 'mouthTypes') {
        if (!equipped.mouth) {
            equipped.mouth = { type: item.id, x: 50, y: 60, width: 20, height: 10 };
        } else {
            equipped.mouth.type = item.id;
        }
        character.mouth = equipped.mouth;
        updateFeaturePositionControls('mouth');
    } else if (category === 'horns') {
        // Initialize with default position if not already an object
        if (typeof equipped.horns !== 'object' || !equipped.horns.x) {
            equipped.horns = { type: item.id, x: 50, y: 0 };
        } else {
            equipped.horns.type = item.id;
        }
        character.horns = equipped.horns;
        updateFeaturePositionControls('horns');
    } else if (category === 'spikes') {
        equipped.spikes = item.id;
        character.spikes = item.id;
    } else if (category === 'tentacles') {
        // Initialize with default position if not already an object
        if (typeof equipped.tentacles !== 'object' || !equipped.tentacles.x) {
            equipped.tentacles = { type: item.id, x: 50, y: 100 };
        } else {
            equipped.tentacles.type = item.id;
        }
        character.tentacles = equipped.tentacles;
        updateFeaturePositionControls('tentacles');
    } else if (category === 'wings') {
        equipped.wings = item.id;
        character.wings = item.id;
    } else if (category === 'tails') {
        // Initialize with default position if not already an object
        if (typeof equipped.tail !== 'object' || !equipped.tail.x) {
            equipped.tail = { type: item.id, x: 100, y: 50 };
        } else {
            equipped.tail.type = item.id;
        }
        character.tail = equipped.tail;
    } else if (category === 'scenes') {
        equipped.scene = item.id;
    } else if (category === 'themes') {
        equipped.theme = item.id;
        applyTheme(item);
    }
    
    saveGameData();
    updateCharacterDisplay();
    populateShop();
    updateResetButton();
    
    // Clear try state when equipping owned item
    if (originalEquipped) {
        originalEquipped = null;
        hideTryCancelButton();
    }
    
    showMessage(`Equipped ${item.name}!`, 'success');
}

function applyTheme(theme) {
    if (!theme || !theme.colors) return;
    
    // Save theme to localStorage for persistence across pages
    localStorage.setItem('websiteTheme', JSON.stringify({
        id: theme.id,
        colors: theme.colors
    }));
    
    // Use the shared theme loader if available, otherwise apply directly
    if (window.applyThemeFromLoader) {
        window.applyThemeFromLoader(theme.id);
    } else {
        // Fallback: apply theme directly
        document.body.style.background = `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;
        
        // Update navigation active link color
        const activeLinks = document.querySelectorAll('.nav-link.active');
        activeLinks.forEach(link => {
            link.style.background = theme.colors.primary;
        });
        
        // Update buttons
        const primaryButtons = document.querySelectorAll('.btn-primary');
        primaryButtons.forEach(btn => {
            btn.style.background = `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;
        });
        
        // Update progress bars
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            bar.style.background = `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`;
        });
        
        // Update points value color
        const pointsValue = document.getElementById('pointsValue');
        if (pointsValue) {
            pointsValue.style.color = theme.colors.primary;
        }
        
        // Update shop tab active color
        const activeTab = document.querySelector('.shop-tab.active');
        if (activeTab) {
            activeTab.style.background = theme.colors.primary;
        }
    }
}

function loadTheme() {
    // Theme loader will handle this, but we can also apply here for immediate effect
    const savedTheme = localStorage.getItem('websiteTheme');
    if (savedTheme) {
        try {
            const themeData = JSON.parse(savedTheme);
            const theme = shopItems.themes.find(t => t.id === themeData.id);
            if (theme) {
                applyTheme(theme);
            }
        } catch (e) {
            console.error('Error loading theme:', e);
        }
    }
}

function checkForCompletedTasks() {
    // Check todo list for newly completed tasks
    const todos = JSON.parse(localStorage.getItem('todoListTodos') || '[]');
    const calendarTodos = JSON.parse(localStorage.getItem('calendarTodos') || '[]');
    
    // Get previously tracked completion count
    const lastTrackedCount = parseInt(localStorage.getItem('lastTrackedCompletions') || '0');
    
    // Count current completions
    const currentCompletions = todos.filter(t => t.completed).length + calendarTodos.filter(t => t.completed).length;
    
    // Award points for new completions
    if (currentCompletions > lastTrackedCount) {
        const newCompletions = currentCompletions - lastTrackedCount;
        awardPoints(newCompletions);
        localStorage.setItem('lastTrackedCompletions', currentCompletions.toString());
    }
    
    // Check streak
    updateStreak();
}

function awardPoints(completionCount) {
    const pointsPerTask = 10;
    const bonusPoints = Math.floor(completionCount / 5) * 20; // Bonus for completing 5+ tasks
    const totalPoints = (completionCount * pointsPerTask) + bonusPoints;
    
    playerData.points += totalPoints;
    playerData.completedTasks += completionCount;
    
    // Level up check
    const oldLevel = playerData.level;
    playerData.level = Math.floor(playerData.completedTasks / 10) + 1;
    
    saveGameData();
    updatePointsDisplay();
    
    // Show achievement
    if (playerData.level > oldLevel) {
        addAchievement('Level Up!', `Reached level ${playerData.level}`, '🎉', 50);
        playerData.points += 50;
    }
    
    if (completionCount > 0) {
        addAchievement('Tasks Completed!', `Completed ${completionCount} task${completionCount > 1 ? 's' : ''}`, '✅', totalPoints);
    }
    
    showMessage(`Earned ${totalPoints} points for completing ${completionCount} task${completionCount > 1 ? 's' : ''}!`, 'success');
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = playerData.lastCompletedDate;
    
    const todos = JSON.parse(localStorage.getItem('todoListTodos') || '[]');
    const todayCompleted = todos.some(t => {
        if (!t.completed) return false;
        const completedDate = new Date(t.createdAt || Date.now()).toDateString();
        return completedDate === today;
    });
    
    if (todayCompleted) {
        if (lastDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                // Continue streak
                playerData.streak += 1;
            } else if (lastDate !== today) {
                // Reset streak
                playerData.streak = 1;
            }
        } else {
            playerData.streak = 1;
        }
        
        playerData.lastCompletedDate = today;
        saveGameData();
        updatePointsDisplay();
    }
}

function addAchievement(title, description, icon, points) {
    const achievements = JSON.parse(localStorage.getItem('studyBuddyAchievements') || '[]');
    
    const achievement = {
        id: Date.now(),
        title,
        description,
        icon,
        points,
        timestamp: new Date().toISOString()
    };
    
    achievements.unshift(achievement); // Add to beginning
    
    // Keep only last 20 achievements
    if (achievements.length > 20) {
        achievements.pop();
    }
    
    localStorage.setItem('studyBuddyAchievements', JSON.stringify(achievements));
    loadAchievements();
}

function loadAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    const achievements = JSON.parse(localStorage.getItem('studyBuddyAchievements') || '[]');
    
    if (achievements.length === 0) {
        achievementsList.innerHTML = `
            <div class="empty-state">
                <h3>No achievements yet</h3>
                <p>Complete tasks to earn points and unlock achievements!</p>
            </div>
        `;
        return;
    }
    
    achievementsList.innerHTML = '';
    
    // Show last 10 achievements
    achievements.slice(0, 10).forEach(achievement => {
        const timeAgo = getTimeAgo(achievement.timestamp);
        
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement-item';
        achievementDiv.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-time">${timeAgo}</div>
            </div>
            <div class="achievement-points">+${achievement.points}</div>
        `;
        
        achievementsList.appendChild(achievementDiv);
    });
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

function showShopTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.shop-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.shop-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tab = document.getElementById(tabName + 'Tab');
    if (tab) {
        tab.style.display = 'block';
    }
    
    // Add active class to clicked button (if event exists)
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // If showing eyes tab, update the eye manager list
    if (tabName === 'eyeColors') {
        updateEyeManagerList();
    }
    
    // Update position controls when showing feature tabs
    if (tabName === 'mouthTypes') {
        updateFeaturePositionControls('mouth');
    } else if (tabName === 'horns') {
        updateFeaturePositionControls('horns');
    } else if (tabName === 'tentacles') {
        updateFeaturePositionControls('tentacles');
    }
}

function showCharacterCreator() {
    const modal = document.getElementById('characterModal');
    modal.style.display = 'flex';
    
    // Pre-fill current values
    const nameInput = document.getElementById('buddyName');
    if (nameInput) {
        nameInput.value = character.name || 'My Study Buddy';
    }
    
    // Note: Detailed customization is now done through the shop tabs
    // This modal is mainly for name changes
}

function closeCharacterCreator() {
    document.getElementById('characterModal').style.display = 'none';
}


function saveCharacter() {
    const newName = document.getElementById('buddyName')?.value.trim();
    if (newName) {
        character.name = newName;
    }
    
    saveGameData();
    updateCharacterDisplay();
    closeCharacterCreator();
    
    showMessage('Monster name updated!', 'success');
}

function showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    document.querySelector('.container').insertBefore(message, document.querySelector('.points-display'));
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Event listeners
document.getElementById('closeCharacterModal')?.addEventListener('click', closeCharacterCreator);
document.getElementById('characterModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'characterModal') {
        closeCharacterCreator();
    }
});

// Auto-check for completed tasks every 30 seconds
setInterval(checkForCompletedTasks, 30000);

function showEyeManager() {
    showShopTab('eyeColors');
    updateEyeManagerList();
}

function updateEyeManagerList() {
    const list = document.getElementById('eyeManagerList');
    if (!list) return;
    
    list.innerHTML = '';
    
    const eyes = equipped.eyes || character.eyes || [];
    
    if (eyes.length === 0) {
        list.innerHTML = '<p style="color: #666;">No eyes yet. Click "Add Eye" to add one!</p>';
        return;
    }
    
    eyes.forEach((eye, index) => {
        const eyeDiv = document.createElement('div');
        eyeDiv.className = 'eye-manager-item';
        eyeDiv.innerHTML = `
            <div class="eye-preview" style="background: ${eye.color}; width: 30px; height: 30px; border-radius: 50%;"></div>
            <div class="eye-info">
                <div class="eye-label">Eye ${index + 1} - Position: (${Math.round(eye.x)}%, ${Math.round(eye.y)}%)</div>
                <div class="eye-controls">
                    <label>Size: <input type="range" min="8" max="20" value="${eye.size}" 
                        onchange="updateEyeSize(${eye.id}, this.value)" style="width: 100px;"></label>
                    <label>Color: <input type="color" value="${eye.color}" 
                        onchange="updateEyeColor(${eye.id}, this.value)"></label>
                    <div class="eye-position-controls">
                        <div class="position-label">Position:</div>
                        <div class="position-buttons">
                            <button class="btn btn-small btn-secondary" onclick="moveEye(${eye.id}, 'up')" title="Move Up">↑</button>
                            <div class="position-buttons-row">
                                <button class="btn btn-small btn-secondary" onclick="moveEye(${eye.id}, 'left')" title="Move Left">←</button>
                                <button class="btn btn-small btn-secondary" onclick="moveEye(${eye.id}, 'right')" title="Move Right">→</button>
                            </div>
                            <button class="btn btn-small btn-secondary" onclick="moveEye(${eye.id}, 'down')" title="Move Down">↓</button>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeEye(${eye.id})">Remove</button>
        `;
        list.appendChild(eyeDiv);
    });
}

// Global functions
window.showShopTab = showShopTab;
window.showCharacterCreator = showCharacterCreator;
window.closeCharacterCreator = closeCharacterCreator;
window.saveCharacter = saveCharacter;
// Feature position control functions
function updateFeaturePositionControls(featureType) {
    let container, featureData, defaultPos;
    
    if (featureType === 'mouth') {
        container = document.getElementById('mouthPositionControls');
        featureData = equipped.mouth || { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
        defaultPos = { x: 50, y: 60 };
        
        const x = featureData.x || defaultPos.x;
        const y = featureData.y || defaultPos.y;
        const width = featureData.width || 20;
        const height = featureData.height || 10;
        
        container.innerHTML = `
            <div class="feature-position-display">
                <div class="position-label">Position: (${Math.round(x)}%, ${Math.round(y)}%)</div>
                <div class="position-buttons">
                    <button class="btn btn-small btn-secondary" onclick="moveFeature('mouth', 'up')" title="Move Up">↑</button>
                    <div class="position-buttons-row">
                        <button class="btn btn-small btn-secondary" onclick="moveFeature('mouth', 'left')" title="Move Left">←</button>
                        <button class="btn btn-small btn-secondary" onclick="moveFeature('mouth', 'right')" title="Move Right">→</button>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="moveFeature('mouth', 'down')" title="Move Down">↓</button>
                </div>
            </div>
            <div class="feature-size-controls" style="margin-top: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: #333; font-size: 1rem;">Size:</h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <label style="display: flex; align-items: center; gap: 1rem;">
                        <span style="min-width: 80px; color: #666;">Width:</span>
                        <input type="range" min="10" max="50" value="${width}" 
                            onchange="updateMouthSize('width', this.value)" style="flex: 1;">
                        <span style="min-width: 40px; text-align: right; color: #333; font-weight: 600;">${width}px</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 1rem;">
                        <span style="min-width: 80px; color: #666;">Height:</span>
                        <input type="range" min="5" max="30" value="${height}" 
                            onchange="updateMouthSize('height', this.value)" style="flex: 1;">
                        <span style="min-width: 40px; text-align: right; color: #333; font-weight: 600;">${height}px</span>
                    </label>
                </div>
            </div>
        `;
        return;
    } else if (featureType === 'horns') {
        container = document.getElementById('hornsPositionControls');
        if (!equipped.horns) {
            if (container) container.innerHTML = '<p style="color: #666;">Equip horns first to adjust position.</p>';
            return;
        }
        featureData = typeof equipped.horns === 'object' ? equipped.horns : { type: equipped.horns, x: 50, y: 0 };
        defaultPos = { x: 50, y: 0 };
    } else if (featureType === 'tentacles') {
        container = document.getElementById('tentaclesPositionControls');
        if (!equipped.tentacles) {
            if (container) container.innerHTML = '<p style="color: #666;">Equip tentacles first to adjust position.</p>';
            return;
        }
        featureData = typeof equipped.tentacles === 'object' ? equipped.tentacles : { type: equipped.tentacles, x: 50, y: 100 };
        defaultPos = { x: 50, y: 100 };
    } else {
        return;
    }
    
    if (!container) return;
    
    const x = featureData.x || defaultPos.x;
    const y = featureData.y || defaultPos.y;
    
    container.innerHTML = `
        <div class="feature-position-display">
            <div class="position-label">Position: (${Math.round(x)}%, ${Math.round(y)}%)</div>
            <div class="position-buttons">
                <button class="btn btn-small btn-secondary" onclick="moveFeature('${featureType}', 'up')" title="Move Up">↑</button>
                <div class="position-buttons-row">
                    <button class="btn btn-small btn-secondary" onclick="moveFeature('${featureType}', 'left')" title="Move Left">←</button>
                    <button class="btn btn-small btn-secondary" onclick="moveFeature('${featureType}', 'right')" title="Move Right">→</button>
                </div>
                <button class="btn btn-small btn-secondary" onclick="moveFeature('${featureType}', 'down')" title="Move Down">↓</button>
            </div>
        </div>
    `;
}

function moveFeature(featureType, direction) {
    const step = 2; // Move by 2% each time
    
    if (featureType === 'mouth') {
        if (!equipped.mouth) {
            equipped.mouth = { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
        }
        switch(direction) {
            case 'up':
                equipped.mouth.y = Math.max(0, Math.min(100, equipped.mouth.y - step));
                break;
            case 'down':
                equipped.mouth.y = Math.max(0, Math.min(100, equipped.mouth.y + step));
                break;
            case 'left':
                equipped.mouth.x = Math.max(0, Math.min(100, equipped.mouth.x - step));
                break;
            case 'right':
                equipped.mouth.x = Math.max(0, Math.min(100, equipped.mouth.x + step));
                break;
        }
        character.mouth = equipped.mouth;
    } else if (featureType === 'horns') {
        if (!equipped.horns) return;
        if (typeof equipped.horns !== 'object' || !equipped.horns.x) {
            equipped.horns = { type: equipped.horns.type || equipped.horns, x: 50, y: 0 };
        }
        switch(direction) {
            case 'up':
                equipped.horns.y = Math.max(-10, Math.min(100, equipped.horns.y - step));
                break;
            case 'down':
                equipped.horns.y = Math.max(-10, Math.min(100, equipped.horns.y + step));
                break;
            case 'left':
                equipped.horns.x = Math.max(0, Math.min(100, equipped.horns.x - step));
                break;
            case 'right':
                equipped.horns.x = Math.max(0, Math.min(100, equipped.horns.x + step));
                break;
        }
        character.horns = equipped.horns;
    } else if (featureType === 'tentacles') {
        if (!equipped.tentacles) return;
        if (typeof equipped.tentacles !== 'object' || !equipped.tentacles.x) {
            equipped.tentacles = { type: equipped.tentacles.type || equipped.tentacles, x: 50, y: 100 };
        }
        switch(direction) {
            case 'up':
                equipped.tentacles.y = Math.max(0, Math.min(110, equipped.tentacles.y - step));
                break;
            case 'down':
                equipped.tentacles.y = Math.max(0, Math.min(110, equipped.tentacles.y + step));
                break;
            case 'left':
                equipped.tentacles.x = Math.max(0, Math.min(100, equipped.tentacles.x - step));
                break;
            case 'right':
                equipped.tentacles.x = Math.max(0, Math.min(100, equipped.tentacles.x + step));
                break;
        }
        character.tentacles = equipped.tentacles;
    }
    
    // Sync to character and save immediately
    if (featureType === 'mouth') {
        character.mouth = equipped.mouth;
    } else if (featureType === 'horns') {
        character.horns = equipped.horns;
    } else if (featureType === 'tentacles') {
        character.tentacles = equipped.tentacles;
    }
    
    // Save immediately
    saveGameData();
    updateCharacterDisplay();
    updateFeaturePositionControls(featureType);
}

window.showEyeManager = showEyeManager;
window.addEye = addEye;
window.removeEye = removeEye;
window.updateEyePosition = updateEyePosition;
window.updateEyeSize = updateEyeSize;
window.updateEyeColor = updateEyeColor;
window.moveEye = moveEye;
window.moveFeature = moveFeature;
window.updateFeaturePositionControls = updateFeaturePositionControls;
window.updateMouthSize = updateMouthSize;
window.tryItem = tryItem;
window.resetToDefault = resetToDefault;
window.cancelTry = cancelTry;

function updateMouthSize(dimension, value) {
    if (!equipped.mouth) {
        equipped.mouth = { type: 'smile', x: 50, y: 60, width: 20, height: 10 };
    }
    
    const sizeValue = parseInt(value, 10);
    if (dimension === 'width') {
        equipped.mouth.width = sizeValue;
    } else if (dimension === 'height') {
        equipped.mouth.height = sizeValue;
    }
    
    // Sync to character
    character.mouth = equipped.mouth;
    
    // Save immediately
    saveGameData();
    updateCharacterDisplay();
    
    // Update the display in the controls
    const widthInput = document.querySelector('#mouthPositionControls input[onchange*="width"]');
    const heightInput = document.querySelector('#mouthPositionControls input[onchange*="height"]');
    if (widthInput) {
        const widthLabel = widthInput.parentElement.querySelector('span:last-child');
        if (widthLabel) widthLabel.textContent = equipped.mouth.width + 'px';
    }
    if (heightInput) {
        const heightLabel = heightInput.parentElement.querySelector('span:last-child');
        if (heightLabel) heightLabel.textContent = equipped.mouth.height + 'px';
    }
}

// Try before you buy functionality
function tryItem(category, itemId) {
    // Find the item in shopItems
    const items = shopItems[category];
    if (!items) return;
    
    const item = items.find(i => {
        if (category === 'bodyColors' || category === 'eyeColors') {
            return (i.color === itemId) || (i.id === itemId);
        }
        return i.id === itemId;
    });
    if (!item) return;
    
    // Save current equipped state if not already saved
    if (!originalEquipped) {
        originalEquipped = JSON.parse(JSON.stringify(equipped));
    }
    
    // Temporarily equip the item
    if (category === 'bodyShapes') {
        equipped.bodyShape = item.id;
    } else if (category === 'bodyColors') {
        equipped.bodyColor = item.color;
    } else if (category === 'eyeColors') {
        // Change color of all eyes
        if (!equipped.eyes || equipped.eyes.length === 0) {
            equipped.eyes = [
                { id: 1, x: 40, y: 35, size: 12, color: item.color },
                { id: 2, x: 60, y: 35, size: 12, color: item.color }
            ];
        } else {
            equipped.eyes.forEach(eye => {
                eye.color = item.color;
            });
        }
    } else if (category === 'mouthTypes') {
        if (!equipped.mouth) {
            equipped.mouth = { type: item.id, x: 50, y: 60, width: 20, height: 10 };
        } else {
            equipped.mouth.type = item.id;
        }
    } else if (category === 'horns') {
        if (typeof equipped.horns !== 'object' || !equipped.horns || !equipped.horns.x) {
            equipped.horns = { type: item.id, x: 50, y: 0 };
        } else {
            equipped.horns.type = item.id;
        }
    } else if (category === 'tentacles') {
        if (typeof equipped.tentacles !== 'object' || !equipped.tentacles || !equipped.tentacles.x) {
            equipped.tentacles = { type: item.id, x: 50, y: 100 };
        } else {
            equipped.tentacles.type = item.id;
        }
    } else if (category === 'tails') {
        if (typeof equipped.tail !== 'object' || !equipped.tail || !equipped.tail.x) {
            equipped.tail = { type: item.id, x: 100, y: 50 };
        } else {
            equipped.tail.type = item.id;
        }
    } else if (category === 'scenes') {
        equipped.scene = item.id;
    } else if (category === 'themes') {
        equipped.theme = item.id;
        applyTheme(item);
    }
    
    // Update display
    updateCharacterDisplay();
    populateShop();
    
    // Show cancel button
    showTryCancelButton();
    
    // Update position controls if applicable
    if (category === 'mouthTypes') {
        updateFeaturePositionControls('mouth');
    } else if (category === 'horns') {
        updateFeaturePositionControls('horns');
    } else if (category === 'tentacles') {
        updateFeaturePositionControls('tentacles');
    }
    
    showMessage(`Trying ${item.name}! Click "Cancel Try" to revert.`, 'info');
}

function cancelTry() {
    if (!originalEquipped) return;
    
    // Restore original equipped state
    equipped = JSON.parse(JSON.stringify(originalEquipped));
    originalEquipped = null;
    
    // Restore theme if it was changed
    if (equipped.theme) {
        const themeItem = shopItems.themes.find(t => t.id === equipped.theme);
        if (themeItem) {
            applyTheme(themeItem);
        }
    } else {
        // Reset to default theme
        const defaultTheme = shopItems.themes.find(t => t.id === 'default');
        if (defaultTheme) {
            applyTheme(defaultTheme);
        }
    }
    
    // Update display
    updateCharacterDisplay();
    populateShop();
    hideTryCancelButton();
    
    // Update position controls
    updateFeaturePositionControls('mouth');
    updateFeaturePositionControls('horns');
    updateFeaturePositionControls('tentacles');
    
    showMessage('Reverted to your saved character!', 'success');
}

function showTryCancelButton() {
    let cancelBtn = document.getElementById('cancelTryButton');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelTryButton';
        cancelBtn.className = 'btn btn-small btn-secondary';
        cancelBtn.textContent = 'Cancel Try';
        cancelBtn.onclick = cancelTry;
        const characterHeader = document.querySelector('.character-header');
        if (characterHeader) {
            const headerButtons = characterHeader.querySelector('div');
            if (headerButtons) {
                headerButtons.appendChild(cancelBtn);
            } else {
                characterHeader.appendChild(cancelBtn);
            }
        }
    }
    cancelBtn.style.display = 'inline-block';
}

function hideTryCancelButton() {
    const cancelBtn = document.getElementById('cancelTryButton');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

function resetToDefault() {
    if (!confirm('Are you sure you want to reset your character to default? This will remove all equipped items and reset to the basic monster.')) {
        return;
    }
    
    // Reset to default equipped state
    equipped = {
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
    
    // Reset character state
    character = {
        name: 'My Study Buddy',
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
        scene: 'default'
    };
    
    // Reset theme
    const defaultTheme = shopItems.themes.find(t => t.id === 'default');
    if (defaultTheme) {
        applyTheme(defaultTheme);
    }
    
    // Clear any try state
    originalEquipped = null;
    hideTryCancelButton();
    
    // Save and update
    saveGameData();
    updateCharacterDisplay();
    populateShop();
    updateFeaturePositionControls('mouth');
    updateFeaturePositionControls('horns');
    updateFeaturePositionControls('tentacles');
    updateEyeManagerList();
    updateResetButton();
    
    showMessage('Character reset to default!', 'success');
}

function updateResetButton() {
    // Check if character is at default state
    const isDefault = 
        equipped.bodyShape === 'round' &&
        equipped.bodyColor === '#8B5CF6' &&
        (!equipped.horns || equipped.horns === null) &&
        (!equipped.tentacles || equipped.tentacles === null) &&
        (!equipped.tail || equipped.tail === null) &&
        (!equipped.wings || equipped.wings === null) &&
        (!equipped.spikes || equipped.spikes === null) &&
        equipped.scene === 'default' &&
        equipped.theme === 'default';
    
    const resetBtn = document.getElementById('resetButton');
    if (resetBtn) {
        resetBtn.style.opacity = isDefault ? '0.5' : '1';
        resetBtn.disabled = isDefault;
    }
}

