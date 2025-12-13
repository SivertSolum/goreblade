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
        for (let i = 0; i < 50; i++) {
            this.bgParticles.push({
                x: Utils.random(0, this.width || 1280),
                y: Utils.random(0, this.height || 720),
                size: Utils.random(1, 3),
                speed: Utils.random(0.2, 0.5),
                opacity: Utils.random(0.1, 0.3)
            });
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
        
        // Update HUD
        this.updateHUD();
    }
    
    showUpgradeScreen() {
        this.state = 'upgrading';
        
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
        
        // Show boss warning
        if (this.waveManager.bossWave && !this.bossWarningShown && 
            this.waveManager.enemiesToSpawn <= 0 && this.enemies.length <= 3) {
            this.showBossWarning();
        }
        
        // Update enemies
        let totalPullX = 0, totalPullY = 0;
        const clonesToSpawn = [];
        
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.player.x, this.player.y, this.width, this.height);
            
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
        
        // Update background particles
        for (const p of this.bgParticles) {
            p.y += p.speed;
            if (p.y > this.height) {
                p.y = 0;
                p.x = Utils.random(0, this.width);
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
        
        // Weapon display - always update to ensure all weapons shown
        const weaponDisplay = document.getElementById('weapon-display');
        const tooltip = document.getElementById('weapon-tooltip');
        
        // Check if update needed
        const weaponCount = this.player.weapons.length;
        const displayCount = weaponDisplay.children.length;
        
        if (weaponCount !== displayCount) {
            weaponDisplay.innerHTML = '';
            
            for (let i = 0; i < this.player.weapons.length; i++) {
                const weapon = this.player.weapons[i];
                if (!weapon || !weapon.data) continue;
                
                const icon = document.createElement('div');
                icon.className = 'weapon-icon';
                icon.textContent = weapon.data.icon || '?';
                icon.dataset.level = String(weapon.level);
                icon.dataset.weaponType = weapon.type || '';
                icon.dataset.index = String(i);
                
                weaponDisplay.appendChild(icon);
            }
        }
        
        // Update tooltip handlers and levels (always)
        for (let i = 0; i < weaponDisplay.children.length; i++) {
            const icon = weaponDisplay.children[i];
            const weapon = this.player.weapons[i];
            if (!weapon || !weapon.data) continue;
            
            // Update level display if changed
            if (icon.dataset.level !== String(weapon.level)) {
                icon.dataset.level = String(weapon.level);
            }
            
            // Ensure tooltip handlers are set
            if (!icon.dataset.hasTooltip) {
                icon.dataset.hasTooltip = 'true';
                const weaponData = weapon.data;
                
                icon.onmouseenter = () => {
                    if (tooltip && weaponData) {
                        const currentWeapon = this.player.weapons[parseInt(icon.dataset.index)];
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
                
                icon.onmouseleave = () => {
                    if (tooltip) {
                        tooltip.classList.add('hidden');
                    }
                };
            }
        }
    }
    
    draw() {
        const ctx = this.ctx;
        
        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0) {
            const shakeX = Utils.random(-this.shakeIntensity, this.shakeIntensity);
            const shakeY = Utils.random(-this.shakeIntensity, this.shakeIntensity);
            ctx.translate(shakeX, shakeY);
        }
        
        // Clear canvas with dark background
        ctx.fillStyle = '#0A0A0A';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background particles (floating dust/ash)
        ctx.fillStyle = '#333';
        for (const p of this.bgParticles) {
            ctx.globalAlpha = p.opacity;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        ctx.globalAlpha = 1;
        
        // Draw grid pattern (subtle)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        const gridSize = 50;
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

