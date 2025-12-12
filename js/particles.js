// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Particle System
// ============================================

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        
        this.vx = options.vx || Utils.random(-2, 2);
        this.vy = options.vy || Utils.random(-2, 2);
        this.gravity = options.gravity || 0;
        this.friction = options.friction || 0.98;
        
        this.size = options.size || Utils.random(2, 6);
        this.color = options.color || '#DC143C';
        
        this.lifetime = 0;
        this.maxLifetime = options.lifetime || Utils.random(300, 600);
        
        this.fadeOut = options.fadeOut !== false;
        this.shrink = options.shrink !== false;
        
        this.isDead = false;
    }
    
    update(deltaTime) {
        this.lifetime += deltaTime;
        
        if (this.lifetime >= this.maxLifetime) {
            this.isDead = true;
            return;
        }
        
        // Apply physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx) {
        const progress = this.lifetime / this.maxLifetime;
        
        ctx.save();
        
        // Fade out
        if (this.fadeOut) {
            ctx.globalAlpha = 1 - progress;
        }
        
        // Calculate current size
        let currentSize = this.size;
        if (this.shrink) {
            currentSize = this.size * (1 - progress);
        }
        
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - currentSize / 2,
            this.y - currentSize / 2,
            currentSize,
            currentSize
        );
        
        ctx.restore();
    }
}

// Particle system manager
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    addParticle(particle) {
        if (this.particles.length < this.maxParticles) {
            this.particles.push(particle);
        }
    }
    
    // Blood splatter effect
    bloodSplatter(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(2, 6);
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(3, 8),
                color: Utils.randomFrom(['#DC143C', '#8B0000', '#B22222', '#FF0000']),
                gravity: 0.1,
                lifetime: Utils.random(400, 800)
            }));
        }
    }
    
    // Bigger gore explosion for deaths
    goreExplosion(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(3, 8);
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(4, 12),
                color: Utils.randomFrom(['#DC143C', '#8B0000', '#4A0000', '#800000', '#556B2F']),
                gravity: 0.15,
                lifetime: Utils.random(500, 1000)
            }));
        }
        
        // Add some bone/flesh chunks
        for (let i = 0; i < count / 3; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(2, 5);
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Utils.random(6, 10),
                color: Utils.randomFrom(['#F5F5DC', '#DDA0A0', '#8B4513']),
                gravity: 0.2,
                lifetime: Utils.random(600, 1200),
                shrink: false
            }));
        }
    }
    
    // XP collect sparkle
    xpSparkle(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = 3;
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4,
                color: Utils.randomFrom(['#9932CC', '#BA55D3', '#DA70D6', '#FF00FF']),
                gravity: 0,
                friction: 0.95,
                lifetime: 300
            }));
        }
    }
    
    // Player damage flash
    damageFlash(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const speed = Utils.random(4, 8);
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(4, 8),
                color: '#FF0000',
                gravity: 0,
                friction: 0.9,
                lifetime: 200
            }));
        }
    }
    
    // Explosion effect
    explosion(x, y, radius = 60, color = '#FF4500') {
        const count = Math.floor(radius / 2);
        
        for (let i = 0; i < count; i++) {
            const angle = Utils.random(0, Math.PI * 2);
            const dist = Utils.random(0, radius);
            const px = x + Math.cos(angle) * dist * 0.3;
            const py = y + Math.sin(angle) * dist * 0.3;
            const speed = Utils.random(2, 6);
            
            this.addParticle(new Particle(px, py, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(6, 14),
                color: Utils.randomFrom([color, '#FFD700', '#FF6347', '#FFA500']),
                gravity: 0.05,
                friction: 0.95,
                lifetime: Utils.random(300, 600)
            }));
        }
    }
    
    // Level up effect
    levelUpBurst(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = Utils.random(5, 10);
            
            this.addParticle(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(4, 8),
                color: Utils.randomFrom(['#FFD700', '#FFA500', '#FFFF00', '#FF4500']),
                gravity: 0,
                friction: 0.92,
                lifetime: 500
            }));
        }
    }
    
    // Ghost chain effect
    chainLightning(x1, y1, x2, y2, color = '#4169E1') {
        const segments = 5;
        const dx = (x2 - x1) / segments;
        const dy = (y2 - y1) / segments;
        
        for (let i = 0; i < segments; i++) {
            const px = x1 + dx * i + Utils.random(-10, 10);
            const py = y1 + dy * i + Utils.random(-10, 10);
            
            this.addParticle(new Particle(px, py, {
                vx: Utils.random(-1, 1),
                vy: Utils.random(-1, 1),
                size: Utils.random(3, 6),
                color: color,
                gravity: 0,
                lifetime: 150,
                fadeOut: true
            }));
        }
    }
    
    // Boss death mega explosion
    bossExplosion(x, y) {
        // Multiple waves of explosions
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                this.goreExplosion(x + Utils.random(-30, 30), y + Utils.random(-30, 30), 30);
                this.explosion(x, y, 100, '#DC143C');
            }, wave * 200);
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            
            if (this.particles[i].isDead) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    clear() {
        this.particles = [];
    }
}

