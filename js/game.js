// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Main Game Engine
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'title'; // title, playing, upgrading, paused, gameover, victory
        this.lastTime = 0;
        this.gameTime = 0;
        
        // Set canvas size
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        this.particles = new ParticleSystem();
        this.waveManager = null;
        this.upgradeManager = null;
        
        // Boss stuff
        this.currentBoss = null;
        this.bossSpawned = false;
        this.bossWarningShown = false;
        this.bossWarningTimer = 0;
        
        // Wave transition
        this.waveCompleteTimer = 0;
        this.waveStartTimer = 0;
        this.showingWaveAnnouncement = false;
        this.waveAnnouncement = '';
        this.pendingNextWave = 0; // Track if we need to start a wave after upgrade
        
        // Camera shake
        this.screenShake = 0;
        this.shakeIntensity = 0;
        
        // Background
        this.bgParticles = [];
        this.initBackgroundParticles();
    }
    
    resize() {
        // Fit to window with some padding
        const maxWidth = 1280;
        const maxHeight = 720;
        
        let width = Math.min(window.innerWidth - 20, maxWidth);
        let height = Math.min(window.innerHeight - 20, maxHeight);
        
        // Maintain aspect ratio
        const aspectRatio = maxWidth / maxHeight;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        
        // Update wave manager if exists
        if (this.waveManager) {
            this.waveManager.canvasWidth = width;
            this.waveManager.canvasHeight = height;
        }
    }
    
    initBackgroundParticles() {
        this.bgParticles = [];
        const character = getSelectedCharacter();
        const theme = character?.levelTheme || {};
        const particleType = theme.particleType || 'ash';
        const particleCount = particleType === 'code' ? 30 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: Utils.random(0, this.width || 1280),
                y: Utils.random(0, this.height || 720),
                size: Utils.random(1, 3),
                speed: Utils.random(0.2, 0.5),
                opacity: Utils.random(0.1, 0.4)
            };
            
            // Customize based on particle type
            switch (particleType) {
                case 'void':
                    particle.size = Utils.random(1, 4);
                    particle.speed = Utils.random(0.1, 0.3);
                    particle.driftX = Utils.random(-0.3, 0.3);
                    particle.pulse = Utils.random(0, Math.PI * 2);
                    break;
                case 'flames':
                    particle.size = Utils.random(2, 5);
                    particle.speed = Utils.random(0.5, 1.2);
                    particle.flicker = Utils.random(0.5, 1);
                    particle.driftX = Utils.random(-0.5, 0.5);
                    break;
                case 'sparkles':
                    particle.size = Utils.random(1, 3);
                    particle.speed = Utils.random(0.3, 0.8);
                    particle.hue = Utils.random(0, 360);
                    particle.twinkle = Utils.random(0, Math.PI * 2);
                    break;
                case 'code':
                    particle.char = String.fromCharCode(Utils.randomInt(33, 126));
                    particle.size = Utils.randomInt(8, 14);
                    particle.speed = Utils.random(1, 3);
                    particle.opacity = Utils.random(0.3, 0.8);
                    break;
                case 'dust':
                    particle.size = Utils.random(1, 2);
                    particle.speed = Utils.random(0.1, 0.3);
                    particle.driftX = Utils.random(-0.2, 0.2);
                    break;
            }
            
            this.bgParticles.push(particle);
        }
        
        // Initialize decorations
        this.decorations = [];
        this.initDecorations(theme);
    }
    
    initDecorations(theme) {
        this.decorations = [];
        const decorationType = theme.decorations || 'none';
        const w = this.width || 1280;
        const h = this.height || 720;
        
        switch (decorationType) {
            case 'gravestones':
                // Scattered gravestones around the edges (avoid center play area)
                for (let i = 0; i < 12; i++) {
                    // Place near edges
                    let x, y;
                    if (Math.random() > 0.5) {
                        x = Math.random() > 0.5 ? Utils.random(30, 120) : Utils.random(w - 120, w - 30);
                        y = Utils.random(50, h - 50);
                    } else {
                        x = Utils.random(50, w - 50);
                        y = Math.random() > 0.5 ? Utils.random(30, 100) : Utils.random(h - 100, h - 30);
                    }
                    this.decorations.push({
                        type: 'gravestone',
                        x: x, y: y,
                        variant: Utils.randomInt(0, 3),
                        size: Utils.random(0.7, 1.1)
                    });
                }
                // Add some skulls scattered around
                for (let i = 0; i < 6; i++) {
                    this.decorations.push({
                        type: 'skull',
                        x: Utils.random(50, w - 50),
                        y: Utils.random(50, h - 50),
                        rotation: Utils.random(-0.3, 0.3)
                    });
                }
                // Dead trees at edges
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'deadtree',
                        x: Math.random() > 0.5 ? Utils.random(20, 80) : Utils.random(w - 80, w - 20),
                        y: Utils.random(80, h - 80)
                    });
                }
                break;
                
            case 'cobwebs':
                // Cobwebs in corners
                this.decorations.push({ type: 'cobweb', corner: 'tl' });
                this.decorations.push({ type: 'cobweb', corner: 'tr' });
                this.decorations.push({ type: 'cobweb', corner: 'bl' });
                this.decorations.push({ type: 'cobweb', corner: 'br' });
                // Old portraits on walls
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'portrait',
                        x: Utils.random(100, w - 100),
                        y: Utils.random(40, 100),
                        variant: Utils.randomInt(0, 2)
                    });
                }
                // Candelabras
                for (let i = 0; i < 5; i++) {
                    this.decorations.push({
                        type: 'candelabra',
                        x: Utils.random(60, w - 60),
                        y: Utils.random(60, h - 60),
                        flicker: Utils.random(0, Math.PI * 2)
                    });
                }
                // Rocking chairs
                for (let i = 0; i < 3; i++) {
                    this.decorations.push({
                        type: 'rockingchair',
                        x: Math.random() > 0.5 ? Utils.random(30, 100) : Utils.random(w - 100, w - 30),
                        y: Utils.random(200, h - 100),
                        phase: Utils.random(0, Math.PI * 2)
                    });
                }
                break;
                
            case 'tears':
                // Floating tear drops
                for (let i = 0; i < 8; i++) {
                    this.decorations.push({
                        type: 'tear',
                        x: Utils.random(80, w - 80),
                        y: Utils.random(80, h - 80),
                        phase: Utils.random(0, Math.PI * 2)
                    });
                }
                // Broken hearts
                for (let i = 0; i < 5; i++) {
                    this.decorations.push({
                        type: 'brokenheart',
                        x: Utils.random(60, w - 60),
                        y: Utils.random(60, h - 60),
                        phase: Utils.random(0, Math.PI * 2)
                    });
                }
                // Sad poetry fragments
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'poem',
                        x: Utils.random(50, w - 150),
                        y: Utils.random(50, h - 50)
                    });
                }
                break;
                
            case 'flames':
                // Kitchen-themed decorations instead of floor flames
                // Pots and pans scattered around edges
                for (let i = 0; i < 6; i++) {
                    this.decorations.push({
                        type: 'kitchenitem',
                        x: Math.random() > 0.5 ? Utils.random(30, 100) : Utils.random(w - 100, w - 30),
                        y: Utils.random(100, h - 50),
                        variant: Utils.randomInt(0, 3)
                    });
                }
                // Meat hooks
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'meathook',
                        x: Utils.random(100, w - 100),
                        y: Utils.random(30, 80)
                    });
                }
                // Cutting boards with... stuff
                for (let i = 0; i < 3; i++) {
                    this.decorations.push({
                        type: 'cuttingboard',
                        x: Utils.random(80, w - 80),
                        y: Utils.random(100, h - 100)
                    });
                }
                break;
                
            case 'discoball':
                // Central disco ball
                this.decorations.push({
                    type: 'discoball',
                    x: w / 2,
                    y: 60,
                    rotation: 0
                });
                // Speakers at corners
                this.decorations.push({ type: 'speaker', x: 40, y: h - 60 });
                this.decorations.push({ type: 'speaker', x: w - 40, y: h - 60 });
                // Dance floor spotlights
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'spotlight',
                        x: Utils.random(100, w - 100),
                        y: Utils.random(100, h - 100),
                        hue: Utils.random(0, 360),
                        phase: Utils.random(0, Math.PI * 2)
                    });
                }
                // Music notes floating
                for (let i = 0; i < 6; i++) {
                    this.decorations.push({
                        type: 'musicnote',
                        x: Utils.random(50, w - 50),
                        y: Utils.random(100, h - 50),
                        phase: Utils.random(0, Math.PI * 2)
                    });
                }
                break;
                
            case 'binary':
                // Binary code columns
                for (let i = 0; i < 6; i++) {
                    this.decorations.push({
                        type: 'binarycolumn',
                        x: Utils.random(30, w - 30),
                        offset: Utils.random(0, 100)
                    });
                }
                // Computer terminals
                for (let i = 0; i < 4; i++) {
                    this.decorations.push({
                        type: 'terminal',
                        x: Math.random() > 0.5 ? Utils.random(30, 100) : Utils.random(w - 100, w - 30),
                        y: Utils.random(100, h - 100)
                    });
                }
                // Circuit nodes
                for (let i = 0; i < 8; i++) {
                    this.decorations.push({
                        type: 'circuitnode',
                        x: Utils.random(50, w - 50),
                        y: Utils.random(50, h - 50),
                        pulse: Utils.random(0, Math.PI * 2)
                    });
                }
                // Error popups
                for (let i = 0; i < 3; i++) {
                    this.decorations.push({
                        type: 'errorpopup',
                        x: Utils.random(80, w - 150),
                        y: Utils.random(80, h - 80)
                    });
                }
                break;
        }
    }
    
    init() {
        // Get selected character
        const character = getSelectedCharacter();
        
        // Initialize player with character
        this.player = new Player(this.width / 2, this.height / 2, character);
        this.player.addWeapon(character.startingWeapon); // Character's starting weapon
        
        // Initialize managers with character's bosses
        this.waveManager = new WaveManager(this.width, this.height, character.bosses);
        this.upgradeManager = new UpgradeManager();
        
        // Reset arrays
        this.enemies = [];
        this.projectiles = [];
        this.xpGems = [];
        this.particles.clear();
        
        // Reset boss state
        this.currentBoss = null;
        this.bossSpawned = false;
        this.bossWarningShown = false;
        this.pendingNextWave = 0;
        
        // Re-initialize background for character theme
        this.initBackgroundParticles();
        
        // Initialize weapon display with 4 fixed slots
        const weaponDisplay = document.getElementById('weapon-display');
        if (weaponDisplay) {
            weaponDisplay.innerHTML = '';
            for (let i = 0; i < this.player.maxWeapons; i++) {
                const slot = document.createElement('div');
                slot.className = 'weapon-icon empty';
                slot.dataset.slot = String(i);
                weaponDisplay.appendChild(slot);
            }
        }
        
        // Update HUD immediately to show starting weapon
        this.updateHUD();
        
        // Start first wave
        this.startWave(1);
    }
    
    startWave(waveNumber) {
        this.waveManager.startWave(waveNumber);
        this.bossSpawned = false;
        this.bossWarningShown = false;
        this.currentBoss = null;
        
        // Show wave announcement
        this.showingWaveAnnouncement = true;
        this.waveAnnouncement = Utils.randomFrom(WAVE_ANNOUNCEMENTS);
        this.waveStartTimer = 2000;
        
        // Spawn boss at start of boss waves (5, 10, 15, 20)
        // Wait for wave announcement to finish (2000ms) before showing boss warning
        if (this.waveManager.bossWave) {
            setTimeout(() => {
                if (this.state === 'playing' && !this.bossWarningShown) {
                    this.showBossWarning();
                    // Spawn boss after warning displays
                    setTimeout(() => {
                        if (this.state === 'playing' && !this.bossSpawned) {
                            this.spawnBoss();
                        }
                    }, 1500);
                }
            }, 2200); // Wait for wave text to disappear (2000ms) + small buffer
        }
        
        // Update HUD
        this.updateHUD();
    }
    
    showUpgradeScreen() {
        this.state = 'upgrading';
        
        // Reset player keys to prevent stuck movement
        this.player.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Lower music volume during upgrade selection
        Audio.setMusicVolume(0.15);
        
        const upgradeScreen = document.getElementById('upgrade-screen');
        const choicesContainer = document.getElementById('upgrade-choices');
        
        // Update level display
        const levelDisplay = document.getElementById('player-level');
        if (levelDisplay) {
            levelDisplay.textContent = `LEVEL ${this.player.level}`;
        }
        
        // Clear previous choices
        choicesContainer.innerHTML = '';
        
        // Generate new choices
        const choices = this.upgradeManager.generateChoices(this.player, 3);
        
        // Create cards
        for (const choice of choices) {
            const card = this.upgradeManager.createChoiceCard(choice, (selectedChoice) => {
                this.selectUpgrade(selectedChoice);
            });
            choicesContainer.appendChild(card);
        }
        
        // Show screen
        document.getElementById('game-screen').classList.add('hidden');
        upgradeScreen.classList.remove('hidden');
        
        Audio.playLevelUp();
    }
    
    selectUpgrade(choice) {
        // Apply the upgrade
        this.upgradeManager.applyChoice(this.player, choice);
        
        // Immediately update HUD to show new weapon/upgrade
        this.updateHUD();
        
        // Hide upgrade screen
        document.getElementById('upgrade-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Restore music volume
        Audio.setMusicVolume(0.4);
        
        // Resume playing
        this.state = 'playing';
        
        // Start pending wave if there is one (player leveled up during wave transition)
        if (this.pendingNextWave > 0) {
            const waveToStart = this.pendingNextWave;
            this.pendingNextWave = 0;
            this.startWave(waveToStart);
        }
    }
    
    showBossWarning() {
        this.bossWarningShown = true;
        this.bossWarningTimer = 3000;
        
        const warning = document.getElementById('boss-warning');
        const bossName = warning.querySelector('.boss-name');
        bossName.textContent = BOSS_TYPES[this.waveManager.getBossType()].name;
        warning.classList.remove('hidden');
        
        Audio.playBossWarning();
    }
    
    hideBossWarning() {
        document.getElementById('boss-warning').classList.add('hidden');
    }
    
    spawnBoss() {
        this.currentBoss = this.waveManager.spawnBoss(this.player.x, this.player.y);
        this.enemies.push(this.currentBoss);
        this.bossSpawned = true;
    }
    
    update(deltaTime) {
        if (this.state !== 'playing') return;
        
        this.gameTime += deltaTime;
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake -= deltaTime;
        }
        
        // Update wave start announcement
        if (this.showingWaveAnnouncement) {
            this.waveStartTimer -= deltaTime;
            if (this.waveStartTimer <= 0) {
                this.showingWaveAnnouncement = false;
            }
        }
        
        // Update boss warning
        if (this.bossWarningTimer > 0) {
            this.bossWarningTimer -= deltaTime;
            if (this.bossWarningTimer <= 0) {
                this.hideBossWarning();
                if (this.waveManager.bossWave && !this.bossSpawned) {
                    this.spawnBoss();
                }
            }
        }
        
        // Update player
        this.player.update(deltaTime, this.width, this.height);
        
        // Fire weapons
        const newProjectiles = this.player.fireWeapons(this.gameTime, this.enemies);
        this.projectiles.push(...newProjectiles);
        
        // Update turrets (they fire independently)
        const turretProjectiles = this.player.updateTurrets(deltaTime, this.gameTime, this.enemies);
        this.projectiles.push(...turretProjectiles);
        
        // Spawn enemies
        if (this.waveManager.waveInProgress && this.waveManager.enemiesToSpawn > 0) {
            this.waveManager.spawnTimer += deltaTime;
            if (this.waveManager.spawnTimer >= this.waveManager.spawnInterval) {
                this.waveManager.spawnTimer = 0;
                const enemy = this.waveManager.spawnEnemy(this.player.x, this.player.y);
                if (enemy) {
                    this.enemies.push(enemy);
                }
            }
        }
        
        // Boss warning is now shown at wave start for boss waves
        // (Old code: waited until enemies cleared)
        
        // Update enemies
        let totalPullX = 0, totalPullY = 0;
        const clonesToSpawn = [];
        const poisonKills = [];
        
        for (const enemy of this.enemies) {
            const updateResult = enemy.update(deltaTime, this.player.x, this.player.y, this.width, this.height);
            
            // Check if enemy was killed by poison
            if (updateResult && updateResult.killedByPoison) {
                poisonKills.push(enemy);
            }
            
            // Void walker pull effect
            if (enemy.pullsPlayer && !enemy.isDying) {
                const pull = enemy.getPullEffect(this.player.x, this.player.y);
                totalPullX += pull.x;
                totalPullY += pull.y;
            }
            
            // Doppelganger clone spawning
            if (enemy.shouldSpawnClone) {
                enemy.shouldSpawnClone = false;
                clonesToSpawn.push({
                    x: enemy.x + Utils.random(-30, 30),
                    y: enemy.y + Utils.random(-30, 30),
                    type: enemy.data.id.toUpperCase()
                });
            }
            
            // Check collision with player
            if (!enemy.isDying && !enemy.isPhased) {
                const dist = Utils.distance(this.player.x, this.player.y, enemy.x, enemy.y);
                if (dist < this.player.size / 2 + enemy.size / 2) {
                    const dead = this.player.takeDamage(enemy.damage);
                    this.particles.damageFlash(this.player.x, this.player.y);
                    this.shakeScreen(10, 200);
                    
                    if (dead) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }
        
        // Apply pull effect to player
        if (totalPullX !== 0 || totalPullY !== 0) {
            this.player.x += totalPullX;
            this.player.y += totalPullY;
            // Keep player in bounds
            this.player.x = Utils.clamp(this.player.x, this.player.size, this.width - this.player.size);
            this.player.y = Utils.clamp(this.player.y, this.player.size, this.height - this.player.size);
        }
        
        // Handle poison kills
        for (const enemy of poisonKills) {
            this.handleEnemyDeath(enemy);
        }
        
        // Spawn doppelganger clones
        for (const clone of clonesToSpawn) {
            const cloneEnemy = new Enemy(clone.x, clone.y, 'DOPPELGANGER', this.waveManager.getWaveMultiplier() * 0.6);
            cloneEnemy.clonesOnHit = false; // Clones don't clone
            cloneEnemy.maxClones = 0;
            cloneEnemy.health = cloneEnemy.maxHealth * 0.5;
            this.enemies.push(cloneEnemy);
            this.waveManager.enemiesRemaining++;
        }
        
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            const alive = proj.update(deltaTime, this.enemies, this.player.x, this.player.y);
            
            // Check if out of bounds (except puddles which are stationary)
            if (proj.pattern !== 'puddle' && proj.pattern !== 'wave' &&
                (proj.x < -50 || proj.x > this.width + 50 ||
                proj.y < -50 || proj.y > this.height + 50)) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            if (!alive) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Special handling for wave pattern (cone attack)
            if (proj.pattern === 'wave') {
                for (const enemy of this.enemies) {
                    if (enemy.isDying || enemy.isPhased) continue;
                    if (proj.waveDamaged.has(enemy.id)) continue;
                    
                    const dist = Utils.distance(proj.x, proj.y, enemy.x, enemy.y);
                    const enemyAngle = Utils.angle(proj.x, proj.y, enemy.x, enemy.y);
                    const angleDiff = Math.abs(Utils.normalizeAngle(enemyAngle) - Utils.normalizeAngle(proj.angle));
                    const waveProgress = proj.lifetime / 200;
                    const currentRange = proj.waveRange * waveProgress;
                    
                    if (dist < currentRange && (angleDiff < proj.waveAngle/2 || angleDiff > Math.PI * 2 - proj.waveAngle/2)) {
                        const killed = enemy.takeDamage(proj.damage);
                        proj.waveDamaged.add(enemy.id);
                        this.particles.bloodSplatter(enemy.x, enemy.y, 3);
                        if (killed) this.handleEnemyDeath(enemy);
                    }
                }
                continue; // Wave doesn't use normal collision
            }
            
            // Special handling for puddle pattern (continuous damage)
            if (proj.pattern === 'puddle') {
                if (proj.lifetime - proj.lastPuddleTick >= proj.puddleTickRate) {
                    proj.lastPuddleTick = proj.lifetime;
                    for (const enemy of this.enemies) {
                        if (enemy.isDying || enemy.isPhased) continue;
                        const dist = Utils.distance(proj.x, proj.y, enemy.x, enemy.y);
                        if (dist < proj.size) {
                            const killed = enemy.takeDamage(proj.damage);
                            this.particles.bloodSplatter(enemy.x, enemy.y, 2);
                            if (killed) this.handleEnemyDeath(enemy);
                        }
                    }
                }
                continue; // Puddle doesn't use normal collision
            }
            
            // Check collision with enemies
            for (const enemy of this.enemies) {
                if (enemy.isDying || enemy.isPhased) continue;
                
                // Skip if piercing/boomerang/spin and already hit this enemy recently
                if ((proj.piercing || proj.pattern === 'boomerang' || proj.pattern === 'spin') 
                    && proj.hitEnemies.has(enemy.id)) continue;
                
                const dist = Utils.distance(proj.x, proj.y, enemy.x, enemy.y);
                if (dist < proj.size + enemy.size / 2) {
                    const killed = enemy.takeDamage(proj.damage);
                    this.particles.bloodSplatter(enemy.x, enemy.y, 5);
                    
                    // Apply poison effect if this is a poison projectile
                    if (proj.pattern === 'poison' && proj.poisonDamage > 0 && proj.poisonDuration > 0) {
                        enemy.applyPoison(proj.poisonDamage, proj.poisonDuration);
                    }
                    
                    // Handle enemy death FIRST before processing projectile behavior
                    if (killed) {
                        this.handleEnemyDeath(enemy);
                    }
                    
                    if (proj.piercing || proj.pattern === 'boomerang' || proj.pattern === 'spin') {
                        proj.hitEnemies.add(enemy.id);
                        // Clear hit after a delay for boomerang/spin
                        if (proj.pattern === 'boomerang' || proj.pattern === 'spin') {
                            setTimeout(() => proj.hitEnemies.delete(enemy.id), 300);
                        }
                    } else if (proj.pattern === 'explosive') {
                        // Explosion!
                        this.handleExplosion(proj);
                        this.projectiles.splice(i, 1);
                        break;
                    } else if (proj.pattern === 'chain' && proj.chainsRemaining > 0) {
                        // Chain to another enemy
                        this.handleChain(proj, enemy);
                    } else {
                        // Normal projectile - remove and stop
                        this.projectiles.splice(i, 1);
                        break;
                    }
                }
            }
        }
        
        // Check orbit weapon collisions
        for (const weapon of this.player.weapons) {
            if (weapon.data.pattern !== 'orbit') continue;
            
            for (const orb of weapon.orbitProjectiles) {
                for (const enemy of this.enemies) {
                    if (enemy.isDying || enemy.isPhased) continue;
                    if (!orb.canHit(enemy.id)) continue;
                    
                    const dist = Utils.distance(orb.x, orb.y, enemy.x, enemy.y);
                    if (dist < orb.size + enemy.size / 2) {
                        const killed = enemy.takeDamage(orb.damage);
                        orb.registerHit(enemy.id);
                        this.particles.bloodSplatter(enemy.x, enemy.y, 3);
                        
                        if (killed) {
                            this.handleEnemyDeath(enemy);
                        }
                    }
                }
            }
        }
        
        // Clean up dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.enemies[i].isDead) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Update XP gems
        for (let i = this.xpGems.length - 1; i >= 0; i--) {
            const gem = this.xpGems[i];
            gem.update(deltaTime, this.player.x, this.player.y, this.player.pickupRange);
            
            if (gem.collected) {
                const leveledUp = this.player.addXP(gem.value);
                this.particles.xpSparkle(gem.x, gem.y);
                Audio.playPickup();
                this.xpGems.splice(i, 1);
                
                // Show upgrade screen on level up!
                if (leveledUp) {
                    this.particles.levelUpBurst(this.player.x, this.player.y);
                    this.showUpgradeScreen();
                    return; // Stop updating while upgrade screen is shown
                }
            }
        }
        
        // Update particles
        this.particles.update(deltaTime);
        
        // Update background particles based on theme
        const character = getSelectedCharacter();
        const particleType = character?.levelTheme?.particleType || 'ash';
        
        for (const p of this.bgParticles) {
            switch (particleType) {
                case 'void':
                    // Slow drift with pulsing
                    p.y += p.speed * 0.5;
                    p.x += p.driftX || 0;
                    p.pulse = (p.pulse || 0) + deltaTime;
                    if (p.y > this.height) { p.y = 0; p.x = Utils.random(0, this.width); }
                    if (p.x < 0) p.x = this.width;
                    if (p.x > this.width) p.x = 0;
                    break;
                    
                case 'flames':
                    // Rise upward with flickering
                    p.y -= p.speed;
                    p.x += (p.driftX || 0) * Math.sin(this.gameTime * 5 + p.x);
                    if (p.y < 0) { 
                        p.y = this.height; 
                        p.x = Utils.random(0, this.width);
                    }
                    break;
                    
                case 'sparkles':
                    // Very slow drift with gentle twinkling
                    p.y += p.speed * 0.15;
                    p.twinkle = (p.twinkle || 0) + deltaTime * 0.8; // Much slower twinkle
                    p.hue = (p.hue + deltaTime * 5) % 360; // Much slower color shift
                    if (p.y > this.height) { p.y = 0; p.x = Utils.random(0, this.width); }
                    break;
                    
                case 'code':
                    // Fast falling code characters
                    p.y += p.speed * 2;
                    if (p.y > this.height) { 
                        p.y = 0; 
                        p.x = Utils.random(0, this.width);
                        p.char = String.fromCharCode(Utils.randomInt(33, 126));
                    }
                    break;
                    
                case 'dust':
                    // Gentle floating
                    p.y += p.speed;
                    p.x += (p.driftX || 0) * Math.sin(this.gameTime + p.y * 0.01);
                    if (p.y > this.height) { p.y = 0; p.x = Utils.random(0, this.width); }
                    break;
                    
                default: // 'ash'
                    p.y += p.speed;
                    if (p.y > this.height) { p.y = 0; p.x = Utils.random(0, this.width); }
            }
        }
        
        // Check wave completion (only if wave is still in progress)
        if (this.waveManager.waveInProgress && this.waveManager.isWaveComplete()) {
            this.waveManager.endWave();
            // Check for victory
            if (this.waveManager.isGameWon()) {
                this.victory();
                return;
            }
            
            // Schedule next wave
            const nextWave = this.waveManager.currentWave + 1;
            this.pendingNextWave = nextWave;
            
            // Auto-start next wave after short delay
            setTimeout(() => {
                // Only start if we're playing AND this wave is still pending
                if (this.state === 'playing' && this.pendingNextWave === nextWave) {
                    this.pendingNextWave = 0;
                    this.startWave(nextWave);
                }
            }, 2000);
        }
        
        // Update HUD
        this.updateHUD();
    }
    
    handleExplosion(proj) {
        this.particles.explosion(proj.x, proj.y, proj.explosionRadius, proj.color);
        this.shakeScreen(8, 150);
        Audio.playDeath();
        
        // Damage all enemies in radius
        for (const enemy of this.enemies) {
            if (enemy.isDying) continue;
            
            const dist = Utils.distance(proj.x, proj.y, enemy.x, enemy.y);
            if (dist < proj.explosionRadius) {
                const killed = enemy.takeDamage(proj.damage);
                if (killed) {
                    this.handleEnemyDeath(enemy);
                }
            }
        }
    }
    
    handleChain(proj, hitEnemy) {
        // Find next closest enemy
        let nearestEnemy = null;
        let nearestDist = proj.chainRange;
        
        for (const enemy of this.enemies) {
            if (enemy === hitEnemy || enemy.isDying || proj.hitEnemies.has(enemy.id)) continue;
            
            const dist = Utils.distance(hitEnemy.x, hitEnemy.y, enemy.x, enemy.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        }
        
        if (nearestEnemy) {
            // Create chain effect
            this.particles.chainLightning(hitEnemy.x, hitEnemy.y, nearestEnemy.x, nearestEnemy.y, proj.color);
            
            // Update projectile to target new enemy
            proj.x = hitEnemy.x;
            proj.y = hitEnemy.y;
            proj.hitEnemies.add(hitEnemy.id);
            proj.chainsRemaining--;
            
            const angle = Utils.angle(hitEnemy.x, hitEnemy.y, nearestEnemy.x, nearestEnemy.y);
            proj.vx = Math.cos(angle) * proj.speed;
            proj.vy = Math.sin(angle) * proj.speed;
        }
    }
    
    handleEnemyDeath(enemy) {
        this.waveManager.enemyDied(enemy);
        
        // Spawn XP gem
        const gem = new XPGem(enemy.x, enemy.y, enemy.xpValue);
        this.xpGems.push(gem);
        
        // Gore explosion
        if (enemy.isBoss) {
            this.particles.bossExplosion(enemy.x, enemy.y);
            this.shakeScreen(20, 500);
        } else {
            this.particles.goreExplosion(enemy.x, enemy.y);
            this.shakeScreen(5, 100);
        }
        
        // Handle blob split
        if (enemy.splitsOnDeath && enemy.size > 10) {
            for (let i = 0; i < 2; i++) {
                const angle = Utils.random(0, Math.PI * 2);
                const dist = 20;
                const splitEnemy = new Enemy(
                    enemy.x + Math.cos(angle) * dist,
                    enemy.y + Math.sin(angle) * dist,
                    'BLOB',
                    this.waveManager.getWaveMultiplier() * 0.5
                );
                splitEnemy.size = enemy.size / 2;
                splitEnemy.maxHealth = enemy.maxHealth / 2;
                splitEnemy.health = splitEnemy.maxHealth;
                splitEnemy.xpValue = Math.floor(enemy.xpValue / 2);
                splitEnemy.splitsOnDeath = false;
                this.enemies.push(splitEnemy);
                this.waveManager.enemiesRemaining++;
            }
        }
        
        // Handle bloater explosion
        if (enemy.shouldExplode) {
            Audio.playExplosion();
            this.particles.explosion(enemy.x, enemy.y, enemy.color);
            this.shakeScreen(15, 300);
            
            // Damage nearby enemies
            for (const otherEnemy of this.enemies) {
                if (otherEnemy === enemy || otherEnemy.isDying) continue;
                const dist = Utils.distance(enemy.x, enemy.y, otherEnemy.x, otherEnemy.y);
                if (dist < enemy.explosionRadius) {
                    const killed = otherEnemy.takeDamage(enemy.explosionDamage);
                    this.particles.bloodSplatter(otherEnemy.x, otherEnemy.y, 3);
                    if (killed) {
                        this.handleEnemyDeath(otherEnemy);
                    }
                }
            }
            
            // Damage player if too close
            const playerDist = Utils.distance(enemy.x, enemy.y, this.player.x, this.player.y);
            if (playerDist < enemy.explosionRadius) {
                const dead = this.player.takeDamage(enemy.explosionDamage);
                this.particles.damageFlash(this.player.x, this.player.y);
                if (dead) {
                    this.gameOver();
                }
            }
        }
    }
    
    shakeScreen(intensity, duration) {
        // Check if screen shake is enabled in settings
        if (typeof GameSettings !== 'undefined' && !GameSettings.screenShake) {
            return; // Screen shake disabled
        }
        this.shakeIntensity = intensity;
        this.screenShake = duration;
    }
    
    updateHUD() {
        // Health bar
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = `${healthPercent}%`;
        document.getElementById('health-text').textContent = 
            `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        
        // XP bar and level
        const xpPercent = (this.player.currentXP / this.player.xpToNextLevel) * 100;
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = 
            `${this.player.currentXP}/${this.player.xpToNextLevel}`;
        document.getElementById('hud-level').textContent = this.player.level;
        
        // Wave info
        document.getElementById('wave-text').textContent = 
            `WAVE ${this.waveManager.currentWave}`;
        document.getElementById('kill-count').textContent = 
            `KILLS: ${this.waveManager.totalKills}`;
        
        // Weapon display - always show 4 fixed slots
        const weaponDisplay = document.getElementById('weapon-display');
        const tooltip = document.getElementById('weapon-tooltip');
        const maxSlots = this.player.maxWeapons; // 4 slots
        
        // Get valid weapons only
        const validWeapons = this.player.weapons.filter(w => w && w.data);
        
        // Create 4 fixed slots if not already present
        if (weaponDisplay.children.length !== maxSlots) {
            weaponDisplay.innerHTML = '';
            for (let i = 0; i < maxSlots; i++) {
                const slot = document.createElement('div');
                slot.className = 'weapon-icon empty';
                slot.dataset.slot = String(i);
                weaponDisplay.appendChild(slot);
            }
        }
        
        // Update each slot
        for (let i = 0; i < maxSlots; i++) {
            const slot = weaponDisplay.children[i];
            const weapon = validWeapons[i];
            
            if (weapon) {
                // Slot has a weapon
                slot.className = 'weapon-icon';
                slot.textContent = weapon.data.icon || '?';
                slot.dataset.level = String(weapon.level);
                slot.dataset.weaponType = weapon.type;
                
                // Add tooltip handlers
                const weaponData = weapon.data;
                slot.onmouseenter = () => {
                    if (tooltip && weaponData) {
                        const currentWeapon = this.player.weapons.find(w => w && w.type === slot.dataset.weaponType);
                        const level = currentWeapon ? currentWeapon.level : 1;
                        tooltip.querySelector('.tooltip-name').textContent = 
                            `${weaponData.icon || ''} ${weaponData.name || 'Unknown'}`;
                        tooltip.querySelector('.tooltip-level').textContent = 
                            `Level ${level} / ${weaponData.maxLevel || 5}`;
                        tooltip.querySelector('.tooltip-desc').textContent = 
                            weaponData.description || '';
                        tooltip.classList.remove('hidden');
                    }
                };
                slot.onmouseleave = () => {
                    if (tooltip) tooltip.classList.add('hidden');
                };
            } else {
                // Empty slot
                slot.className = 'weapon-icon empty';
                slot.textContent = '';
                slot.dataset.level = '';
                slot.dataset.weaponType = '';
                slot.onmouseenter = null;
                slot.onmouseleave = null;
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        const character = getSelectedCharacter();
        const theme = character?.levelTheme || {};
        
        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0) {
            const shakeX = Utils.random(-this.shakeIntensity, this.shakeIntensity);
            const shakeY = Utils.random(-this.shakeIntensity, this.shakeIntensity);
            ctx.translate(shakeX, shakeY);
        }
        
        // Draw themed background
        this.drawThemedBackground(ctx, theme);
        
        // Draw themed particles
        this.drawThemedParticles(ctx, theme);
        
        // Draw grid pattern based on theme
        this.drawThemedGrid(ctx, theme);
        
        // Draw decorations (behind entities)
        this.drawDecorations(ctx, theme);
        
        // Draw XP gems
        for (const gem of this.xpGems) {
            gem.draw(ctx);
        }
        
        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
        
        // Draw projectiles
        for (const proj of this.projectiles) {
            proj.draw(ctx);
        }
        
        // Draw player
        this.player.draw(ctx);
        
        // Draw particles (on top)
        this.particles.draw(ctx);
        
        // Draw wave announcement
        if (this.showingWaveAnnouncement) {
            ctx.save();
            ctx.font = '24px "Press Start 2P"';
            ctx.fillStyle = '#FF4500';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FF4500';
            ctx.shadowBlur = 20;
            
            // Wave number
            ctx.fillText(`WAVE ${this.waveManager.currentWave}`, this.width / 2, this.height / 2 - 30);
            
            // Quip
            ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = '#FFF';
            ctx.shadowBlur = 0;
            ctx.fillText(this.waveAnnouncement, this.width / 2, this.height / 2 + 20);
            
            ctx.restore();
        }
        
        // Draw boss health bar if active
        if (this.currentBoss && !this.currentBoss.isDying) {
            this.drawBossHealthBar(ctx);
        }
        
        ctx.restore();
    }
    
    drawBossHealthBar(ctx) {
        const barWidth = 400;
        const barHeight = 20;
        const x = (this.width - barWidth) / 2;
        const y = this.height - 50;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.currentBoss.health / this.currentBoss.maxHealth;
        ctx.fillStyle = '#DC143C';
        ctx.shadowColor = '#DC143C';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        ctx.shadowBlur = 0;
        
        // Border
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Name
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentBoss.data.name, this.width / 2, y - 10);
    }
    
    drawThemedBackground(ctx, theme) {
        const bgColor = theme.bgColor || '#0A0A0A';
        const gradient = theme.bgGradient;
        
        if (gradient && gradient.length >= 2) {
            const grd = ctx.createRadialGradient(
                this.width / 2, this.height / 2, 0,
                this.width / 2, this.height / 2, Math.max(this.width, this.height)
            );
            grd.addColorStop(0, gradient[0]);
            grd.addColorStop(1, gradient[1]);
            ctx.fillStyle = grd;
        } else {
            ctx.fillStyle = bgColor;
        }
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Ambient glow in center
        if (theme.ambientGlow) {
            const glowGrd = ctx.createRadialGradient(
                this.width / 2, this.height / 2, 0,
                this.width / 2, this.height / 2, 300
            );
            glowGrd.addColorStop(0, theme.ambientGlow);
            glowGrd.addColorStop(1, 'transparent');
            ctx.fillStyle = glowGrd;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    drawThemedParticles(ctx, theme) {
        const particleType = theme.particleType || 'ash';
        const particleColor = theme.particleColor || '#333';
        
        for (const p of this.bgParticles) {
            ctx.globalAlpha = p.opacity;
            
            switch (particleType) {
                case 'void':
                    // Pulsing void particles
                    const pulse = Math.sin(p.pulse + this.gameTime * 2) * 0.3 + 0.7;
                    ctx.fillStyle = particleColor;
                    ctx.globalAlpha = p.opacity * pulse;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'flames':
                    // Flickering flame particles
                    const flicker = Math.random() * p.flicker;
                    ctx.fillStyle = `hsl(${20 + flicker * 20}, 100%, ${50 + flicker * 30}%)`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.size, p.y + p.size * 2);
                    ctx.lineTo(p.x + p.size, p.y + p.size * 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'sparkles':
                    // Gentle, slow-twinkling sparkles (safe for photosensitivity)
                    const twinkle = Math.sin(p.twinkle + this.gameTime * 0.4) * 0.3 + 0.7; // Much slower, less variation
                    ctx.fillStyle = `hsl(${p.hue}, 70%, 65%)`; // Less saturated
                    ctx.globalAlpha = p.opacity * twinkle * 0.7; // Dimmer
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (twinkle * 0.5 + 0.5), 0, Math.PI * 2);
                    ctx.fill();
                    // Sparkle rays only at peak (rare)
                    if (twinkle > 0.9) {
                        ctx.strokeStyle = `hsl(${p.hue}, 60%, 70%)`;
                        ctx.lineWidth = 1;
                        ctx.globalAlpha = 0.3;
                        ctx.beginPath();
                        ctx.moveTo(p.x - p.size * 1.5, p.y);
                        ctx.lineTo(p.x + p.size * 1.5, p.y);
                        ctx.moveTo(p.x, p.y - p.size * 1.5);
                        ctx.lineTo(p.x, p.y + p.size * 1.5);
                        ctx.stroke();
                    }
                    break;
                    
                case 'code':
                    // Falling matrix-style code
                    ctx.font = `${p.size}px monospace`;
                    ctx.fillStyle = particleColor;
                    ctx.fillText(p.char, p.x, p.y);
                    break;
                    
                case 'dust':
                    // Gentle floating dust
                    ctx.fillStyle = particleColor;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                    break;
                    
                default: // 'ash'
                    ctx.fillStyle = particleColor;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        }
        ctx.globalAlpha = 1;
    }
    
    drawThemedGrid(ctx, theme) {
        const gridStyle = theme.gridStyle || 'normal';
        const gridColor = theme.gridColor || '#1a1a1a';
        const gridSize = 50;
        
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        switch (gridStyle) {
            case 'none':
                // No grid for void theme
                break;
                
            case 'checkered':
                // Checkered floor pattern (kitchen)
                ctx.globalAlpha = 0.1;
                for (let x = 0; x < this.width; x += gridSize) {
                    for (let y = 0; y < this.height; y += gridSize) {
                        if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
                            ctx.fillStyle = gridColor;
                            ctx.fillRect(x, y, gridSize, gridSize);
                        }
                    }
                }
                ctx.globalAlpha = 1;
                break;
                
            case 'wallpaper':
                // Victorian wallpaper pattern (mansion)
                ctx.globalAlpha = 0.15;
                for (let x = 0; x < this.width; x += gridSize) {
                    for (let y = 0; y < this.height; y += gridSize) {
                        ctx.strokeStyle = gridColor;
                        ctx.beginPath();
                        ctx.arc(x + gridSize/2, y + gridSize/2, 15, 0, Math.PI * 2);
                        ctx.stroke();
                        // Diamond pattern
                        ctx.beginPath();
                        ctx.moveTo(x + gridSize/2, y);
                        ctx.lineTo(x + gridSize, y + gridSize/2);
                        ctx.lineTo(x + gridSize/2, y + gridSize);
                        ctx.lineTo(x, y + gridSize/2);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                ctx.globalAlpha = 1;
                break;
                
            case 'disco':
                // Disco floor tiles - VERY slow, subtle color shifts (safe for photosensitivity)
                const time = this.gameTime;
                for (let x = 0; x < this.width; x += gridSize) {
                    for (let y = 0; y < this.height; y += gridSize) {
                        // Very slow hue shift - tiles have fixed base colors that rotate glacially
                        const tileIndex = Math.floor(x / gridSize) + Math.floor(y / gridSize);
                        const hue = (tileIndex * 40 + time * 1.5) % 360; // Ultra slow rotation
                        // Minimal brightness variation - almost static
                        const brightness = Math.sin(tileIndex * 0.5 + time * 0.08) * 3 + 18;
                        ctx.fillStyle = `hsl(${hue}, 35%, ${brightness}%)`;
                        ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                    }
                }
                break;
                
            case 'circuit':
                // Circuit board pattern (digital)
                ctx.strokeStyle = gridColor;
                ctx.lineWidth = 1;
                // Horizontal lines
                for (let y = 0; y < this.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    for (let x = 0; x < this.width; x += gridSize/2) {
                        const yOffset = (Math.floor(x / gridSize) % 2 === 0) ? 0 : (Math.random() > 0.7 ? 10 : 0);
                        ctx.lineTo(x, y + yOffset);
                    }
                    ctx.stroke();
                }
                // Connection nodes
                ctx.fillStyle = theme.accentColor || '#00FF00';
                ctx.globalAlpha = 0.3;
                for (let x = gridSize; x < this.width; x += gridSize * 2) {
                    for (let y = gridSize; y < this.height; y += gridSize * 2) {
                        ctx.beginPath();
                        ctx.arc(x, y, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                ctx.globalAlpha = 1;
                break;
                
            default: // 'normal'
                for (let x = 0; x < this.width; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, this.height);
                    ctx.stroke();
                }
                for (let y = 0; y < this.height; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(this.width, y);
                    ctx.stroke();
                }
        }
    }
    
    drawDecorations(ctx, theme) {
        if (!this.decorations) return;
        
        for (const dec of this.decorations) {
            switch (dec.type) {
                // Graveyard decorations
                case 'gravestone': this.drawGravestone(ctx, dec); break;
                case 'skull': this.drawSkull(ctx, dec); break;
                case 'deadtree': this.drawDeadTree(ctx, dec); break;
                // Mansion decorations
                case 'cobweb': this.drawCobweb(ctx, dec); break;
                case 'portrait': this.drawPortrait(ctx, dec); break;
                case 'candelabra': this.drawCandelabra(ctx, dec); break;
                case 'rockingchair': this.drawRockingChair(ctx, dec); break;
                // Void decorations
                case 'tear': this.drawTear(ctx, dec, theme); break;
                case 'brokenheart': this.drawBrokenHeart(ctx, dec, theme); break;
                case 'poem': this.drawPoem(ctx, dec); break;
                // Kitchen decorations
                case 'kitchenitem': this.drawKitchenItem(ctx, dec); break;
                case 'meathook': this.drawMeatHook(ctx, dec); break;
                case 'cuttingboard': this.drawCuttingBoard(ctx, dec); break;
                // Disco decorations
                case 'discoball': this.drawDiscoBall(ctx, dec); break;
                case 'speaker': this.drawSpeaker(ctx, dec); break;
                case 'spotlight': this.drawSpotlight(ctx, dec); break;
                case 'musicnote': this.drawMusicNote(ctx, dec); break;
                // Digital decorations
                case 'binarycolumn': this.drawBinaryColumn(ctx, dec, theme); break;
                case 'terminal': this.drawTerminal(ctx, dec, theme); break;
                case 'circuitnode': this.drawCircuitNode(ctx, dec, theme); break;
                case 'errorpopup': this.drawErrorPopup(ctx, dec); break;
            }
        }
    }
    
    // === GRAVEYARD DECORATIONS ===
    drawGravestone(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.scale(dec.size, dec.size);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#2a2a2a';
        
        switch (dec.variant) {
            case 0: // Classic rounded
                ctx.fillRect(-15, -30, 30, 35);
                ctx.beginPath();
                ctx.arc(0, -30, 15, Math.PI, 0);
                ctx.fill();
                break;
            case 1: // Cross
                ctx.fillRect(-5, -40, 10, 45);
                ctx.fillRect(-15, -30, 30, 8);
                break;
            case 2: // Simple
                ctx.fillRect(-12, -25, 24, 30);
                break;
            default: // Tilted broken
                ctx.rotate(0.15);
                ctx.fillRect(-15, -25, 25, 30);
        }
        ctx.restore();
    }
    
    drawSkull(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.rotate(dec.rotation);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#888';
        // Simple skull shape
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        // Jaw
        ctx.fillRect(-6, 5, 12, 5);
        // Eyes
        ctx.fillStyle = '#222';
        ctx.fillRect(-4, -2, 3, 3);
        ctx.fillRect(1, -2, 3, 3);
        ctx.restore();
    }
    
    drawDeadTree(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        // Trunk
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -60);
        ctx.stroke();
        // Branches
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-20, -50);
        ctx.moveTo(0, -40);
        ctx.lineTo(15, -55);
        ctx.moveTo(0, -50);
        ctx.lineTo(-12, -65);
        ctx.stroke();
        ctx.restore();
    }
    
    // === MANSION DECORATIONS ===
    drawCobweb(ctx, dec) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        
        let x, y, xDir, yDir;
        switch (dec.corner) {
            case 'tl': x = 0; y = 0; xDir = 1; yDir = 1; break;
            case 'tr': x = this.width; y = 0; xDir = -1; yDir = 1; break;
            case 'bl': x = 0; y = this.height; xDir = 1; yDir = -1; break;
            case 'br': x = this.width; y = this.height; xDir = -1; yDir = -1; break;
        }
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 80 * xDir, y + Math.sin(angle) * 80 * yDir);
            ctx.stroke();
        }
        for (let r = 20; r <= 60; r += 20) {
            ctx.beginPath();
            ctx.arc(x, y, r, xDir > 0 ? 0 : Math.PI, yDir > 0 ? Math.PI/2 : -Math.PI/2, xDir * yDir < 0);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    drawPortrait(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.2;
        // Frame
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(-18, -22, 36, 44);
        // Picture
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(-14, -18, 28, 36);
        // Face silhouette
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    drawCandelabra(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.25;
        // Base
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-3, 0, 6, 15);
        ctx.fillRect(-8, 12, 16, 4);
        // Candles
        ctx.fillStyle = '#ddd';
        ctx.fillRect(-2, -10, 4, 12);
        // Flame
        const flicker = Math.sin(dec.flicker + this.gameTime * 5) * 2;
        ctx.fillStyle = '#FF9900';
        ctx.globalAlpha = 0.4 + Math.sin(dec.flicker + this.gameTime * 8) * 0.1;
        ctx.beginPath();
        ctx.arc(0, -12 + flicker, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    drawRockingChair(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        const rock = Math.sin(dec.phase + this.gameTime * 1.5) * 0.1;
        ctx.rotate(rock);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#3a2a1a';
        // Seat
        ctx.fillRect(-12, 0, 24, 5);
        // Back
        ctx.fillRect(-10, -20, 3, 20);
        ctx.fillRect(7, -20, 3, 20);
        ctx.fillRect(-10, -20, 20, 3);
        // Rockers
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 15, 20, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.restore();
    }
    
    // === VOID DECORATIONS ===
    drawTear(ctx, dec, theme) {
        ctx.save();
        const float = Math.sin(dec.phase + this.gameTime * 2) * 5;
        ctx.translate(dec.x, dec.y + float);
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = theme.accentColor || '#8B008B';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.quadraticCurveTo(8, 0, 0, 15);
        ctx.quadraticCurveTo(-8, 0, 0, -10);
        ctx.fill();
        ctx.restore();
    }
    
    drawBrokenHeart(ctx, dec, theme) {
        ctx.save();
        const float = Math.sin(dec.phase + this.gameTime * 1.5) * 3;
        ctx.translate(dec.x, dec.y + float);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#8B0000';
        // Left half
        ctx.beginPath();
        ctx.arc(-6, -5, 8, Math.PI, 0);
        ctx.lineTo(-2, 15);
        ctx.lineTo(-6, 5);
        ctx.fill();
        // Right half (offset)
        ctx.translate(4, -3);
        ctx.beginPath();
        ctx.arc(6, -5, 8, Math.PI, 0);
        ctx.lineTo(2, 15);
        ctx.lineTo(6, 5);
        ctx.fill();
        ctx.restore();
    }
    
    drawPoem(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.1;
        ctx.font = '8px "Press Start 2P"';
        ctx.fillStyle = '#666';
        const lines = ['darkness...', 'pain...', 'nobody...', 'understands'];
        lines.forEach((line, i) => ctx.fillText(line, 0, i * 12));
        ctx.restore();
    }
    
    // === KITCHEN DECORATIONS ===
    drawKitchenItem(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.2;
        switch (dec.variant) {
            case 0: // Pot
                ctx.fillStyle = '#555';
                ctx.fillRect(-12, -5, 24, 15);
                ctx.fillRect(-15, -5, 30, 3);
                break;
            case 1: // Pan
                ctx.fillStyle = '#444';
                ctx.beginPath();
                ctx.arc(0, 0, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(12, -2, 15, 4);
                break;
            case 2: // Cleaver
                ctx.fillStyle = '#888';
                ctx.fillRect(-8, -15, 16, 20);
                ctx.fillStyle = '#5a3a2a';
                ctx.fillRect(-4, 5, 8, 12);
                break;
            default: // Plate
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.stroke();
        }
        ctx.restore();
    }
    
    drawMeatHook(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        // Chain
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 0);
        ctx.stroke();
        // Hook
        ctx.beginPath();
        ctx.arc(0, 10, 10, -Math.PI * 0.5, Math.PI * 0.8);
        ctx.stroke();
        ctx.restore();
    }
    
    drawCuttingBoard(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(-20, -12, 40, 24);
        // Blood stains
        ctx.fillStyle = '#600';
        ctx.beginPath();
        ctx.arc(5, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    // === DISCO DECORATIONS ===
    drawDiscoBall(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        dec.rotation += 0.001; // Very slow rotation
        
        // String
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(0, -dec.y);
        ctx.stroke();
        
        // Ball
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Facets (static, no animation)
        ctx.fillStyle = '#888';
        for (let i = 0; i < 8; i++) {
            const angle = dec.rotation + (i / 8) * Math.PI * 2;
            ctx.fillRect(Math.cos(angle) * 15 - 3, Math.sin(angle) * 15 - 3, 6, 6);
        }
        
        // Very subtle, slow light rays
        ctx.globalAlpha = 0.04; // Much dimmer
        for (let i = 0; i < 6; i++) {
            const angle = dec.rotation * 0.3 + (i / 6) * Math.PI * 2;
            const hue = (i * 60 + this.gameTime * 2) % 360; // Ultra slow color shift
            ctx.strokeStyle = `hsl(${hue}, 50%, 55%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * 400, Math.sin(angle) * 400);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    drawSpeaker(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#222';
        ctx.fillRect(-15, -20, 30, 40);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    drawSpotlight(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        const pulse = Math.sin(dec.phase + this.gameTime * 0.12) * 0.3 + 0.7; // Very slow, subtle pulse
        ctx.globalAlpha = 0.06 * pulse; // Dimmer
        const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
        grd.addColorStop(0, `hsl(${dec.hue}, 50%, 50%)`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    drawMusicNote(ctx, dec) {
        ctx.save();
        const float = Math.sin(dec.phase + this.gameTime * 0.5) * 5; // Slower float
        ctx.translate(dec.x, dec.y + float);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = '#CC9900'; // Slightly dimmer gold
        // Note head
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.fillRect(5, -20, 2, 20);
        // Flag
        ctx.beginPath();
        ctx.moveTo(7, -20);
        ctx.quadraticCurveTo(15, -15, 7, -10);
        ctx.fill();
        ctx.restore();
    }
    
    // === DIGITAL DECORATIONS ===
    drawBinaryColumn(ctx, dec, theme) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.font = '10px monospace';
        ctx.fillStyle = theme.accentColor || '#00FF00';
        const offset = (dec.offset + this.gameTime * 20) % 20;
        for (let y = -20 + offset; y < this.height; y += 18) {
            ctx.fillText(Math.random() > 0.5 ? '1' : '0', dec.x, y);
        }
        ctx.restore();
    }
    
    drawTerminal(ctx, dec, theme) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.2;
        // Monitor frame
        ctx.fillStyle = '#222';
        ctx.fillRect(-25, -20, 50, 35);
        // Screen
        ctx.fillStyle = '#001100';
        ctx.fillRect(-22, -17, 44, 29);
        // Text lines
        ctx.fillStyle = theme.accentColor || '#00FF00';
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 4; i++) {
            const width = Utils.random(15, 35);
            ctx.fillRect(-18, -13 + i * 7, width, 4);
        }
        ctx.restore();
    }
    
    drawCircuitNode(ctx, dec, theme) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        const pulse = Math.sin(dec.pulse + this.gameTime * 2) * 0.5 + 0.5;
        ctx.globalAlpha = 0.15 + pulse * 0.1;
        ctx.fillStyle = theme.accentColor || '#00FF00';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        // Connecting lines
        ctx.strokeStyle = theme.accentColor || '#00FF00';
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.stroke();
        ctx.restore();
    }
    
    drawErrorPopup(ctx, dec) {
        ctx.save();
        ctx.translate(dec.x, dec.y);
        ctx.globalAlpha = 0.15;
        // Window
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, 80, 40);
        // Title bar
        ctx.fillStyle = '#600';
        ctx.fillRect(0, 0, 80, 10);
        // X button
        ctx.fillStyle = '#a00';
        ctx.fillRect(70, 2, 8, 6);
        // Error text
        ctx.fillStyle = '#f00';
        ctx.font = '6px monospace';
        ctx.fillText('ERROR', 5, 22);
        ctx.fillStyle = '#888';
        ctx.fillText('404: Soul', 5, 32);
        ctx.restore();
    }
    
    gameOver() {
        this.state = 'gameover';
        
        // Stop the music
        Audio.stopMusic();
        Audio.playGameOver();
        
        // Update game over screen
        document.getElementById('final-waves').textContent = this.waveManager.currentWave;
        document.getElementById('final-kills').textContent = this.waveManager.totalKills;
        document.getElementById('final-xp').textContent = this.player.totalXP;
        
        // Random death quip
        const quip = Utils.randomFrom(DEATH_QUIPS);
        document.querySelector('.death-quip').textContent = `"${quip}"`;
        
        // Show game over screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    victory() {
        this.state = 'victory';
        
        // Stop the music
        Audio.stopMusic();
        Audio.playVictory();
        
        // Update victory screen
        document.getElementById('victory-waves').textContent = this.waveManager.currentWave;
        document.getElementById('victory-kills').textContent = this.waveManager.totalKills;
        document.getElementById('victory-xp').textContent = this.player.totalXP;
        
        // Show victory screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.remove('hidden');
    }
    
    pause() {
        if (this.state !== 'playing') return;
        
        this.state = 'paused';
        Audio.pauseMusic();
        
        // Show pause screen
        document.getElementById('pause-screen').classList.remove('hidden');
    }
    
    resume() {
        if (this.state !== 'paused') return;
        
        this.state = 'playing';
        this.lastTime = performance.now(); // Reset time to avoid jump
        Audio.resumeMusic();
        
        // Hide pause screen
        document.getElementById('pause-screen').classList.add('hidden');
    }
    
    togglePause() {
        if (this.state === 'playing') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }
    
    start() {
        this.state = 'playing';
        this.lastTime = performance.now();
        
        // Start the music
        Audio.playMusic('main');
        
        this.gameLoop(this.lastTime);
    }
    
    gameLoop(currentTime) {
        const deltaTime = Math.min(currentTime - this.lastTime, 50); // Cap delta
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

