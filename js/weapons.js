// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Weapons & Projectile System
// ============================================

// Weapon definitions
const WEAPON_TYPES = {
    BLOOD_SHOOTER: {
        id: 'blood_shooter',
        name: 'Blood Shooter',
        description: 'Spits cursed blood forward. Gross but effective.',
        icon: '🩸',
        color: '#DC143C',
        damage: 10,
        fireRate: 400, // ms between shots
        projectileSpeed: 8,
        projectileSize: 6,
        pattern: 'straight',
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 5,
            fireRate: -50,
            projectileSize: 1
        }
    },
    
    SKULL_SPREADER: {
        id: 'skull_spreader',
        name: 'Skull Spreader',
        description: 'Fires 3 skulls in a spread. For the indecisive murderer.',
        icon: '💀',
        color: '#F5F5DC',
        damage: 7,
        fireRate: 600,
        projectileSpeed: 7,
        projectileSize: 5,
        pattern: 'spread',
        spreadCount: 3,
        spreadAngle: 0.4, // radians
        soundType: 'spread',
        maxLevel: 5,
        levelBonuses: {
            damage: 3,
            spreadCount: 1,
            fireRate: -30
        }
    },
    
    DEATH_LASER: {
        id: 'death_laser',
        name: 'Death Laser',
        description: 'Piercing beam of pure hatred. Goes through enemies.',
        icon: '⚡',
        color: '#FF4500',
        damage: 15,
        fireRate: 800,
        projectileSpeed: 12,
        projectileSize: 4,
        pattern: 'laser',
        piercing: true,
        soundType: 'laser',
        maxLevel: 5,
        levelBonuses: {
            damage: 8,
            fireRate: -80,
            projectileSize: 1
        }
    },
    
    CURSED_ORBIT: {
        id: 'cursed_orbit',
        name: 'Cursed Orbit',
        description: 'Spinning blades of doom orbit around you. Very edgy.',
        icon: '🔮',
        color: '#9932CC',
        damage: 8,
        fireRate: 100, // Continuous
        projectileSpeed: 0,
        projectileSize: 10,
        pattern: 'orbit',
        orbitCount: 3,
        orbitRadius: 80,
        orbitSpeed: 0.03,
        soundType: 'orbit',
        maxLevel: 5,
        levelBonuses: {
            damage: 4,
            orbitCount: 1,
            orbitRadius: 15
        }
    },
    
    MEAT_CANNON: {
        id: 'meat_cannon',
        name: 'Meat Cannon',
        description: 'Launches explosive meat chunks. Don\'t ask where it comes from.',
        icon: '🥩',
        color: '#8B4513',
        damage: 25,
        fireRate: 1200,
        projectileSpeed: 5,
        projectileSize: 12,
        pattern: 'explosive',
        explosionRadius: 60,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 12,
            explosionRadius: 15,
            fireRate: -100
        }
    },
    
    GHOST_CHAIN: {
        id: 'ghost_chain',
        name: 'Ghost Chain',
        description: 'Spectral chains that bounce between enemies. Spooky!',
        icon: '👻',
        color: '#4169E1',
        damage: 12,
        fireRate: 700,
        projectileSpeed: 10,
        projectileSize: 8,
        pattern: 'chain',
        chainCount: 3,
        chainRange: 150,
        soundType: 'laser',
        maxLevel: 5,
        levelBonuses: {
            damage: 6,
            chainCount: 1,
            chainRange: 30
        }
    },
    
    HELLFIRE_NOVA: {
        id: 'hellfire_nova',
        name: 'Hellfire Nova',
        description: 'Shoots flames in all directions. Great for BBQ parties.',
        icon: '🔥',
        color: '#FF6600',
        damage: 6,
        fireRate: 500,
        projectileSpeed: 6,
        projectileSize: 5,
        pattern: 'nova',
        novaCount: 8,
        soundType: 'spread',
        maxLevel: 5,
        levelBonuses: {
            damage: 3,
            novaCount: 2,
            fireRate: -40
        }
    },
    
    BONE_BOOMERANG: {
        id: 'bone_boomerang',
        name: 'Bone Boomerang',
        description: 'A femur that returns to sender. Recycling is important!',
        icon: '🦴',
        color: '#F5F5DC',
        damage: 18,
        fireRate: 900,
        projectileSpeed: 7,
        projectileSize: 10,
        pattern: 'boomerang',
        returnSpeed: 0.05,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 8,
            projectileSize: 2,
            fireRate: -80
        }
    },
    
    TOXIC_PUDDLE: {
        id: 'toxic_puddle',
        name: 'Toxic Puddle',
        description: 'Leaves pools of acid on the ground. Watch your step!',
        icon: '🧪',
        color: '#32CD32',
        damage: 4,
        fireRate: 1500,
        projectileSpeed: 0,
        projectileSize: 30,
        pattern: 'puddle',
        puddleDuration: 3000,
        puddleTickRate: 200,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 2,
            projectileSize: 10,
            puddleDuration: 500
        }
    },
    
    SOUL_SEEKER: {
        id: 'soul_seeker',
        name: 'Soul Seeker',
        description: 'Homing projectiles that hunt down enemies. They never miss!',
        icon: '💜',
        color: '#9400D3',
        damage: 8,
        fireRate: 600,
        projectileSpeed: 5,
        projectileSize: 6,
        pattern: 'homing',
        homingStrength: 0.08,
        soundType: 'laser',
        maxLevel: 5,
        levelBonuses: {
            damage: 4,
            homingStrength: 0.02,
            fireRate: -50
        }
    },
    
    SCREAM_WAVE: {
        id: 'scream_wave',
        name: 'Scream Wave',
        description: 'A piercing scream that damages everything in front. AAAAH!',
        icon: '😱',
        color: '#FF1493',
        damage: 5,
        fireRate: 800,
        projectileSpeed: 0,
        projectileSize: 100,
        pattern: 'wave',
        waveAngle: 1.2,
        waveRange: 150,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 3,
            waveRange: 30,
            waveAngle: 0.2
        }
    },
    
    BLOOD_RAIN: {
        id: 'blood_rain',
        name: 'Blood Rain',
        description: 'Calls down bloody droplets from above. It\'s raining red!',
        icon: '☔',
        color: '#8B0000',
        damage: 7,
        fireRate: 300,
        projectileSpeed: 8,
        projectileSize: 4,
        pattern: 'rain',
        rainCount: 3,
        rainSpread: 200,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 3,
            rainCount: 1,
            fireRate: -30
        }
    },
    
    EYEBALL_TURRET: {
        id: 'eyeball_turret',
        name: 'Eyeball Turret',
        description: 'Summons a floating eye that shoots at enemies. Creepy helper!',
        icon: '👀',
        color: '#FF0000',
        damage: 6,
        fireRate: 400,
        projectileSpeed: 9,
        projectileSize: 4,
        pattern: 'turret',
        turretCount: 1,
        turretRange: 200,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 3,
            turretCount: 1,
            fireRate: -40
        }
    },
    
    REAPER_SCYTHE: {
        id: 'reaper_scythe',
        name: 'Reaper Scythe',
        description: 'A spinning scythe of death. Harvesting souls since forever.',
        icon: '⚔',
        color: '#2F4F4F',
        damage: 20,
        fireRate: 1000,
        projectileSpeed: 4,
        projectileSize: 20,
        pattern: 'spin',
        spinSpeed: 0.2,
        piercing: true,
        soundType: 'spread',
        maxLevel: 5,
        levelBonuses: {
            damage: 10,
            projectileSize: 5,
            fireRate: -100
        }
    },
    
    POISON_FANG: {
        id: 'poison_fang',
        name: 'Poison Fang',
        description: 'Venomous fangs that poison enemies over time. Sssssneaky!',
        icon: '🐍',
        color: '#228B22',
        damage: 5,
        fireRate: 500,
        projectileSpeed: 10,
        projectileSize: 5,
        pattern: 'poison',
        poisonDamage: 2,
        poisonDuration: 2000,
        soundType: 'basic',
        maxLevel: 5,
        levelBonuses: {
            damage: 2,
            poisonDamage: 1,
            poisonDuration: 500
        }
    }
};

// Projectile class
class Projectile {
    constructor(x, y, angle, weapon, level = 1) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.weapon = weapon;
        this.level = level;
        
        // Calculate stats with level bonuses
        const bonusMultiplier = level - 1;
        this.damage = weapon.damage + (weapon.levelBonuses.damage || 0) * bonusMultiplier;
        this.speed = weapon.projectileSpeed;
        this.size = weapon.projectileSize + (weapon.levelBonuses.projectileSize || 0) * bonusMultiplier;
        this.color = weapon.color;
        this.pattern = weapon.pattern;
        this.piercing = weapon.piercing || false;
        
        // Velocity
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        // For special patterns
        this.lifetime = 0;
        this.maxLifetime = 3000; // 3 seconds max
        this.hitEnemies = new Set(); // For piercing weapons
        
        // Chain lightning specific
        this.chainCount = weapon.chainCount || 0;
        this.chainRange = weapon.chainRange || 0;
        this.chainsRemaining = this.chainCount + (weapon.levelBonuses.chainCount || 0) * bonusMultiplier;
        
        // Explosive specific
        this.explosionRadius = weapon.explosionRadius + (weapon.levelBonuses.explosionRadius || 0) * bonusMultiplier || 0;
        this.hasExploded = false;
        
        // Boomerang specific
        this.returning = false;
        this.startX = x;
        this.startY = y;
        this.returnSpeed = weapon.returnSpeed || 0.05;
        
        // Homing specific
        this.homingStrength = weapon.homingStrength + (weapon.levelBonuses.homingStrength || 0) * bonusMultiplier || 0;
        this.targetEnemy = null;
        
        // Puddle specific
        this.puddleDuration = weapon.puddleDuration + (weapon.levelBonuses.puddleDuration || 0) * bonusMultiplier || 0;
        this.puddleTickRate = weapon.puddleTickRate || 200;
        this.lastPuddleTick = 0;
        this.placed = false;
        
        // Wave specific
        this.waveAngle = weapon.waveAngle + (weapon.levelBonuses.waveAngle || 0) * bonusMultiplier || 0;
        this.waveRange = weapon.waveRange + (weapon.levelBonuses.waveRange || 0) * bonusMultiplier || 0;
        this.waveDamaged = new Set();
        
        // Spin specific
        this.spinAngle = 0;
        this.spinSpeed = weapon.spinSpeed || 0.2;
        
        // Poison specific
        this.poisonDamage = weapon.poisonDamage + (weapon.levelBonuses.poisonDamage || 0) * bonusMultiplier || 0;
        this.poisonDuration = weapon.poisonDuration + (weapon.levelBonuses.poisonDuration || 0) * bonusMultiplier || 0;
    }
    
    update(deltaTime, enemies, playerX, playerY) {
        this.lifetime += deltaTime;
        
        if (this.pattern === 'orbit') {
            return true;
        }
        
        // Pattern-specific updates
        switch (this.pattern) {
            case 'boomerang':
                if (!this.returning && this.lifetime > 400) {
                    this.returning = true;
                }
                if (this.returning) {
                    const dx = this.startX - this.x;
                    const dy = this.startY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 20) return false;
                    this.vx += dx * this.returnSpeed;
                    this.vy += dy * this.returnSpeed;
                }
                this.spinAngle += 0.3;
                break;
                
            case 'homing':
                // Find nearest enemy if no target
                if (!this.targetEnemy || this.targetEnemy.isDying) {
                    let nearest = null;
                    let nearestDist = Infinity;
                    for (const enemy of enemies) {
                        if (enemy.isDying) continue;
                        const dist = Utils.distance(this.x, this.y, enemy.x, enemy.y);
                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearest = enemy;
                        }
                    }
                    this.targetEnemy = nearest;
                }
                // Home towards target
                if (this.targetEnemy) {
                    const angle = Utils.angle(this.x, this.y, this.targetEnemy.x, this.targetEnemy.y);
                    this.vx += Math.cos(angle) * this.homingStrength * this.speed;
                    this.vy += Math.sin(angle) * this.homingStrength * this.speed;
                    // Limit speed
                    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (currentSpeed > this.speed * 1.5) {
                        this.vx = (this.vx / currentSpeed) * this.speed * 1.5;
                        this.vy = (this.vy / currentSpeed) * this.speed * 1.5;
                    }
                }
                break;
                
            case 'puddle':
                if (!this.placed) {
                    this.placed = true;
                    this.x = playerX + Utils.random(-50, 50);
                    this.y = playerY + Utils.random(-50, 50);
                }
                this.maxLifetime = this.puddleDuration;
                return this.lifetime < this.maxLifetime;
                
            case 'wave':
                this.maxLifetime = 200;
                return this.lifetime < this.maxLifetime;
                
            case 'spin':
                this.spinAngle += this.spinSpeed;
                break;
                
            case 'rain':
                // Falls from above
                if (!this.placed) {
                    this.placed = true;
                    this.y = -20;
                }
                this.vy = this.speed;
                this.vx = 0;
                break;
        }
        
        // Move projectile
        this.x += this.vx;
        this.y += this.vy;
        
        // Check lifetime
        if (this.lifetime > this.maxLifetime) {
            return false;
        }
        
        return true;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw based on pattern/weapon type
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        // Pixelated projectile shapes
        const s = this.size;
        
        switch(this.weapon.id) {
            case 'blood_shooter':
                // Blood drop shape
                ctx.fillRect(this.x - s/2, this.y - s, s, s * 1.5);
                ctx.fillRect(this.x - s, this.y - s/2, s * 2, s);
                break;
                
            case 'skull_spreader':
                // Tiny skull
                ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x - s/2, this.y - s/2, s/3, s/3);
                ctx.fillRect(this.x + s/6, this.y - s/2, s/3, s/3);
                break;
                
            case 'death_laser':
                // Long laser beam
                ctx.fillRect(this.x - s * 2, this.y - s/2, s * 4, s);
                break;
                
            case 'cursed_orbit':
                // Spinning blade
                ctx.fillRect(this.x - s, this.y - s/4, s * 2, s/2);
                ctx.fillRect(this.x - s/4, this.y - s, s/2, s * 2);
                break;
                
            case 'meat_cannon':
                // Chunky meat
                ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                break;
                
            case 'ghost_chain':
                // Ghostly orb
                ctx.globalAlpha = 0.8;
                ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                break;
                
            case 'hellfire_nova':
                // Flame
                ctx.fillRect(this.x - s/2, this.y - s, s, s * 2);
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(this.x - s/3, this.y - s/2, s/1.5, s);
                break;
                
            case 'bone_boomerang':
                // Spinning bone
                ctx.translate(this.x, this.y);
                ctx.rotate(this.spinAngle);
                ctx.fillRect(-s, -s/4, s * 2, s/2);
                ctx.fillRect(-s/4, -s/4, s/2, s/2);
                ctx.translate(-this.x, -this.y);
                break;
                
            case 'toxic_puddle':
                // Puddle on ground
                ctx.globalAlpha = 0.6 * (1 - this.lifetime / this.maxLifetime);
                ctx.fillRect(this.x - s, this.y - s/3, s * 2, s/1.5);
                ctx.fillStyle = '#00FF00';
                ctx.globalAlpha = 0.4 * (1 - this.lifetime / this.maxLifetime);
                ctx.fillRect(this.x - s/2, this.y - s/4, s, s/2);
                break;
                
            case 'soul_seeker':
                // Homing soul
                ctx.globalAlpha = 0.9;
                ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
                ctx.fillStyle = '#FF00FF';
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                break;
                
            case 'scream_wave':
                // Wave effect
                ctx.globalAlpha = 0.5 * (1 - this.lifetime / 200);
                const waveProgress = this.lifetime / 200;
                const currentRange = this.waveRange * waveProgress;
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRange, this.angle - this.waveAngle/2, this.angle + this.waveAngle/2);
                ctx.lineTo(this.x, this.y);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'blood_rain':
                // Rain drop
                ctx.fillRect(this.x - s/4, this.y - s, s/2, s * 2);
                break;
                
            case 'eyeball_turret':
                // Eyeball
                ctx.fillStyle = '#FFF';
                ctx.fillRect(this.x - s, this.y - s, s * 2, s * 2);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x - s/4, this.y - s/4, s/2, s/2);
                break;
                
            case 'reaper_scythe':
                // Spinning scythe
                ctx.translate(this.x, this.y);
                ctx.rotate(this.spinAngle);
                ctx.fillRect(-s, -s/6, s * 2, s/3);
                ctx.fillRect(s/2, -s, s/3, s);
                ctx.translate(-this.x, -this.y);
                break;
                
            case 'poison_fang':
                // Fang shape
                ctx.fillRect(this.x - s/4, this.y - s, s/2, s * 2);
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(this.x - s/6, this.y + s/2, s/3, s/2);
                break;
                
            default:
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
        }
        
        ctx.restore();
    }
}

// Orbit projectile (special case - stays around player)
class OrbitProjectile {
    constructor(player, weapon, index, totalOrbs, level = 1) {
        this.player = player;
        this.weapon = weapon;
        this.index = index;
        this.totalOrbs = totalOrbs;
        this.level = level;
        
        const bonusMultiplier = level - 1;
        this.damage = weapon.damage + (weapon.levelBonuses.damage || 0) * bonusMultiplier;
        this.size = weapon.projectileSize;
        this.color = weapon.color;
        
        this.orbitRadius = weapon.orbitRadius + (weapon.levelBonuses.orbitRadius || 0) * bonusMultiplier;
        this.orbitSpeed = weapon.orbitSpeed;
        this.angle = (Math.PI * 2 / totalOrbs) * index;
        
        this.x = 0;
        this.y = 0;
        this.hitCooldowns = new Map(); // Track hit cooldowns per enemy
    }
    
    update(deltaTime) {
        this.angle += this.orbitSpeed;
        this.x = this.player.x + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.player.y + Math.sin(this.angle) * this.orbitRadius;
        
        // Decrease hit cooldowns
        for (const [enemyId, cooldown] of this.hitCooldowns) {
            if (cooldown <= 0) {
                this.hitCooldowns.delete(enemyId);
            } else {
                this.hitCooldowns.set(enemyId, cooldown - deltaTime);
            }
        }
    }
    
    canHit(enemyId) {
        return !this.hitCooldowns.has(enemyId);
    }
    
    registerHit(enemyId) {
        this.hitCooldowns.set(enemyId, 500); // 500ms cooldown per enemy
    }
    
    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        const s = this.size;
        // Spinning blade effect
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * 3);
        ctx.fillRect(-s, -s/4, s * 2, s/2);
        ctx.fillRect(-s/4, -s, s/2, s * 2);
        
        ctx.restore();
    }
}

// Weapon instance that the player holds
class Weapon {
    constructor(type, level = 1) {
        this.type = type;
        this.data = WEAPON_TYPES[type];
        this.level = level;
        this.lastFired = 0;
        this.orbitProjectiles = [];
        this.turrets = [];
        
        // Validate weapon data
        if (!this.data) {
            console.error(`Invalid weapon type: ${type}`);
            // Create fallback data
            this.data = {
                id: type,
                name: 'Unknown Weapon',
                description: 'A mysterious weapon',
                icon: '❓',
                color: '#FFFFFF',
                damage: 5,
                fireRate: 500,
                projectileSpeed: 5,
                projectileSize: 4,
                pattern: 'straight',
                soundType: 'basic',
                maxLevel: 5,
                levelBonuses: { damage: 2, fireRate: -30 }
            };
        }
        
        // Calculate fire rate with level
        const bonusMultiplier = level - 1;
        this.fireRate = this.data.fireRate + (this.data.levelBonuses.fireRate || 0) * bonusMultiplier;
        this.fireRate = Math.max(100, this.fireRate); // Minimum 100ms
        
        // For orbit weapons, create the orbs
        if (this.data.pattern === 'orbit') {
            this.initOrbitProjectiles(null);
        }
    }
    
    initOrbitProjectiles(player) {
        if (!player) return;
        
        this.orbitProjectiles = [];
        const orbCount = this.data.orbitCount + (this.data.levelBonuses.orbitCount || 0) * (this.level - 1);
        
        for (let i = 0; i < orbCount; i++) {
            this.orbitProjectiles.push(new OrbitProjectile(player, this.data, i, orbCount, this.level));
        }
    }
    
    levelUp() {
        if (this.level < this.data.maxLevel) {
            this.level++;
            // Recalculate fire rate
            const bonusMultiplier = this.level - 1;
            this.fireRate = this.data.fireRate + (this.data.levelBonuses.fireRate || 0) * bonusMultiplier;
            this.fireRate = Math.max(100, this.fireRate);
            
            // Reinitialize orbit projectiles if needed
            if (this.data.pattern === 'orbit' && this.orbitProjectiles.length > 0) {
                const player = this.orbitProjectiles[0].player;
                this.initOrbitProjectiles(player);
            }
            
            return true;
        }
        return false;
    }
    
    canFire(currentTime) {
        return currentTime - this.lastFired >= this.fireRate;
    }
    
    fire(x, y, angle, currentTime, playerVelX = 0, playerVelY = 0) {
        if (!this.canFire(currentTime)) return [];
        
        this.lastFired = currentTime;
        const projectiles = [];
        
        switch(this.data.pattern) {
            case 'straight':
            case 'boomerang':
            case 'homing':
            case 'spin':
            case 'poison':
                projectiles.push(new Projectile(x, y, angle, this.data, this.level));
                break;
                
            case 'spread':
                const spreadCount = this.data.spreadCount + (this.data.levelBonuses.spreadCount || 0) * (this.level - 1);
                const totalSpread = this.data.spreadAngle * (spreadCount - 1);
                const startAngle = angle - totalSpread / 2;
                
                for (let i = 0; i < spreadCount; i++) {
                    const a = startAngle + (i * this.data.spreadAngle);
                    projectiles.push(new Projectile(x, y, a, this.data, this.level));
                }
                break;
                
            case 'nova':
                const novaCount = this.data.novaCount + (this.data.levelBonuses.novaCount || 0) * (this.level - 1);
                for (let i = 0; i < novaCount; i++) {
                    const a = (Math.PI * 2 / novaCount) * i;
                    projectiles.push(new Projectile(x, y, a, this.data, this.level));
                }
                break;
                
            case 'rain':
                const rainCount = this.data.rainCount + (this.data.levelBonuses.rainCount || 0) * (this.level - 1);
                const rainSpread = this.data.rainSpread || 200;
                for (let i = 0; i < rainCount; i++) {
                    const rainX = x + Utils.random(-rainSpread/2, rainSpread/2);
                    projectiles.push(new Projectile(rainX, y - 300, Math.PI / 2, this.data, this.level));
                }
                break;
                
            case 'laser':
            case 'chain':
            case 'explosive':
                projectiles.push(new Projectile(x, y, angle, this.data, this.level));
                break;
                
            case 'puddle':
            case 'wave':
                projectiles.push(new Projectile(x, y, angle, this.data, this.level));
                break;
                
            case 'turret':
                // Turrets are handled separately
                break;
                
            case 'orbit':
                // Orbit doesn't fire projectiles traditionally
                break;
        }
        
        if (projectiles.length > 0) {
            Audio.playShoot(this.data.soundType);
        }
        
        return projectiles;
    }
    
    updateOrbit(deltaTime) {
        for (const orb of this.orbitProjectiles) {
            orb.update(deltaTime);
        }
    }
    
    drawOrbit(ctx) {
        for (const orb of this.orbitProjectiles) {
            orb.draw(ctx);
        }
    }
    
    // Turret system
    initTurrets(player) {
        this.turrets = [];
        this.turretPlayer = player;
        const count = this.data.turretCount + (this.data.levelBonuses.turretCount || 0) * (this.level - 1);
        
        for (let i = 0; i < count; i++) {
            this.turrets.push({
                angle: (Math.PI * 2 / count) * i,
                distance: 60,
                lastFired: 0,
                x: 0,
                y: 0
            });
        }
    }
    
    updateTurrets(deltaTime, currentTime, enemies) {
        if (!this.turrets || !this.turretPlayer) return [];
        
        const projectiles = [];
        const player = this.turretPlayer;
        
        // Update turret count if level changed
        const expectedCount = this.data.turretCount + (this.data.levelBonuses.turretCount || 0) * (this.level - 1);
        while (this.turrets.length < expectedCount) {
            this.turrets.push({
                angle: (Math.PI * 2 / expectedCount) * this.turrets.length,
                distance: 60,
                lastFired: 0,
                x: 0,
                y: 0
            });
        }
        
        for (const turret of this.turrets) {
            // Rotate around player
            turret.angle += deltaTime * 0.001;
            turret.x = player.x + Math.cos(turret.angle) * turret.distance;
            turret.y = player.y + Math.sin(turret.angle) * turret.distance;
            
            // Find nearest enemy in range
            let nearestEnemy = null;
            let nearestDist = this.data.turretRange || 200;
            
            for (const enemy of enemies) {
                if (enemy.isDying) continue;
                const dist = Math.sqrt(
                    Math.pow(turret.x - enemy.x, 2) + 
                    Math.pow(turret.y - enemy.y, 2)
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }
            
            // Fire at enemy
            if (nearestEnemy && currentTime - turret.lastFired >= this.fireRate) {
                turret.lastFired = currentTime;
                const angle = Math.atan2(
                    nearestEnemy.y - turret.y,
                    nearestEnemy.x - turret.x
                );
                projectiles.push(new Projectile(turret.x, turret.y, angle, this.data, this.level));
                Audio.playShoot('basic');
            }
        }
        
        return projectiles;
    }
    
    drawTurrets(ctx) {
        if (!this.turrets) return;
        
        for (const turret of this.turrets) {
            ctx.save();
            
            // Draw floating eyeball
            const size = 12;
            
            // Eye white
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(turret.x, turret.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye outline
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Pupil (looks at nearest target direction or forward)
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(turret.x + 3, turret.y, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner pupil
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(turret.x + 4, turret.y, size * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow effect
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#FF6666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(turret.x, turret.y, size + 2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

