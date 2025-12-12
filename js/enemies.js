// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Enemy System
// ============================================

// Enemy type definitions
const ENEMY_TYPES = {
    ZOMBIE: {
        id: 'zombie',
        name: 'Rotting Randy',
        color: '#556B2F',
        accentColor: '#8B4513',
        size: 14,
        health: 20,
        damage: 10,
        speed: 1.2,
        xpValue: 10,
        spawnWeight: 40,
        minWave: 1
    },
    
    SKELETON: {
        id: 'skeleton',
        name: 'Boney Tony',
        color: '#F5F5DC',
        accentColor: '#808080',
        size: 12,
        health: 15,
        damage: 8,
        speed: 2,
        xpValue: 8,
        spawnWeight: 30,
        minWave: 1
    },
    
    GHOST: {
        id: 'ghost',
        name: 'Transparent Terry',
        color: '#4169E1',
        accentColor: '#87CEEB',
        size: 16,
        health: 25,
        damage: 12,
        speed: 1.5,
        xpValue: 15,
        spawnWeight: 20,
        minWave: 2,
        phasing: true // Can phase through briefly
    },
    
    DEMON: {
        id: 'demon',
        name: 'Demented Derek',
        color: '#DC143C',
        accentColor: '#8B0000',
        size: 18,
        health: 40,
        damage: 15,
        speed: 1.8,
        xpValue: 25,
        spawnWeight: 15,
        minWave: 3
    },
    
    BLOB: {
        id: 'blob',
        name: 'Blobby Bobby',
        color: '#32CD32',
        accentColor: '#228B22',
        size: 20,
        health: 60,
        damage: 8,
        speed: 0.8,
        xpValue: 20,
        spawnWeight: 10,
        minWave: 2,
        splitsOnDeath: true
    },
    
    BAT: {
        id: 'bat',
        name: 'Bitey McBatface',
        color: '#4B0082',
        accentColor: '#800080',
        size: 10,
        health: 10,
        damage: 5,
        speed: 3,
        xpValue: 5,
        spawnWeight: 25,
        minWave: 1,
        erratic: true // Moves erratically
    },
    
    WRAITH: {
        id: 'wraith',
        name: 'Wrathy Wendy',
        color: '#2F4F4F',
        accentColor: '#696969',
        size: 16,
        health: 30,
        damage: 20,
        speed: 2.5,
        xpValue: 30,
        spawnWeight: 8,
        minWave: 4,
        teleports: true
    }
};

// Boss definitions
const BOSS_TYPES = {
    MEGA_ZOMBIE: {
        id: 'mega_zombie',
        name: 'CAPTAIN CHUNKY GUTS',
        color: '#556B2F',
        accentColor: '#8B4513',
        size: 60,
        health: 500,
        damage: 25,
        speed: 0.8,
        xpValue: 200,
        attackPattern: 'charge',
        spawnMinions: true
    },
    
    DEMON_LORD: {
        id: 'demon_lord',
        name: 'BARON VON STINKBUTT',
        color: '#DC143C',
        accentColor: '#FF4500',
        size: 70,
        health: 750,
        damage: 30,
        speed: 1,
        xpValue: 300,
        attackPattern: 'spiral',
        shootsProjectiles: true
    },
    
    GHOST_KING: {
        id: 'ghost_king',
        name: 'LORD BUTTFACE THE FLATULENT',
        color: '#4169E1',
        accentColor: '#00BFFF',
        size: 65,
        health: 600,
        damage: 20,
        speed: 1.5,
        xpValue: 250,
        attackPattern: 'teleport',
        summonGhosts: true
    },
    
    NIGHTMARE: {
        id: 'nightmare',
        name: 'NIGHTMARE KAREN',
        color: '#4B0082',
        accentColor: '#9400D3',
        size: 80,
        health: 1000,
        damage: 35,
        speed: 1.2,
        xpValue: 500,
        attackPattern: 'all',
        isFinalBoss: true
    }
};

// Enemy class
class Enemy {
    constructor(x, y, type, waveMultiplier = 1) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x;
        this.y = y;
        this.type = type;
        this.data = ENEMY_TYPES[type];
        
        // Apply wave scaling
        this.maxHealth = Math.floor(this.data.health * waveMultiplier);
        this.health = this.maxHealth;
        this.damage = Math.floor(this.data.damage * waveMultiplier);
        this.speed = this.data.speed;
        this.size = this.data.size;
        this.xpValue = Math.floor(this.data.xpValue * waveMultiplier);
        
        this.color = this.data.color;
        this.accentColor = this.data.accentColor;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        // Special properties
        this.phasing = this.data.phasing || false;
        this.phaseTimer = 0;
        this.isPhased = false;
        
        this.erratic = this.data.erratic || false;
        this.erraticTimer = 0;
        this.erraticAngle = 0;
        
        this.teleports = this.data.teleports || false;
        this.teleportTimer = Utils.random(2000, 4000);
        
        this.splitsOnDeath = this.data.splitsOnDeath || false;
        
        // Animation
        this.animTimer = 0;
        this.hitFlash = 0;
        this.deathTimer = 0;
        this.isDying = false;
        this.isDead = false;
    }
    
    update(deltaTime, playerX, playerY, canvasWidth, canvasHeight) {
        if (this.isDying) {
            this.deathTimer += deltaTime;
            if (this.deathTimer > 200) {
                this.isDead = true;
            }
            return;
        }
        
        // Update animation
        this.animTimer += deltaTime;
        if (this.hitFlash > 0) this.hitFlash -= deltaTime;
        
        // Calculate direction to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            let moveX = (dx / dist) * this.speed;
            let moveY = (dy / dist) * this.speed;
            
            // Special movement behaviors
            if (this.erratic) {
                this.erraticTimer += deltaTime;
                if (this.erraticTimer > 200) {
                    this.erraticAngle = Utils.random(-1, 1);
                    this.erraticTimer = 0;
                }
                const cos = Math.cos(this.erraticAngle);
                const sin = Math.sin(this.erraticAngle);
                const newX = moveX * cos - moveY * sin;
                const newY = moveX * sin + moveY * cos;
                moveX = newX;
                moveY = newY;
            }
            
            if (this.phasing) {
                this.phaseTimer += deltaTime;
                if (this.phaseTimer > 2000) {
                    this.isPhased = !this.isPhased;
                    this.phaseTimer = 0;
                }
            }
            
            if (this.teleports) {
                this.teleportTimer -= deltaTime;
                if (this.teleportTimer <= 0) {
                    // Teleport closer to player
                    const teleportDist = Utils.random(100, 200);
                    const angle = Utils.random(0, Math.PI * 2);
                    this.x = playerX + Math.cos(angle) * teleportDist;
                    this.y = playerY + Math.sin(angle) * teleportDist;
                    this.teleportTimer = Utils.random(2000, 4000);
                }
            }
            
            // Apply movement
            this.vx = moveX;
            this.vy = moveY;
            this.x += this.vx;
            this.y += this.vy;
        }
        
        // Keep in bounds (with some margin)
        const margin = 50;
        this.x = Utils.clamp(this.x, -margin, canvasWidth + margin);
        this.y = Utils.clamp(this.y, -margin, canvasHeight + margin);
    }
    
    takeDamage(amount) {
        if (this.isDying || this.isPhased) return false;
        
        this.health -= amount;
        this.hitFlash = 100;
        Audio.playHit();
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }
    
    die() {
        this.isDying = true;
        this.deathTimer = 0;
        Audio.playDeath();
    }
    
    draw(ctx) {
        ctx.save();
        
        // Death animation
        if (this.isDying) {
            ctx.globalAlpha = 1 - (this.deathTimer / 200);
            ctx.translate(this.x, this.y);
            ctx.scale(1 + this.deathTimer / 100, 1 + this.deathTimer / 100);
            ctx.translate(-this.x, -this.y);
        }
        
        // Hit flash
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#FFF';
        } else if (this.isPhased) {
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = this.color;
        }
        
        const s = this.size;
        const wobble = Math.sin(this.animTimer / 100) * 2;
        
        // Draw based on enemy type
        switch(this.data.id) {
            case 'zombie':
                // Blocky zombie body
                ctx.fillRect(this.x - s/2, this.y - s/2 + wobble, s, s);
                // Arms
                ctx.fillRect(this.x - s, this.y - s/4, s/3, s/2);
                ctx.fillRect(this.x + s/2 + s/6, this.y - s/4, s/3, s/2);
                // Eyes
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(this.x - s/3, this.y - s/4, s/5, s/5);
                ctx.fillRect(this.x + s/6, this.y - s/4, s/5, s/5);
                break;
                
            case 'skeleton':
                // Skull
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Eye sockets
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x - s/3, this.y - s/4, s/4, s/4);
                ctx.fillRect(this.x + s/12, this.y - s/4, s/4, s/4);
                // Jaw
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - s/3, this.y + s/6, s/1.5, s/4);
                break;
                
            case 'ghost':
                // Ghostly body with wave
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.2);
                // Wavy bottom
                for (let i = 0; i < 3; i++) {
                    const waveY = Math.sin(this.animTimer / 150 + i) * 3;
                    ctx.fillRect(this.x - s/2 + i * s/3, this.y + s/2 + waveY, s/3, s/4);
                }
                // Eyes
                ctx.fillStyle = '#FFF';
                ctx.fillRect(this.x - s/3, this.y - s/4, s/4, s/4);
                ctx.fillRect(this.x + s/12, this.y - s/4, s/4, s/4);
                break;
                
            case 'demon':
                // Body
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Horns
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s/2 - s/6, this.y - s/2 - s/3, s/4, s/3);
                ctx.fillRect(this.x + s/3, this.y - s/2 - s/3, s/4, s/3);
                // Angry eyes
                ctx.fillStyle = '#FFFF00';
                ctx.fillRect(this.x - s/3, this.y - s/4, s/4, s/6);
                ctx.fillRect(this.x + s/12, this.y - s/4, s/4, s/6);
                break;
                
            case 'blob':
                // Blobby shape
                const blobWobble = Math.sin(this.animTimer / 200) * 3;
                ctx.fillRect(this.x - s/2 - blobWobble, this.y - s/3, s + blobWobble * 2, s/1.5);
                ctx.fillRect(this.x - s/3, this.y - s/2, s/1.5, s);
                // Derp eyes
                ctx.fillStyle = '#FFF';
                ctx.fillRect(this.x - s/4, this.y - s/4, s/5, s/5);
                ctx.fillRect(this.x + s/10, this.y - s/5, s/5, s/5);
                break;
                
            case 'bat':
                // Body
                ctx.fillRect(this.x - s/4, this.y - s/4, s/2, s/2);
                // Wings
                const wingFlap = Math.sin(this.animTimer / 50) * s/4;
                ctx.fillRect(this.x - s, this.y - s/4 - wingFlap, s/2, s/3);
                ctx.fillRect(this.x + s/2, this.y - s/4 + wingFlap, s/2, s/3);
                // Eyes
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(this.x - s/6, this.y - s/6, s/8, s/8);
                ctx.fillRect(this.x + s/12, this.y - s/6, s/8, s/8);
                break;
                
            case 'wraith':
                // Hooded figure
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.3);
                // Hood
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s/2 - s/6, this.y - s/2 - s/4, s + s/3, s/2);
                // Glowing eyes
                ctx.fillStyle = '#FF00FF';
                ctx.shadowColor = '#FF00FF';
                ctx.shadowBlur = 10;
                ctx.fillRect(this.x - s/4, this.y - s/4, s/6, s/6);
                ctx.fillRect(this.x + s/8, this.y - s/4, s/6, s/6);
                break;
            
            // BOSS TYPES
            case 'mega_zombie':
                // Giant zombie boss
                ctx.fillRect(this.x - s/2, this.y - s/2 + wobble, s, s);
                // Big arms
                ctx.fillRect(this.x - s * 0.8, this.y - s/4, s/2.5, s/1.5);
                ctx.fillRect(this.x + s/2 + s/10, this.y - s/4, s/2.5, s/1.5);
                // Angry eyes
                ctx.fillStyle = '#FF0000';
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 15;
                ctx.fillRect(this.x - s/3, this.y - s/4, s/4, s/5);
                ctx.fillRect(this.x + s/10, this.y - s/4, s/4, s/5);
                // Guts hanging out
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(this.x - s/4, this.y + s/3, s/2, s/4);
                break;
                
            case 'demon_lord':
                // Demon boss body
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Large horns
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s/2 - s/4, this.y - s/2 - s/2, s/3, s/2);
                ctx.fillRect(this.x + s/3, this.y - s/2 - s/2, s/3, s/2);
                // Fiery eyes
                ctx.fillStyle = '#FFFF00';
                ctx.shadowColor = '#FF4500';
                ctx.shadowBlur = 20;
                ctx.fillRect(this.x - s/3, this.y - s/4, s/3, s/5);
                ctx.fillRect(this.x + s/12, this.y - s/4, s/3, s/5);
                // Wings
                ctx.shadowBlur = 0;
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s, this.y - s/3, s/3, s/1.5);
                ctx.fillRect(this.x + s * 0.7, this.y - s/3, s/3, s/1.5);
                break;
                
            case 'ghost_king':
                // Ghost king body
                ctx.globalAlpha = 0.8;
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.3);
                // Crown
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x - s/2, this.y - s/2 - s/4, s, s/6);
                ctx.fillRect(this.x - s/2 + s/6, this.y - s/2 - s/2, s/6, s/4);
                ctx.fillRect(this.x + s/3 - s/6, this.y - s/2 - s/2, s/6, s/4);
                ctx.fillRect(this.x - s/12, this.y - s/2 - s/2, s/6, s/4);
                // Wavy bottom
                ctx.fillStyle = this.color;
                for (let i = 0; i < 4; i++) {
                    const waveY = Math.sin(this.animTimer / 150 + i) * 5;
                    ctx.fillRect(this.x - s/2 + i * s/4, this.y + s/2 + waveY, s/4, s/3);
                }
                // Glowing eyes
                ctx.fillStyle = '#00FFFF';
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 20;
                ctx.fillRect(this.x - s/3, this.y - s/4, s/4, s/4);
                ctx.fillRect(this.x + s/10, this.y - s/4, s/4, s/4);
                break;
                
            case 'nightmare':
                // Final boss - shifting nightmare form
                const shift = Math.sin(this.animTimer / 100) * 5;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - s/2 + shift, this.y - s/2, s, s);
                ctx.fillRect(this.x - s/2 - shift, this.y - s/3, s, s/1.5);
                // Multiple eyes
                ctx.fillStyle = '#FF00FF';
                ctx.shadowColor = '#FF00FF';
                ctx.shadowBlur = 25;
                for (let i = 0; i < 5; i++) {
                    const eyeX = this.x - s/2 + (i * s/5) + Math.sin(this.animTimer / 200 + i) * 5;
                    const eyeY = this.y - s/4 + Math.cos(this.animTimer / 150 + i) * 3;
                    ctx.fillRect(eyeX, eyeY, s/6, s/6);
                }
                // Tentacles
                ctx.shadowBlur = 0;
                ctx.fillStyle = this.accentColor;
                for (let i = 0; i < 4; i++) {
                    const tentX = this.x - s/2 + i * s/3;
                    const tentY = this.y + s/2 + Math.sin(this.animTimer / 100 + i * 2) * 10;
                    ctx.fillRect(tentX, this.y + s/3, s/5, s/2 + tentY - this.y - s/3);
                }
                break;
            
            // GRANNY GRAVES BOSSES
            case 'denture_dragon':
                ctx.fillRect(this.x - s/2, this.y - s/2 + wobble, s, s);
                // Dragon teeth
                ctx.fillStyle = '#FFF';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(this.x - s/2 + i * s/5, this.y + s/3, s/6, s/4);
                }
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(this.x - s/4, this.y - s/4, s/2, s/6);
                ctx.fillRect(this.x + s/8, this.y - s/4, s/2, s/6);
                break;
                
            case 'bingo_beast':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Bingo balls
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x - s/3, this.y - s * 0.7, s/4, s/4);
                ctx.fillRect(this.x + s/8, this.y - s * 0.7, s/4, s/4);
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(this.x - s/8, this.y - s * 0.8, s/4, s/4);
                break;
                
            case 'knitting_nightmare':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.2);
                // Knitting needles
                ctx.fillStyle = '#C0C0C0';
                ctx.fillRect(this.x - s * 0.8, this.y - s/4, s/6, s);
                ctx.fillRect(this.x + s * 0.6, this.y - s/4, s/6, s);
                // Yarn
                ctx.fillStyle = '#FF0000';
                const yarnWobble = Math.sin(this.animTimer / 100) * 5;
                ctx.fillRect(this.x - s/4, this.y + s/2 + yarnWobble, s/2, s/4);
                break;
                
            case 'grandpa_ghoul':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Cane
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + s * 0.6, this.y - s/2, s/8, s * 1.2);
                // Hat
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(this.x - s/2, this.y - s/2 - s/4, s, s/6);
                ctx.fillRect(this.x - s/3, this.y - s/2 - s/2, s/1.5, s/4);
                break;
            
            // EDGY EDDIE BOSSES
            case 'emo_emperor':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Hair covering eye
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x - s/2, this.y - s/2 - s/6, s * 0.7, s/2);
                // Single visible eye
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(this.x + s/6, this.y - s/4, s/4, s/6);
                break;
                
            case 'darkness_daddy':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.3);
                // Void aura
                ctx.fillStyle = this.accentColor;
                ctx.globalAlpha = 0.5 + Math.sin(this.animTimer / 150) * 0.3;
                ctx.fillRect(this.x - s * 0.7, this.y - s * 0.7, s * 1.4, s * 1.6);
                ctx.globalAlpha = 1;
                break;
                
            case 'tears_titan':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Tears
                ctx.fillStyle = '#87CEEB';
                for (let i = 0; i < 3; i++) {
                    const tearY = this.y + s/4 + (this.animTimer / 50 + i * 20) % s;
                    ctx.fillRect(this.x - s/3 + i * s/3, tearY, s/8, s/6);
                }
                break;
                
            case 'void_vincent':
                const voidShift = Math.sin(this.animTimer / 80) * 8;
                ctx.fillRect(this.x - s/2 + voidShift, this.y - s/2, s, s);
                ctx.fillStyle = '#FF00FF';
                ctx.shadowBlur = 30;
                ctx.fillRect(this.x - s/4 - voidShift, this.y - s/3, s/2, s/1.5);
                break;
            
            // CHEF CLEAVER BOSSES
            case 'glutton_golem':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.2);
                // Belly
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s/3, this.y, s/1.5, s/2);
                // Drool
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(this.x - s/8, this.y + s/2, s/6, s/4 + Math.sin(this.animTimer / 100) * 5);
                break;
                
            case 'food_fight_fiend':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Tomato splats
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(this.x - s * 0.6, this.y - s/4, s/4, s/4);
                ctx.fillRect(this.x + s * 0.4, this.y + s/6, s/4, s/4);
                // Lettuce
                ctx.fillStyle = '#228B22';
                ctx.fillRect(this.x - s/4, this.y - s * 0.6, s/2, s/6);
                break;
                
            case 'kitchen_kraken':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Tentacles (spatulas)
                ctx.fillStyle = '#C0C0C0';
                for (let i = 0; i < 4; i++) {
                    const angle = (Math.PI * 2 / 4) * i + this.animTimer / 200;
                    const tx = this.x + Math.cos(angle) * s * 0.8;
                    const ty = this.y + Math.sin(angle) * s * 0.6;
                    ctx.fillRect(tx - s/10, ty - s/4, s/5, s/2);
                }
                break;
                
            case 'hangry_horror':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.1);
                // Open mouth
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x - s/3, this.y + s/6, s/1.5, s/3);
                // Teeth
                ctx.fillStyle = '#FFF';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(this.x - s/4 + i * s/6, this.y + s/6, s/8, s/6);
                }
                break;
            
            // DISCO DAVE BOSSES
            case 'boogie_beast':
                ctx.fillRect(this.x - s/2, this.y - s/2 + Math.sin(this.animTimer / 100) * 5, s, s);
                // Disco colors
                const discoHue = (this.animTimer / 10) % 360;
                ctx.fillStyle = `hsl(${discoHue}, 100%, 50%)`;
                ctx.fillRect(this.x - s/3, this.y - s/3, s/4, s/4);
                ctx.fillStyle = `hsl(${(discoHue + 120) % 360}, 100%, 50%)`;
                ctx.fillRect(this.x + s/12, this.y - s/3, s/4, s/4);
                break;
                
            case 'funky_phantom':
                ctx.globalAlpha = 0.7 + Math.sin(this.animTimer / 100) * 0.3;
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.2);
                // Afro
                ctx.fillStyle = this.accentColor;
                ctx.fillRect(this.x - s * 0.6, this.y - s/2 - s/3, s * 1.2, s/2);
                break;
                
            case 'rhythm_reaper':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Musical notes
                ctx.fillStyle = '#32CD32';
                const noteY = Math.sin(this.animTimer / 150) * 10;
                ctx.fillRect(this.x - s * 0.7, this.y - s/4 + noteY, s/6, s/3);
                ctx.fillRect(this.x + s * 0.6, this.y + noteY, s/6, s/3);
                break;
                
            case 'saturday_nightmare':
                const discoShift = Math.sin(this.animTimer / 60) * 3;
                ctx.fillRect(this.x - s/2 + discoShift, this.y - s/2, s, s);
                // Disco ball effect
                ctx.fillStyle = '#FFF';
                ctx.shadowBlur = 20;
                for (let i = 0; i < 6; i++) {
                    const sparkleAngle = (Math.PI * 2 / 6) * i + this.animTimer / 100;
                    const sx = this.x + Math.cos(sparkleAngle) * s * 0.6;
                    const sy = this.y + Math.sin(sparkleAngle) * s * 0.4;
                    ctx.fillRect(sx - s/12, sy - s/12, s/6, s/6);
                }
                break;
            
            // NERDY NANCY BOSSES
            case 'algorithm_abomination':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                // Binary code
                ctx.fillStyle = '#000';
                ctx.font = `${s/6}px monospace`;
                ctx.fillText('10101', this.x - s/3, this.y);
                ctx.fillText('01010', this.x - s/3, this.y + s/4);
                break;
                
            case 'binary_behemoth':
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s * 1.2);
                // Glowing code
                ctx.fillStyle = '#00FF00';
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 15;
                ctx.fillRect(this.x - s/4, this.y - s/4, s/8, s/8);
                ctx.fillRect(this.x + s/8, this.y - s/4, s/8, s/8);
                ctx.fillRect(this.x - s/8, this.y, s/8, s/8);
                break;
                
            case 'stack_overflow_specter':
                ctx.globalAlpha = 0.8;
                // Stacked layers
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = i === 0 ? '#FF8C00' : this.color;
                    ctx.fillRect(this.x - s/2 + i * 5, this.y - s/2 - i * 10, s, s);
                }
                break;
                
            case 'final_boss_404':
                // Glitchy appearance
                const glitch = Math.random() > 0.9 ? Utils.random(-10, 10) : 0;
                ctx.fillRect(this.x - s/2 + glitch, this.y - s/2, s, s);
                // 404 text
                ctx.fillStyle = '#FF0000';
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 20;
                ctx.font = `bold ${s/3}px monospace`;
                ctx.fillText('404', this.x - s/4, this.y + s/8);
                break;
                
            default:
                // Fallback - draw a simple square
                ctx.fillRect(this.x - s/2, this.y - s/2, s, s);
                break;
        }
        
        // Health bar (only if damaged)
        if (this.health < this.maxHealth && !this.isDying) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - s/2, this.y - s/2 - 8, s, 4);
            ctx.fillStyle = '#DC143C';
            ctx.fillRect(this.x - s/2, this.y - s/2 - 8, s * (this.health / this.maxHealth), 4);
        }
        
        ctx.restore();
    }
}

// Boss class
class Boss extends Enemy {
    constructor(x, y, type, waveNumber) {
        // Create a dummy data structure for Boss
        const bossData = BOSS_TYPES[type];
        
        // Manually set up boss without calling Enemy constructor with ENEMY_TYPES
        const tempObj = {
            id: Math.random().toString(36).substr(2, 9),
            x: x,
            y: y,
            type: type
        };
        
        Object.assign(tempObj, tempObj);
        
        // Now properly initialize
        const baseObj = Object.create(Enemy.prototype);
        baseObj.id = Math.random().toString(36).substr(2, 9);
        baseObj.x = x;
        baseObj.y = y;
        baseObj.type = type;
        baseObj.data = bossData;
        
        // Scale with wave
        const waveMultiplier = 1 + (waveNumber - 1) * 0.3;
        baseObj.maxHealth = Math.floor(bossData.health * waveMultiplier);
        baseObj.health = baseObj.maxHealth;
        baseObj.damage = Math.floor(bossData.damage * waveMultiplier);
        baseObj.speed = bossData.speed;
        baseObj.size = bossData.size;
        baseObj.xpValue = Math.floor(bossData.xpValue * waveMultiplier);
        
        baseObj.color = bossData.color;
        baseObj.accentColor = bossData.accentColor;
        
        baseObj.vx = 0;
        baseObj.vy = 0;
        baseObj.targetX = 0;
        baseObj.targetY = 0;
        
        baseObj.animTimer = 0;
        baseObj.hitFlash = 0;
        baseObj.deathTimer = 0;
        baseObj.isDying = false;
        baseObj.isDead = false;
        
        // Boss specific
        baseObj.isBoss = true;
        baseObj.attackPattern = bossData.attackPattern;
        baseObj.attackTimer = 0;
        baseObj.attackCooldown = 2000;
        baseObj.chargeSpeed = 5;
        baseObj.isCharging = false;
        baseObj.chargeTarget = { x: 0, y: 0 };
        
        baseObj.spawnMinions = bossData.spawnMinions || false;
        baseObj.minionTimer = 5000;
        
        baseObj.shootsProjectiles = bossData.shootsProjectiles || false;
        baseObj.projectileTimer = 1000;
        
        return baseObj;
    }
    
    static create(x, y, type, waveNumber) {
        const bossData = BOSS_TYPES[type];
        const boss = new Enemy(x, y, 'ZOMBIE', 1); // Dummy call
        
        // Override with boss data
        boss.id = Math.random().toString(36).substr(2, 9);
        boss.type = type;
        boss.data = bossData;
        
        const waveMultiplier = 1 + (waveNumber - 1) * 0.3;
        boss.maxHealth = Math.floor(bossData.health * waveMultiplier);
        boss.health = boss.maxHealth;
        boss.damage = Math.floor(bossData.damage * waveMultiplier);
        boss.speed = bossData.speed;
        boss.size = bossData.size;
        boss.xpValue = Math.floor(bossData.xpValue * waveMultiplier);
        
        boss.color = bossData.color;
        boss.accentColor = bossData.accentColor;
        
        // Boss specific properties
        boss.isBoss = true;
        boss.attackPattern = bossData.attackPattern;
        boss.attackTimer = 0;
        boss.attackCooldown = 2000;
        boss.chargeSpeed = 5;
        boss.isCharging = false;
        boss.chargeTarget = { x: 0, y: 0 };
        
        boss.spawnMinions = bossData.spawnMinions || false;
        boss.minionTimer = 5000;
        
        boss.shootsProjectiles = bossData.shootsProjectiles || false;
        boss.projectileTimer = 1000;
        
        boss.phasing = false;
        boss.erratic = false;
        boss.teleports = bossData.attackPattern === 'teleport';
        boss.teleportTimer = 3000;
        
        return boss;
    }
}

// XP Gem dropped by enemies
class XPGem {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.size = Math.min(6 + value / 10, 12);
        this.collected = false;
        this.lifetime = 0;
        this.maxLifetime = 30000; // 30 seconds
        
        // Determine color based on value
        if (value >= 50) {
            this.color = '#FFD700'; // Gold
        } else if (value >= 25) {
            this.color = '#9932CC'; // Purple
        } else {
            this.color = '#00FF00'; // Green
        }
        
        // Magnetic pull
        this.magnetRange = 100;
        this.magnetSpeed = 8;
    }
    
    update(deltaTime, playerX, playerY, pickupRange) {
        this.lifetime += deltaTime;
        
        if (this.lifetime > this.maxLifetime) {
            this.collected = true;
            return;
        }
        
        // Check if in pickup range
        const dist = Utils.distance(this.x, this.y, playerX, playerY);
        
        if (dist < pickupRange) {
            this.collected = true;
            return;
        }
        
        // Magnetic pull if close
        if (dist < this.magnetRange) {
            const angle = Utils.angle(this.x, this.y, playerX, playerY);
            this.x += Math.cos(angle) * this.magnetSpeed;
            this.y += Math.sin(angle) * this.magnetSpeed;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Pulsing effect
        const pulse = 1 + Math.sin(this.lifetime / 100) * 0.2;
        const s = this.size * pulse;
        
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - s);
        ctx.lineTo(this.x + s, this.y);
        ctx.lineTo(this.x, this.y + s);
        ctx.lineTo(this.x - s, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Inner shine
        ctx.fillStyle = '#FFF';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(this.x - s/4, this.y - s/4, s/2, s/2);
        
        ctx.restore();
    }
}

// Wave spawner
class WaveManager {
    constructor(canvasWidth, canvasHeight, characterBosses = null) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.currentWave = 0;
        this.enemiesRemaining = 0;
        this.enemiesKilled = 0;
        this.totalKills = 0;
        this.waveInProgress = false;
        this.betweenWaves = true;
        this.bossWave = false;
        this.bossDefeated = false;
        
        this.spawnTimer = 0;
        this.spawnInterval = 1000;
        this.enemiesToSpawn = 0;
        
        this.bossInterval = 5; // Boss every 5 waves
        this.maxWaves = 15; // Win condition
        
        // Character-specific bosses
        this.characterBosses = characterBosses || ['MEGA_ZOMBIE', 'DEMON_LORD', 'GHOST_KING', 'NIGHTMARE'];
    }
    
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveInProgress = true;
        this.betweenWaves = false;
        this.bossWave = waveNumber % this.bossInterval === 0;
        this.bossDefeated = false;
        
        // Calculate enemies for this wave
        if (this.bossWave) {
            this.enemiesToSpawn = 5 + waveNumber; // Some minions with boss
            this.enemiesRemaining = this.enemiesToSpawn + 1; // +1 for boss
        } else {
            this.enemiesToSpawn = 10 + waveNumber * 5;
            this.enemiesRemaining = this.enemiesToSpawn;
        }
        
        this.enemiesKilled = 0;
        this.spawnTimer = 0;
        this.spawnInterval = Math.max(300, 1000 - waveNumber * 50);
    }
    
    getWaveMultiplier() {
        return 1 + (this.currentWave - 1) * 0.15;
    }
    
    getSpawnPosition(playerX, playerY) {
        // Spawn from edges, away from player
        const edge = Utils.randomInt(0, 3);
        let x, y;
        const margin = 50;
        
        switch(edge) {
            case 0: // Top
                x = Utils.random(0, this.canvasWidth);
                y = -margin;
                break;
            case 1: // Right
                x = this.canvasWidth + margin;
                y = Utils.random(0, this.canvasHeight);
                break;
            case 2: // Bottom
                x = Utils.random(0, this.canvasWidth);
                y = this.canvasHeight + margin;
                break;
            case 3: // Left
                x = -margin;
                y = Utils.random(0, this.canvasHeight);
                break;
        }
        
        return { x, y };
    }
    
    getRandomEnemyType() {
        // Filter enemies by wave requirement
        const availableTypes = Object.keys(ENEMY_TYPES).filter(
            type => ENEMY_TYPES[type].minWave <= this.currentWave
        );
        
        // Weighted random selection
        const totalWeight = availableTypes.reduce(
            (sum, type) => sum + ENEMY_TYPES[type].spawnWeight, 0
        );
        
        let random = Utils.random(0, totalWeight);
        
        for (const type of availableTypes) {
            random -= ENEMY_TYPES[type].spawnWeight;
            if (random <= 0) return type;
        }
        
        return availableTypes[0];
    }
    
    getBossType() {
        // Use character-specific bosses
        const bossIndex = Math.floor((this.currentWave / this.bossInterval) - 1);
        
        // Final boss on last wave (last boss in character's list)
        if (this.currentWave >= this.maxWaves) {
            return this.characterBosses[this.characterBosses.length - 1];
        }
        
        // Cycle through character's bosses
        return this.characterBosses[bossIndex % (this.characterBosses.length - 1)];
    }
    
    spawnEnemy(playerX, playerY) {
        if (this.enemiesToSpawn <= 0) return null;
        
        const pos = this.getSpawnPosition(playerX, playerY);
        const type = this.getRandomEnemyType();
        const enemy = new Enemy(pos.x, pos.y, type, this.getWaveMultiplier());
        
        this.enemiesToSpawn--;
        return enemy;
    }
    
    spawnBoss(playerX, playerY) {
        const pos = this.getSpawnPosition(playerX, playerY);
        const type = this.getBossType();
        return Boss.create(pos.x, pos.y, type, this.currentWave);
    }
    
    enemyDied(enemy) {
        this.enemiesKilled++;
        this.totalKills++;
        this.enemiesRemaining--;
        
        if (enemy.isBoss) {
            this.bossDefeated = true;
        }
    }
    
    isWaveComplete() {
        return this.enemiesRemaining <= 0 && this.enemiesToSpawn <= 0;
    }
    
    endWave() {
        this.waveInProgress = false;
        this.betweenWaves = true;
    }
    
    isGameWon() {
        return this.currentWave >= this.maxWaves && this.isWaveComplete();
    }
}

