// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Main Entry Point
// ============================================

let game = null;

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const characterScreen = document.getElementById('character-screen');
const howToScreen = document.getElementById('how-to-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameScreen = document.getElementById('game-screen');
const upgradeScreen = document.getElementById('upgrade-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');

const startBtn = document.getElementById('start-btn');
const howToBtn = document.getElementById('how-to-btn');
const settingsBtn = document.getElementById('settings-btn');
const backBtn = document.getElementById('back-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const settingsBackBtn = document.getElementById('settings-back-btn');
const retryBtn = document.getElementById('retry-btn');
const menuBtn = document.getElementById('menu-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const muteBtn = document.getElementById('mute-btn');
const muteBtnTitle = document.getElementById('mute-btn-title');

// Controller polling
let controllerPollInterval = null;

// Menu navigation state
let currentScreen = 'title';
let menuIndex = 0;
let characterIndex = 0;
let settingIndex = 0;
let lastNavTime = 0;
const NAV_DELAY = 200; // Prevent too fast navigation

// Game settings
const GameSettings = {
    scanlines: true,
    screenShake: true,
    particleLevel: 2, // 0=off, 1=low, 2=high
    enemyOutlines: true,
    masterVolume: 0.3,
    musicVolume: 0.4,
    sfxVolume: 0.3,
    
    save() {
        try {
            localStorage.setItem('goreblade_settings', JSON.stringify({
                scanlines: this.scanlines,
                screenShake: this.screenShake,
                particleLevel: this.particleLevel,
                enemyOutlines: this.enemyOutlines,
                masterVolume: this.masterVolume,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
            }));
        } catch(e) {}
    },
    
    load() {
        try {
            const saved = localStorage.getItem('goreblade_settings');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this, data);
            }
        } catch(e) {}
    },
    
    apply() {
        // Apply scanlines
        document.querySelectorAll('.scanlines').forEach(el => {
            el.style.display = this.scanlines ? 'block' : 'none';
        });
        
        // Apply audio settings
        Audio.setVolume(this.sfxVolume);
        Audio.setMusicVolume(this.musicVolume);
        
        // Update UI
        this.updateSettingsUI();
    },
    
    updateSettingsUI() {
        // Volume sliders
        const masterSlider = document.getElementById('master-volume');
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        
        if (masterSlider) {
            masterSlider.value = this.masterVolume * 100;
            document.getElementById('master-volume-value').textContent = Math.round(this.masterVolume * 100) + '%';
        }
        if (musicSlider) {
            musicSlider.value = this.musicVolume * 100;
            document.getElementById('music-volume-value').textContent = Math.round(this.musicVolume * 100) + '%';
        }
        if (sfxSlider) {
            sfxSlider.value = this.sfxVolume * 100;
            document.getElementById('sfx-volume-value').textContent = Math.round(this.sfxVolume * 100) + '%';
        }
        
        // Toggle buttons
        const scanlinesBtn = document.getElementById('toggle-scanlines');
        const shakeBtn = document.getElementById('toggle-screenshake');
        const particlesBtn = document.getElementById('toggle-particles');
        const outlinesBtn = document.getElementById('toggle-outlines');
        
        if (scanlinesBtn) {
            scanlinesBtn.textContent = this.scanlines ? 'ON' : 'OFF';
            scanlinesBtn.classList.toggle('off', !this.scanlines);
        }
        if (shakeBtn) {
            shakeBtn.textContent = this.screenShake ? 'ON' : 'OFF';
            shakeBtn.classList.toggle('off', !this.screenShake);
        }
        if (particlesBtn) {
            particlesBtn.textContent = ['OFF', 'LOW', 'HIGH'][this.particleLevel];
            particlesBtn.classList.toggle('off', this.particleLevel === 0);
        }
        if (outlinesBtn) {
            outlinesBtn.textContent = this.enemyOutlines ? 'ON' : 'OFF';
            outlinesBtn.classList.toggle('off', !this.enemyOutlines);
        }
    }
};

// Screen management
function showScreen(screen) {
    titleScreen.classList.add('hidden');
    characterScreen.classList.add('hidden');
    howToScreen.classList.add('hidden');
    settingsScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    upgradeScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    
    screen.classList.remove('hidden');
    
    // Update current screen state
    if (screen === titleScreen) currentScreen = 'title';
    else if (screen === characterScreen) currentScreen = 'character';
    else if (screen === howToScreen) currentScreen = 'howto';
    else if (screen === settingsScreen) currentScreen = 'settings';
    else if (screen === gameScreen) currentScreen = 'game';
    else if (screen === upgradeScreen) currentScreen = 'upgrade';
    else if (screen === gameOverScreen) currentScreen = 'gameover';
    else if (screen === victoryScreen) currentScreen = 'victory';
    
    // Reset menu index for the new screen
    menuIndex = 0;
    characterIndex = 0;
    settingIndex = 0;
    updateMenuSelection();
}

// Update visual selection in menus
function updateMenuSelection() {
    // Clear all selections
    document.querySelectorAll('.menu-btn.selected').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.character-card.keyboard-selected').forEach(card => card.classList.remove('keyboard-selected'));
    document.querySelectorAll('.setting-row.selected').forEach(row => row.classList.remove('selected'));
    
    if (currentScreen === 'title') {
        const buttons = titleScreen.querySelectorAll('.menu-btn');
        if (buttons[menuIndex]) {
            buttons[menuIndex].classList.add('selected');
        }
    } else if (currentScreen === 'character') {
        const cards = document.querySelectorAll('.character-card');
        if (cards[characterIndex]) {
            cards[characterIndex].classList.add('keyboard-selected');
        }
    } else if (currentScreen === 'settings') {
        const rows = settingsScreen.querySelectorAll('[data-setting-index]');
        if (rows[settingIndex]) {
            rows[settingIndex].classList.add('selected');
        }
    }
}

// Navigate menu
function navigateMenu(direction) {
    const now = Date.now();
    if (now - lastNavTime < NAV_DELAY) return;
    lastNavTime = now;
    
    Audio.playPickup(); // Small feedback sound
    
    if (currentScreen === 'title') {
        const buttons = titleScreen.querySelectorAll('.menu-btn');
        menuIndex = (menuIndex + direction + buttons.length) % buttons.length;
    } else if (currentScreen === 'character') {
        const cards = document.querySelectorAll('.character-card');
        const cols = 3; // Characters per row
        
        if (direction === 1 || direction === -1) {
            // Left/Right
            characterIndex = (characterIndex + direction + cards.length) % cards.length;
        } else if (direction === 10) {
            // Down
            characterIndex = Math.min(characterIndex + cols, cards.length - 1);
        } else if (direction === -10) {
            // Up
            characterIndex = Math.max(characterIndex - cols, 0);
        }
    } else if (currentScreen === 'settings') {
        const rows = settingsScreen.querySelectorAll('[data-setting-index]');
        settingIndex = (settingIndex + direction + rows.length) % rows.length;
    }
    
    updateMenuSelection();
}

// Select current menu item
function selectMenuItem() {
    if (currentScreen === 'title') {
        const buttons = titleScreen.querySelectorAll('.menu-btn');
        if (buttons[menuIndex]) {
            buttons[menuIndex].click();
        }
    } else if (currentScreen === 'character') {
        const cards = document.querySelectorAll('.character-card');
        if (cards[characterIndex]) {
            cards[characterIndex].click();
        }
    } else if (currentScreen === 'settings') {
        // Handle settings selection
        handleSettingsSelect();
    } else if (currentScreen === 'howto') {
        showScreen(titleScreen);
    }
}

// Handle settings row selection/adjustment
function handleSettingsSelect() {
    const rows = settingsScreen.querySelectorAll('[data-setting-index]');
    const row = rows[settingIndex];
    if (!row) return;
    
    // Check if it's the back button
    if (row.id === 'settings-back-btn') {
        showScreen(titleScreen);
        return;
    }
    
    // Check for toggle buttons
    const toggle = row.querySelector('.setting-toggle');
    if (toggle) {
        toggle.click();
    }
}

// Adjust setting value (for sliders)
function adjustSetting(direction) {
    const rows = settingsScreen.querySelectorAll('[data-setting-index]');
    const row = rows[settingIndex];
    if (!row) return;
    
    const slider = row.querySelector('.retro-slider');
    if (slider) {
        const step = direction * 5;
        slider.value = Math.max(0, Math.min(100, parseInt(slider.value) + step));
        slider.dispatchEvent(new Event('input'));
    }
    
    // For toggle buttons, left/right also toggles
    const toggle = row.querySelector('.setting-toggle');
    if (toggle) {
        toggle.click();
    }
}

// Go back in menu
function menuBack() {
    if (currentScreen === 'character' || currentScreen === 'howto' || currentScreen === 'settings') {
        showScreen(titleScreen);
    } else if (currentScreen === 'gameover' || currentScreen === 'victory') {
        returnToTitle();
    }
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
    
    // Menu navigation for all menu screens
    if (currentScreen === 'title' || currentScreen === 'character' || currentScreen === 'settings' || currentScreen === 'howto') {
        if (nav === 'up') {
            if (currentScreen === 'character') {
                navigateMenu(-10);
            } else {
                navigateMenu(-1);
            }
        } else if (nav === 'down') {
            if (currentScreen === 'character') {
                navigateMenu(10);
            } else {
                navigateMenu(1);
            }
        } else if (nav === 'left') {
            if (currentScreen === 'settings') {
                adjustSetting(-1);
            } else {
                navigateMenu(-1);
            }
        } else if (nav === 'right') {
            if (currentScreen === 'settings') {
                adjustSetting(1);
            } else {
                navigateMenu(1);
            }
        } else if (nav === 'select' || nav === 'start') {
            selectMenuItem();
        } else if (nav === 'back') {
            menuBack();
        }
        
        // Don't process old navigation if we handled it
        if (nav) return;
    }
    
    // Title screen (legacy fallback)
    if (!titleScreen.classList.contains('hidden')) {
        if (nav === 'select' || nav === 'start') {
            selectMenuItem();
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

settingsBtn.addEventListener('click', () => {
    GameSettings.updateSettingsUI();
    showScreen(settingsScreen);
});

backBtn.addEventListener('click', () => {
    showScreen(titleScreen);
});

backToMenuBtn.addEventListener('click', () => {
    showScreen(titleScreen);
});

settingsBackBtn.addEventListener('click', () => {
    GameSettings.save();
    showScreen(titleScreen);
});

// Settings controls
document.getElementById('master-volume')?.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    GameSettings.masterVolume = value;
    GameSettings.sfxVolume = value;
    Audio.setVolume(value);
    document.getElementById('master-volume-value').textContent = e.target.value + '%';
    GameSettings.save();
});

document.getElementById('music-volume')?.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    GameSettings.musicVolume = value;
    Audio.setMusicVolume(value);
    document.getElementById('music-volume-value').textContent = e.target.value + '%';
    GameSettings.save();
});

document.getElementById('sfx-volume')?.addEventListener('input', (e) => {
    const value = e.target.value / 100;
    GameSettings.sfxVolume = value;
    Audio.setVolume(value);
    document.getElementById('sfx-volume-value').textContent = e.target.value + '%';
    GameSettings.save();
});

document.getElementById('toggle-scanlines')?.addEventListener('click', () => {
    GameSettings.scanlines = !GameSettings.scanlines;
    GameSettings.apply();
    GameSettings.save();
});

document.getElementById('toggle-screenshake')?.addEventListener('click', () => {
    GameSettings.screenShake = !GameSettings.screenShake;
    GameSettings.updateSettingsUI();
    GameSettings.save();
});

document.getElementById('toggle-particles')?.addEventListener('click', () => {
    GameSettings.particleLevel = (GameSettings.particleLevel + 1) % 3;
    GameSettings.updateSettingsUI();
    GameSettings.save();
});

document.getElementById('toggle-outlines')?.addEventListener('click', () => {
    GameSettings.enemyOutlines = !GameSettings.enemyOutlines;
    GameSettings.updateSettingsUI();
    GameSettings.save();
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
    
    // Menu navigation with WASD and Arrow Keys
    if (currentScreen !== 'game') {
        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                e.preventDefault();
                if (currentScreen === 'character') {
                    navigateMenu(-10); // Up in grid
                } else {
                    navigateMenu(-1);
                }
                break;
            case 's':
            case 'arrowdown':
                e.preventDefault();
                if (currentScreen === 'character') {
                    navigateMenu(10); // Down in grid
                } else {
                    navigateMenu(1);
                }
                break;
            case 'a':
            case 'arrowleft':
                e.preventDefault();
                if (currentScreen === 'settings') {
                    adjustSetting(-1);
                } else {
                    navigateMenu(-1);
                }
                break;
            case 'd':
            case 'arrowright':
                e.preventDefault();
                if (currentScreen === 'settings') {
                    adjustSetting(1);
                } else {
                    navigateMenu(1);
                }
                break;
        }
    }
    
    // Enter/Space to select
    if (e.key === 'Enter' || e.key === ' ') {
        if (currentScreen !== 'game') {
            e.preventDefault();
            selectMenuItem();
        }
    }
    
    // Escape to go back
    if (e.key === 'Escape') {
        menuBack();
    }
});

// Prevent context menu on canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});

// Initial setup
GameSettings.load();
GameSettings.apply();
showScreen(titleScreen);
updateMenuSelection(); // Show initial selection

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

