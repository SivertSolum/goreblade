// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Main Entry Point
// ============================================

let game = null;

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const characterScreen = document.getElementById('character-screen');
const howToScreen = document.getElementById('how-to-screen');
const gameScreen = document.getElementById('game-screen');
const upgradeScreen = document.getElementById('upgrade-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');

const startBtn = document.getElementById('start-btn');
const howToBtn = document.getElementById('how-to-btn');
const backBtn = document.getElementById('back-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const retryBtn = document.getElementById('retry-btn');
const menuBtn = document.getElementById('menu-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const muteBtn = document.getElementById('mute-btn');
const muteBtnTitle = document.getElementById('mute-btn-title');

// Controller polling
let controllerPollInterval = null;

// Screen management
function showScreen(screen) {
    titleScreen.classList.add('hidden');
    characterScreen.classList.add('hidden');
    howToScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    upgradeScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
}

// Build character select grid
function buildCharacterSelect() {
    const grid = document.getElementById('character-grid');
    grid.innerHTML = '';
    
    for (const [key, char] of Object.entries(CHARACTERS)) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = key;
        
        const weapon = WEAPON_TYPES[char.startingWeapon];
        
        card.innerHTML = `
            <div class="character-avatar" id="avatar-${key}">
                <canvas width="60" height="80"></canvas>
            </div>
            <div class="character-name">${char.name}</div>
            <div class="character-tagline">${char.tagline}</div>
            <div class="character-desc">${char.description}</div>
            <div class="character-weapon">Starts with: <span>${weapon.icon} ${weapon.name}</span></div>
        `;
        
        card.addEventListener('click', () => {
            // Remove selection from all cards
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // Select character and start game
            selectCharacter(key);
            startGame();
        });
        
        grid.appendChild(card);
        
        // Draw character avatar
        drawCharacterAvatar(card.querySelector('canvas'), char);
    }
}

// Draw a mini character avatar on canvas
function drawCharacterAvatar(canvas, char) {
    const ctx = canvas.getContext('2d');
    const cx = 30;
    const cy = 45;
    const s = 12;
    
    ctx.imageSmoothingEnabled = false;
    
    // Body
    ctx.fillStyle = char.clothColor;
    ctx.fillRect(cx - s/2, cy - s/4, s, s);
    
    // Head
    ctx.fillStyle = char.bodyColor;
    ctx.fillRect(cx - s/2.5, cy - s/2 - s/3, s/1.2, s/1.2);
    
    // Hair
    ctx.fillStyle = char.hairColor;
    ctx.fillRect(cx - s/2.5, cy - s/2 - s/3, s/1.2, s/4);
    
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - s/4, cy - s/2, s/5, s/5);
    ctx.fillRect(cx + s/12, cy - s/2, s/5, s/5);
    
    // Legs
    ctx.fillStyle = char.clothColor;
    ctx.fillRect(cx - s/3, cy + s/2, s/4, s/3);
    ctx.fillRect(cx + s/12, cy + s/2, s/4, s/3);
}

// Start new game
function startGame() {
    // Initialize audio on first interaction
    Audio.init();
    Audio.resume();
    
    // Show game screen
    showScreen(gameScreen);
    
    // Initialize game
    game = new Game();
    game.init();
    game.start();
    
    // Add keyboard listeners
    setupInputListeners();
}

// Setup input listeners
function setupInputListeners() {
    document.addEventListener('keydown', (e) => {
        if (!game || game.state !== 'playing') return;
        
        // Prevent scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // M key is handled globally for mute
        if (e.key.toLowerCase() === 'm') return;
        
        game.player.handleKeyDown(e.key);
    });
    
    document.addEventListener('keyup', (e) => {
        if (!game || game.state !== 'playing') return;
        game.player.handleKeyUp(e.key);
    });
    
    // Pause on blur
    window.addEventListener('blur', () => {
        if (game && game.state === 'playing') {
            // Reset all keys to prevent stuck movement
            if (game.player) {
                game.player.keys = {
                    up: false,
                    down: false,
                    left: false,
                    right: false
                };
            }
        }
    });
    
    // Start controller polling
    startControllerPolling();
}

// Toggle mute function
function toggleMute() {
    const muted = Audio.toggleMute();
    updateMuteButton(muted);
}

// Update mute button visuals
function updateMuteButton(muted) {
    // In-game mute button
    if (muteBtn) {
        muteBtn.textContent = muted ? '🔇' : '🔊';
        muteBtn.classList.toggle('muted', muted);
    }
    // Title screen mute button
    if (muteBtnTitle) {
        muteBtnTitle.textContent = muted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
        muteBtnTitle.classList.toggle('muted', muted);
    }
}

// Controller polling
function startControllerPolling() {
    if (controllerPollInterval) return;
    
    controllerPollInterval = setInterval(() => {
        Controller.update();
        handleControllerInput();
    }, 16); // ~60fps
}

function stopControllerPolling() {
    if (controllerPollInterval) {
        clearInterval(controllerPollInterval);
        controllerPollInterval = null;
    }
}

// Handle controller input based on game state
function handleControllerInput() {
    if (!Controller.connected) return;
    
    const nav = Controller.handleMenuNavigation();
    
    // Title screen
    if (!titleScreen.classList.contains('hidden')) {
        if (nav === 'select' || nav === 'start') {
            startGame();
        }
        return;
    }
    
    // How to screen
    if (!howToScreen.classList.contains('hidden')) {
        if (nav === 'back' || nav === 'select') {
            showScreen(titleScreen);
        }
        return;
    }
    
    // Game over screen
    if (!gameOverScreen.classList.contains('hidden')) {
        if (nav === 'select' || nav === 'start') {
            startGame();
        } else if (nav === 'back') {
            returnToTitle();
        }
        return;
    }
    
    // Victory screen
    if (!victoryScreen.classList.contains('hidden')) {
        if (nav === 'select' || nav === 'start') {
            startGame();
        }
        return;
    }
    
    // Upgrade screen
    if (!upgradeScreen.classList.contains('hidden')) {
        const cards = document.querySelectorAll('.upgrade-card');
        Controller.updateUpgradeSelection(cards.length);
        
        if (nav === 'left') {
            Controller.selectPrevUpgrade();
            Controller.updateUpgradeSelection(cards.length);
        } else if (nav === 'right') {
            Controller.selectNextUpgrade();
            Controller.updateUpgradeSelection(cards.length);
        } else if (nav === 'select') {
            const selectedCard = cards[Controller.getCurrentUpgradeIndex()];
            if (selectedCard) {
                selectedCard.click();
                Controller.resetUpgradeSelection();
            }
        }
        return;
    }
    
    // In-game controller movement
    if (game && game.state === 'playing' && game.player) {
        const movement = Controller.getMovement();
        
        // Update player keys based on analog stick
        game.player.keys.left = movement.x < -0.3;
        game.player.keys.right = movement.x > 0.3;
        game.player.keys.up = movement.y < -0.3;
        game.player.keys.down = movement.y > 0.3;
        
        // Also allow D-pad for movement
        if (Controller.isPressed(Controller.BUTTONS.DPAD_LEFT)) game.player.keys.left = true;
        if (Controller.isPressed(Controller.BUTTONS.DPAD_RIGHT)) game.player.keys.right = true;
        if (Controller.isPressed(Controller.BUTTONS.DPAD_UP)) game.player.keys.up = true;
        if (Controller.isPressed(Controller.BUTTONS.DPAD_DOWN)) game.player.keys.down = true;
    }
}

// Return to title
function returnToTitle() {
    game = null;
    showScreen(titleScreen);
}

// Button handlers
startBtn.addEventListener('click', () => {
    buildCharacterSelect();
    showScreen(characterScreen);
});

howToBtn.addEventListener('click', () => {
    showScreen(howToScreen);
});

backBtn.addEventListener('click', () => {
    showScreen(titleScreen);
});

backToMenuBtn.addEventListener('click', () => {
    showScreen(titleScreen);
});

retryBtn.addEventListener('click', () => {
    // Restart with same character
    startGame();
});

menuBtn.addEventListener('click', () => {
    returnToTitle();
});

playAgainBtn.addEventListener('click', () => {
    // Go to character select
    buildCharacterSelect();
    showScreen(characterScreen);
});

// Mute buttons
if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMute();
    });
}

if (muteBtnTitle) {
    muteBtnTitle.addEventListener('click', (e) => {
        e.stopPropagation();
        // Initialize audio if not already done
        if (!Audio.audioContext) {
            Audio.init();
        }
        toggleMute();
    });
}

// Keyboard shortcuts for menus
document.addEventListener('keydown', (e) => {
    // Mute toggle anywhere
    if (e.key.toLowerCase() === 'm') {
        toggleMute();
        return;
    }
    
    // Enter to start from title
    if (e.key === 'Enter') {
        if (!titleScreen.classList.contains('hidden')) {
            startGame();
        } else if (!gameOverScreen.classList.contains('hidden')) {
            startGame();
        } else if (!victoryScreen.classList.contains('hidden')) {
            startGame();
        }
    }
    
    // Escape to return to title
    if (e.key === 'Escape') {
        if (!howToScreen.classList.contains('hidden')) {
            showScreen(titleScreen);
        }
    }
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Initial setup
showScreen(titleScreen);

// Start controller polling immediately (for menu navigation)
startControllerPolling();

console.log(`
╔═══════════════════════════════════════════╗
║         GOREBLADE: UNHOLY SURVIVORS       ║
║                                           ║
║  "They came for your soul...              ║
║   but you came for their butts."          ║
║                                           ║
║  © 2024 HELL INDUSTRIES                   ║
║  "We Put The Fun In Funeral"              ║
╚═══════════════════════════════════════════╝
`);

