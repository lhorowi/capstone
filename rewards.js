// Rewards and Character System JavaScript

// Global state
let character = {
    name: 'My Study Buddy',
    bodyShape: 'round', // round, square, triangle, blob, star, hexagon
    bodyColor: '#8B5CF6', // Purple default
    eyes: '👀', // Different eye types
    mouth: ':)', // Different mouth types
    horns: null, // Horns on head
    spikes: null, // Spikes on body
    tentacles: null, // Tentacles
    wings: null, // Wings
    tail: null, // Tail
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
    eyes: ['👀'], // Default eyes unlocked
    mouths: [':)'], // Default mouth unlocked
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
    eyes: '👀',
    mouth: ':)',
    horns: null,
    spikes: null,
    tentacles: null,
    wings: null,
    tail: null,
    scene: 'default',
    theme: 'default'
};

// Shop items catalog
const shopItems = {
    bodyShapes: [
        { id: 'round', icon: '⭕', name: 'Round Monster', price: 0, owned: true },
        { id: 'square', icon: '⬜', name: 'Square Monster', price: 40 },
        { id: 'triangle', icon: '🔺', name: 'Triangle Monster', price: 45 },
        { id: 'blob', icon: '💧', name: 'Blob Monster', price: 50 },
        { id: 'star', icon: '⭐', name: 'Star Monster', price: 60 },
        { id: 'hexagon', icon: '⬡', name: 'Hexagon Monster', price: 55 }
    ],
    bodyColors: [
        { id: 'purple', color: '#8B5CF6', name: 'Purple', price: 0, owned: true },
        { id: 'blue', color: '#3B82F6', name: 'Blue', price: 20 },
        { id: 'green', color: '#10B981', name: 'Green', price: 20 },
        { id: 'red', color: '#EF4444', name: 'Red', price: 20 },
        { id: 'orange', color: '#F97316', name: 'Orange', price: 20 },
        { id: 'pink', color: '#EC4899', name: 'Pink', price: 25 },
        { id: 'yellow', color: '#FBBF24', name: 'Yellow', price: 25 },
        { id: 'cyan', color: '#06B6D4', name: 'Cyan', price: 25 },
        { id: 'lime', color: '#84CC16', name: 'Lime', price: 30 },
        { id: 'indigo', color: '#6366F1', name: 'Indigo', price: 30 }
    ],
    eyes: [
        { id: 'normal', icon: '👀', name: 'Normal Eyes', price: 0, owned: true },
        { id: 'big', icon: '👁️', name: 'Big Eyes', price: 30 },
        { id: 'angry', icon: '😠', name: 'Angry Eyes', price: 35 },
        { id: 'sleepy', icon: '😴', name: 'Sleepy Eyes', price: 30 },
        { id: 'laser', icon: '👁️‍🗨️', name: 'Laser Eyes', price: 50 },
        { id: 'glowing', icon: '👁️', name: 'Glowing Eyes', price: 40 },
        { id: 'many', icon: '👁️👁️👁️', name: 'Many Eyes', price: 60 }
    ],
    mouths: [
        { id: 'happy', icon: ':)', name: 'Happy', price: 0, owned: true },
        { id: 'big-smile', icon: ':D', name: 'Big Smile', price: 25 },
        { id: 'fangs', icon: '>:)', name: 'Fangs', price: 40 },
        { id: 'tongue', icon: ':P', name: 'Tongue Out', price: 30 },
        { id: 'surprised', icon: ':O', name: 'Surprised', price: 25 },
        { id: 'teeth', icon: ':B', name: 'Sharp Teeth', price: 45 },
        { id: 'fire', icon: '🔥', name: 'Fire Breath', price: 55 }
    ],
    horns: [
        { id: 'small', icon: '🦌', name: 'Small Horns', price: 40 },
        { id: 'big', icon: '🐂', name: 'Big Horns', price: 60 },
        { id: 'curved', icon: '🐐', name: 'Curved Horns', price: 50 },
        { id: 'spiral', icon: '🐑', name: 'Spiral Horns', price: 55 }
    ],
    spikes: [
        { id: 'back', icon: '🦔', name: 'Back Spikes', price: 45 },
        { id: 'all-over', icon: '🌵', name: 'All Over Spikes', price: 65 },
        { id: 'sharp', icon: '⚡', name: 'Sharp Spikes', price: 50 }
    ],
    tentacles: [
        { id: 'two', icon: '🐙', name: 'Two Tentacles', price: 55 },
        { id: 'four', icon: '🐙', name: 'Four Tentacles', price: 70 },
        { id: 'eight', icon: '🐙', name: 'Eight Tentacles', price: 85 }
    ],
    wings: [
        { id: 'bat', icon: '🦇', name: 'Bat Wings', price: 80 },
        { id: 'angel', icon: '👼', name: 'Angel Wings', price: 90 },
        { id: 'dragon', icon: '🐉', name: 'Dragon Wings', price: 100 }
    ],
    tails: [
        { id: 'short', icon: '🐰', name: 'Short Tail', price: 35 },
        { id: 'long', icon: '🐍', name: 'Long Tail', price: 50 },
        { id: 'spiked', icon: '🦎', name: 'Spiked Tail', price: 60 }
    ],
    scenes: [
        { id: 'default', icon: '🌤️', name: 'Sunny Day', price: 0, owned: true },
        { id: 'library', icon: '📚', name: 'Library', price: 80 },
        { id: 'beach', icon: '🏖️', name: 'Beach', price: 100 },
        { id: 'space', icon: '🚀', name: 'Space', price: 150 },
        { id: 'forest', icon: '🌲', name: 'Forest', price: 90 },
        { id: 'city', icon: '🌆', name: 'City Skyline', price: 120 }
    ],
    themes: [
        { id: 'default', icon: '💜', name: 'Purple Dream', price: 0, owned: true, colors: { primary: '#667eea', secondary: '#764ba2', accent: '#667eea' } },
        { id: 'ocean', icon: '🌊', name: 'Ocean Breeze', price: 75, colors: { primary: '#4facfe', secondary: '#00f2fe', accent: '#4facfe' } },
        { id: 'sunset', icon: '🌅', name: 'Sunset Glow', price: 80, colors: { primary: '#fa709a', secondary: '#fee140', accent: '#fa709a' } },
        { id: 'forest', icon: '🌲', name: 'Forest Green', price: 70, colors: { primary: '#11998e', secondary: '#38ef7d', accent: '#11998e' } },
        { id: 'lavender', icon: '💐', name: 'Lavender Fields', price: 85, colors: { primary: '#a8edea', secondary: '#fed6e3', accent: '#a8edea' } },
        { id: 'midnight', icon: '🌙', name: 'Midnight Blue', price: 90, colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#2c3e50' } },
        { id: 'coral', icon: '🪸', name: 'Coral Reef', price: 75, colors: { primary: '#ff6b6b', secondary: '#feca57', accent: '#ff6b6b' } },
        { id: 'aurora', icon: '🌌', name: 'Aurora Borealis', price: 100, colors: { primary: '#667eea', secondary: '#764ba2', accent: '#f093fb' } }
    ],
    rewards: [
        { id: 'break5', icon: '☕', name: '5-Min Break Pass', price: 20, type: 'consumable' },
        { id: 'break15', icon: '🍕', name: '15-Min Break Pass', price: 50, type: 'consumable' },
        { id: 'motivate', icon: '💪', name: 'Motivation Boost', price: 30, type: 'consumable' },
        { id: 'skip', icon: '⏭️', name: 'Skip Minor Task', price: 100, type: 'consumable' }
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
    // Load character
    const savedCharacter = localStorage.getItem('studyBuddyCharacter');
    if (savedCharacter) {
        const loaded = JSON.parse(savedCharacter);
        // Merge with defaults to handle new properties
        character = { ...character, ...loaded };
    }
    
    // Load player data
    const savedPlayerData = localStorage.getItem('studyBuddyPlayerData');
    if (savedPlayerData) {
        playerData = JSON.parse(savedPlayerData);
    }
    
    // Load inventory
    const savedInventory = localStorage.getItem('studyBuddyInventory');
    if (savedInventory) {
        const loaded = JSON.parse(savedInventory);
        // Merge with defaults
        inventory = {
            bodyShapes: loaded.bodyShapes || ['round'],
            bodyColors: loaded.bodyColors || ['#8B5CF6'],
            eyes: loaded.eyes || ['👀'],
            mouths: loaded.mouths || [':)'],
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
    
    // Load equipped items
    const savedEquipped = localStorage.getItem('studyBuddyEquipped');
    if (savedEquipped) {
        const loaded = JSON.parse(savedEquipped);
        // Merge with defaults
        equipped = {
            bodyShape: loaded.bodyShape || 'round',
            bodyColor: loaded.bodyColor || '#8B5CF6',
            eyes: loaded.eyes || '👀',
            mouth: loaded.mouth || ':)',
            horns: loaded.horns || null,
            spikes: loaded.spikes || null,
            tentacles: loaded.tentacles || null,
            wings: loaded.wings || null,
            tail: loaded.tail || null,
            scene: loaded.scene || 'default',
            theme: loaded.theme || 'default'
        };
    }
    
    // Sync equipped to character
    character.bodyShape = equipped.bodyShape;
    character.bodyColor = equipped.bodyColor;
    character.eyes = equipped.eyes;
    character.mouth = equipped.mouth;
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
}

function updatePointsDisplay() {
    document.getElementById('pointsValue').textContent = playerData.points;
    document.getElementById('completedCount').textContent = playerData.completedTasks;
    document.getElementById('streakCount').textContent = playerData.streak;
    document.getElementById('levelValue').textContent = playerData.level;
    
    // Update motivation bar based on recent activity
    const motivationPercent = Math.min(100, (playerData.streak * 10) + 50);
    document.getElementById('motivationBar').style.width = motivationPercent + '%';
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
    
    // Add horns on top
    if (equipped.horns) {
        const horns = document.createElement('div');
        horns.className = 'monster-horns';
        horns.textContent = getHornsIcon(equipped.horns);
        body.appendChild(horns);
    }
    
    // Add face
    const face = document.createElement('div');
    face.className = 'monster-face';
    
    // Add eyes
    const eyes = document.createElement('div');
    eyes.className = 'monster-eyes';
    eyes.textContent = equipped.eyes || '👀';
    face.appendChild(eyes);
    
    // Add mouth
    const mouth = document.createElement('div');
    mouth.className = 'monster-mouth';
    mouth.textContent = equipped.mouth || '😊';
    face.appendChild(mouth);
    
    body.appendChild(face);
    
    // Add spikes
    if (equipped.spikes) {
        const spikes = document.createElement('div');
        spikes.className = 'monster-spikes';
        spikes.textContent = getSpikesIcon(equipped.spikes);
        body.appendChild(spikes);
    }
    
    // Add wings
    if (equipped.wings) {
        const wings = document.createElement('div');
        wings.className = 'monster-wings';
        wings.textContent = getWingsIcon(equipped.wings);
        body.appendChild(wings);
    }
    
    // Add tentacles
    if (equipped.tentacles) {
        const tentacles = document.createElement('div');
        tentacles.className = 'monster-tentacles';
        tentacles.textContent = getTentaclesIcon(equipped.tentacles);
        body.appendChild(tentacles);
    }
    
    // Add tail
    if (equipped.tail) {
        const tail = document.createElement('div');
        tail.className = 'monster-tail';
        tail.textContent = getTailIcon(equipped.tail);
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

function getHornsIcon(hornType) {
    const icons = {
        'small': '🦌',
        'big': '🐂',
        'curved': '🐐',
        'spiral': '🐑'
    };
    return icons[hornType] || '🦌';
}

function getSpikesIcon(spikeType) {
    const icons = {
        'back': '🦔',
        'all-over': '🌵',
        'sharp': '⚡'
    };
    return icons[spikeType] || '🦔';
}

function getWingsIcon(wingType) {
    const icons = {
        'bat': '🦇',
        'angel': '👼',
        'dragon': '🐉'
    };
    return icons[wingType] || '🦇';
}

function getTentaclesIcon(tentacleType) {
    const count = tentacleType === 'two' ? 2 : tentacleType === 'four' ? 4 : 8;
    return '🐙'.repeat(Math.min(count, 4)); // Show up to 4 icons
}

function getTailIcon(tailType) {
    const icons = {
        'short': '🐰',
        'long': '🐍',
        'spiked': '🦎'
    };
    return icons[tailType] || '🐰';
}

function populateShop() {
    populateShopTab('bodyShapes', shopItems.bodyShapes);
    populateShopTab('bodyColors', shopItems.bodyColors);
    populateShopTab('eyes', shopItems.eyes);
    populateShopTab('mouths', shopItems.mouths);
    populateShopTab('horns', shopItems.horns);
    populateShopTab('spikes', shopItems.spikes);
    populateShopTab('tentacles', shopItems.tentacles);
    populateShopTab('wings', shopItems.wings);
    populateShopTab('tails', shopItems.tails);
    populateShopTab('scenes', shopItems.scenes);
    populateShopTab('themes', shopItems.themes);
    populateShopTab('rewards', shopItems.rewards);
}

function populateShopTab(category, items) {
    const grid = document.getElementById(category + 'Grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    items.forEach(item => {
        const owned = inventory[category].includes(item.id);
        let isEquipped = false;
        
        // Check if item is equipped
        if (category === 'bodyShapes') {
            isEquipped = equipped.bodyShape === item.id;
        } else if (category === 'bodyColors') {
            isEquipped = equipped.bodyColor === item.color;
        } else if (category === 'eyes') {
            isEquipped = equipped.eyes === item.icon;
        } else if (category === 'mouths') {
            isEquipped = equipped.mouth === item.icon;
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
        
        itemDiv.innerHTML = `
            ${previewHtml}
            <div class="shop-item-icon">${item.icon || '🎨'}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price ${owned ? 'owned' : ''}">
                ${owned ? (isEquipped ? 'Active' : 'Owned') : `⭐ ${item.price}`}
            </div>
        `;
        
        grid.appendChild(itemDiv);
    });
}

function handleShopItemClick(category, item) {
    // For body colors, check by color value
    let owned = false;
    if (category === 'bodyColors') {
        owned = inventory[category].includes(item.color);
    } else {
        owned = inventory[category].includes(item.id);
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
        
        // For body colors, store the color value
        if (category === 'bodyColors') {
            inventory[category].push(item.color);
        } else {
            inventory[category].push(item.id);
        }
        
        saveGameData();
        updatePointsDisplay();
        populateShop();
        
        showMessage(`Purchased ${item.name}! ${item.price} points spent.`, 'success');
        
        // Auto-equip after purchase
        equipItem(category, item);
    }
}

function equipItem(category, item) {
    if (category === 'bodyShapes') {
        equipped.bodyShape = item.id;
        character.bodyShape = item.id;
    } else if (category === 'bodyColors') {
        equipped.bodyColor = item.color;
        character.bodyColor = item.color;
    } else if (category === 'eyes') {
        equipped.eyes = item.icon;
        character.eyes = item.icon;
    } else if (category === 'mouths') {
        equipped.mouth = item.icon;
        character.mouth = item.icon;
    } else if (category === 'horns') {
        equipped.horns = item.id;
        character.horns = item.id;
    } else if (category === 'spikes') {
        equipped.spikes = item.id;
        character.spikes = item.id;
    } else if (category === 'tentacles') {
        equipped.tentacles = item.id;
        character.tentacles = item.id;
    } else if (category === 'wings') {
        equipped.wings = item.id;
        character.wings = item.id;
    } else if (category === 'tails') {
        equipped.tail = item.id;
        character.tail = item.id;
    } else if (category === 'scenes') {
        equipped.scene = item.id;
    } else if (category === 'themes') {
        equipped.theme = item.id;
        applyTheme(item);
    }
    
    saveGameData();
    updateCharacterDisplay();
    populateShop();
    
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
    document.getElementById(tabName + 'Tab').style.display = 'block';
    
    // Add active class to clicked button
    event.target.classList.add('active');
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

function selectExpression(expression) {
    // Legacy function - kept for compatibility
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

// Global functions
window.showShopTab = showShopTab;
window.showCharacterCreator = showCharacterCreator;
window.closeCharacterCreator = closeCharacterCreator;
window.selectExpression = selectExpression;
window.saveCharacter = saveCharacter;

