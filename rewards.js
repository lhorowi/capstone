// Rewards and Character System JavaScript

// Global state
let character = {
    name: 'My Study Buddy',
    skinTone: '#ffd1a3',
    expression: '😊',
    outfit: '👕',
    accessory: null,
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
    outfits: ['👕'], // Default outfit unlocked
    accessories: [],
    scenes: ['default'], // Default scene unlocked
    rewards: []
};

let equipped = {
    outfit: '👕',
    accessory: null,
    scene: 'default'
};

// Shop items catalog
const shopItems = {
    outfits: [
        { id: 'casual', icon: '👕', name: 'Casual Tee', price: 0, owned: true },
        { id: 'hoodie', icon: '🧥', name: 'Cozy Hoodie', price: 50 },
        { id: 'suit', icon: '🤵', name: 'Business Suit', price: 100 },
        { id: 'dress', icon: '👗', name: 'Nice Dress', price: 100 },
        { id: 'sweater', icon: '🧶', name: 'Warm Sweater', price: 75 },
        { id: 'jersey', icon: '👔', name: 'Sports Jersey', price: 80 },
        { id: 'pajamas', icon: '🛌', name: 'Comfy Pajamas', price: 60 },
        { id: 'graduation', icon: '🎓', name: 'Graduation Gown', price: 200 }
    ],
    accessories: [
        { id: 'glasses', icon: '👓', name: 'Smart Glasses', price: 30 },
        { id: 'hat', icon: '🎩', name: 'Fancy Hat', price: 40 },
        { id: 'crown', icon: '👑', name: 'Crown', price: 150 },
        { id: 'headphones', icon: '🎧', name: 'Headphones', price: 50 },
        { id: 'cap', icon: '🧢', name: 'Baseball Cap', price: 35 },
        { id: 'bow', icon: '🎀', name: 'Cute Bow', price: 25 },
        { id: 'sunglasses', icon: '😎', name: 'Cool Sunglasses', price: 45 }
    ],
    scenes: [
        { id: 'default', icon: '🌤️', name: 'Sunny Day', price: 0, owned: true },
        { id: 'library', icon: '📚', name: 'Library', price: 80 },
        { id: 'beach', icon: '🏖️', name: 'Beach', price: 100 },
        { id: 'space', icon: '🚀', name: 'Space', price: 150 },
        { id: 'forest', icon: '🌲', name: 'Forest', price: 90 },
        { id: 'city', icon: '🌆', name: 'City Skyline', price: 120 }
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
        character = JSON.parse(savedCharacter);
    }
    
    // Load player data
    const savedPlayerData = localStorage.getItem('studyBuddyPlayerData');
    if (savedPlayerData) {
        playerData = JSON.parse(savedPlayerData);
    }
    
    // Load inventory
    const savedInventory = localStorage.getItem('studyBuddyInventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
    }
    
    // Load equipped items
    const savedEquipped = localStorage.getItem('studyBuddyEquipped');
    if (savedEquipped) {
        equipped = JSON.parse(savedEquipped);
    }
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
    // Update character body color
    const characterBody = document.querySelector('.character-body');
    const characterFace = document.querySelector('.character-face');
    if (characterBody && characterFace) {
        characterBody.style.background = character.skinTone;
        characterFace.style.background = character.skinTone;
    }
    
    // Update expression
    const mouth = document.querySelector('.mouth');
    if (mouth) {
        mouth.textContent = character.expression;
    }
    
    // Update outfit
    const outfitDisplay = document.querySelector('.outfit-display');
    if (outfitDisplay) {
        outfitDisplay.textContent = equipped.outfit;
    }
    
    // Update accessory
    const accessoryDisplay = document.getElementById('characterAccessory');
    if (accessoryDisplay) {
        accessoryDisplay.textContent = equipped.accessory || '';
    }
    
    // Update scene
    const sceneBackground = document.getElementById('sceneBackground');
    if (sceneBackground) {
        sceneBackground.className = 'scene-background ' + equipped.scene;
    }
    
    // Update name
    document.getElementById('characterName').textContent = character.name;
}

function populateShop() {
    populateShopTab('outfits', shopItems.outfits);
    populateShopTab('accessories', shopItems.accessories);
    populateShopTab('scenes', shopItems.scenes);
    populateShopTab('rewards', shopItems.rewards);
}

function populateShopTab(category, items) {
    const grid = document.getElementById(category + 'Grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    items.forEach(item => {
        const owned = inventory[category].includes(item.id);
        const isEquipped = equipped[category === 'outfits' ? 'outfit' : category === 'accessories' ? 'accessory' : 'scene'] === item.icon;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `shop-item ${owned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''}`;
        itemDiv.onclick = () => handleShopItemClick(category, item);
        
        itemDiv.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price ${owned ? 'owned' : ''}">
                ${owned ? (isEquipped ? 'Equipped' : 'Owned') : `⭐ ${item.price}`}
            </div>
        `;
        
        grid.appendChild(itemDiv);
    });
}

function handleShopItemClick(category, item) {
    const owned = inventory[category].includes(item.id);
    
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
        inventory[category].push(item.id);
        
        saveGameData();
        updatePointsDisplay();
        populateShop();
        
        showMessage(`Purchased ${item.name}! ${item.price} points spent.`, 'success');
        
        // Auto-equip after purchase
        equipItem(category, item);
    }
}

function equipItem(category, item) {
    if (category === 'outfits') {
        equipped.outfit = item.icon;
    } else if (category === 'accessories') {
        equipped.accessory = item.icon;
    } else if (category === 'scenes') {
        equipped.scene = item.id;
    }
    
    saveGameData();
    updateCharacterDisplay();
    populateShop();
    
    showMessage(`Equipped ${item.name}!`, 'success');
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
    document.getElementById('buddyName').value = character.name;
    
    // Highlight current skin tone
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.color === character.skinTone) {
            option.classList.add('selected');
        }
    });
    
    // Highlight current expression
    document.querySelectorAll('.expression-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.expression === character.expression) {
            btn.classList.add('selected');
        }
    });
    
    // Setup listeners
    document.querySelectorAll('.color-option').forEach(option => {
        option.onclick = () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            character.skinTone = option.dataset.color;
        };
    });
}

function closeCharacterCreator() {
    document.getElementById('characterModal').style.display = 'none';
}

function selectExpression(expression) {
    character.expression = expression;
    document.querySelectorAll('.expression-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.expression === expression) {
            btn.classList.add('selected');
        }
    });
}

function saveCharacter() {
    const newName = document.getElementById('buddyName').value.trim();
    if (newName) {
        character.name = newName;
    }
    
    saveGameData();
    updateCharacterDisplay();
    closeCharacterCreator();
    
    showMessage('Character updated!', 'success');
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

