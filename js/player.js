// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Player System
// ============================================

class Player {
    constructor(x, y, character = null) {
        this.x = x;
        this.y = y;
        this.size = 16;
        this.character = character || getSelectedCharacter();
        
        // Stats (modified by character)
        const healthMod = this.character.health || 1;
        const speedMod = this.character.speed || 1;
        this.xpBonus = this.character.xpBonus || 1;
        
        this.maxHealth = Math.floor(100 * healthMod);
        this.health = this.maxHealth;
        this.baseSpeed = 4;
        this.speed = this.baseSpeed * speedMod;
        this.pickupRange = 50;
        this.damageMultiplier = this.character.damage || 1;
        
        // Movement
        this.vx = 0;
        this.vy = 0;
        this.moveSpeed = this.speed;
        this.facing = 1; // 1 = right, -1 = left
        
        // Input
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Weapons
        this.weapons = [];
        this.maxWeapons = 4;
        
        // Combat
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 500;
        this.damageFlash = 0;
        
        // Animation
        this.animTimer = 0;
        this.walkFrame = 0;
        
        // Stats tracking
        this.totalXP = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        this.currentXP = 0;
        
        // Colors from character
        this.bodyColor = this.character.bodyColor || '#DDA0A0';
        this.clothColor = this.character.clothColor || '#4A0000';
        this.hairColor = this.character.hairColor || '#2F1F1F';
    }
    
    addWeapon(weaponType) {
        // Check if we already have this weapon
        const existing = this.weapons.find(w => w.type === weaponType);
        
        if (existing) {
            // Level up existing weapon
            return existing.levelUp();
        }
        
        // Add new weapon
        if (this.weapons.length < this.maxWeapons) {
            const weapon = new Weapon(weaponType);
            if (weapon.data.pattern === 'orbit') {
                weapon.initOrbitProjectiles(this);
            }
            this.weapons.push(weapon);
            return true;
        }
        
        return false;
    }
    
    hasWeapon(weaponType) {
        return this.weapons.some(w => w.type === weaponType);
    }
    
    getWeaponLevel(weaponType) {
        const weapon = this.weapons.find(w => w.type === weaponType);
        return weapon ? weapon.level : 0;
    }
    
    addXP(amount) {
        const bonusAmount = Math.floor(amount * this.xpBonus);
        this.totalXP += bonusAmount;
        this.currentXP += bonusAmount;
        
        // Check for level up
        if (this.currentXP >= this.xpToNextLevel) {
            this.currentXP -= this.xpToNextLevel;
            this.level++;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
            return true; // Leveled up
        }
        return false;
    }
    
    takeDamage(amount) {
        if (this.invincible) return false;
        
        this.health -= amount;
        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;
        this.damageFlash = 200;
        
        Audio.playPlayerHit();
        
        if (this.health <= 0) {
            this.health = 0;
            return true; // Dead
        }
        return false;
    }
    
    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        if (this.damageFlash > 0) {
            this.damageFlash -= deltaTime;
        }
        
        // Calculate velocity from input
        this.vx = 0;
        this.vy = 0;
        
        if (this.keys.left) this.vx -= 1;
        if (this.keys.right) this.vx += 1;
        if (this.keys.up) this.vy -= 1;
        if (this.keys.down) this.vy += 1;
        
        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx /= len;
            this.vy /= len;
        }
        
        // Apply speed
        this.vx *= this.speed;
        this.vy *= this.speed;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep in bounds
        const margin = this.size;
        this.x = Utils.clamp(this.x, margin, canvasWidth - margin);
        this.y = Utils.clamp(this.y, margin, canvasHeight - margin);
        
        // Update facing direction
        if (this.vx > 0) this.facing = 1;
        else if (this.vx < 0) this.facing = -1;
        
        // Update animation
        if (this.vx !== 0 || this.vy !== 0) {
            this.animTimer += deltaTime;
            if (this.animTimer > 100) {
                this.walkFrame = (this.walkFrame + 1) % 4;
                this.animTimer = 0;
            }
        } else {
            this.walkFrame = 0;
        }
        
        // Update orbit weapons
        for (const weapon of this.weapons) {
            if (weapon.data.pattern === 'orbit') {
                weapon.updateOrbit(deltaTime);
            }
        }
    }
    
    fireWeapons(currentTime, enemies) {
        const projectiles = [];
        
        for (const weapon of this.weapons) {
            if (weapon.data.pattern === 'orbit') continue;
            
            // Find nearest enemy for aiming
            let nearestEnemy = null;
            let nearestDist = Infinity;
            
            for (const enemy of enemies) {
                if (enemy.isDying) continue;
                const dist = Utils.distance(this.x, this.y, enemy.x, enemy.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = enemy;
                }
            }
            
            // Calculate firing angle
            let angle;
            if (nearestEnemy) {
                angle = Utils.angle(this.x, this.y, nearestEnemy.x, nearestEnemy.y);
            } else {
                angle = this.facing === 1 ? 0 : Math.PI;
            }
            
            // Fire weapon
            const newProjectiles = weapon.fire(this.x, this.y, angle, currentTime, this.vx, this.vy);
            projectiles.push(...newProjectiles);
        }
        
        return projectiles;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Invincibility flash
        if (this.invincible && Math.floor(this.invincibleTimer / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Damage flash
        if (this.damageFlash > 0) {
            ctx.fillStyle = '#FF0000';
        } else {
            ctx.fillStyle = this.bodyColor;
        }
        
        const s = this.size;
        const wobble = this.walkFrame % 2 === 1 ? 2 : 0;
        
        // Draw facing correct direction
        ctx.translate(this.x, this.y);
        ctx.scale(this.facing, 1);
        ctx.translate(-this.x, -this.y);
        
        // WHITE OUTLINE - Draw first (behind character)
        const outlineSize = 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        // Outline body
        ctx.fillRect(this.x - s/2 - outlineSize, this.y - s/4 + wobble - outlineSize, s + outlineSize*2, s + outlineSize*2);
        // Outline head
        ctx.fillRect(this.x - s/2.5 - outlineSize, this.y - s/2 - s/3 + wobble - outlineSize, s/1.2 + outlineSize*2, s/1.2 + outlineSize*2);
        ctx.shadowBlur = 0;
        
        // Body
        ctx.fillStyle = this.clothColor;
        ctx.fillRect(this.x - s/2, this.y - s/4 + wobble, s, s);
        
        // Head
        ctx.fillStyle = this.damageFlash > 0 ? '#FF0000' : this.bodyColor;
        ctx.fillRect(this.x - s/2.5, this.y - s/2 - s/3 + wobble, s/1.2, s/1.2);
        
        // Hair
        ctx.fillStyle = this.hairColor;
        ctx.fillRect(this.x - s/2.5, this.y - s/2 - s/3 + wobble, s/1.2, s/4);
        
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x - s/4, this.y - s/2 + wobble, s/5, s/5);
        ctx.fillRect(this.x + s/12, this.y - s/2 + wobble, s/5, s/5);
        
        // Eye pupils (look in facing direction)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - s/5, this.y - s/2 + s/20 + wobble, s/10, s/10);
        ctx.fillRect(this.x + s/7, this.y - s/2 + s/20 + wobble, s/10, s/10);
        
        // Legs
        ctx.fillStyle = this.clothColor;
        const legOffset = this.walkFrame === 1 ? 3 : this.walkFrame === 3 ? -3 : 0;
        ctx.fillRect(this.x - s/3, this.y + s/2 + wobble, s/4, s/3 + legOffset);
        ctx.fillRect(this.x + s/12, this.y + s/2 + wobble, s/4, s/3 - legOffset);
        
        // Arms
        ctx.fillStyle = this.bodyColor;
        ctx.fillRect(this.x - s/2 - s/6, this.y - s/6 + wobble, s/4, s/2);
        ctx.fillRect(this.x + s/2 - s/12, this.y - s/6 + wobble, s/4, s/2);
        
        ctx.restore();
        
        // Draw orbit weapons
        for (const weapon of this.weapons) {
            if (weapon.data.pattern === 'orbit') {
                weapon.drawOrbit(ctx);
            }
        }
    }
    
    // Input handlers
    handleKeyDown(key) {
        switch(key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
        }
    }
    
    handleKeyUp(key) {
        switch(key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
        }
    }
}

