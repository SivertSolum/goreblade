// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Utility Functions
// ============================================

const Utils = {
    // Random number between min and max
    random: (min, max) => Math.random() * (max - min) + min,
    
    // Random integer between min and max (inclusive)
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Distance between two points
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    
    // Angle between two points
    angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
    
    // Normalize angle to 0-2PI
    normalizeAngle: (angle) => {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    },
    
    // Clamp value between min and max
    clamp: (value, min, max) => Math.min(Math.max(value, min), max),
    
    // Linear interpolation
    lerp: (a, b, t) => a + (b - a) * t,
    
    // Check if two rectangles overlap
    rectCollision: (r1, r2) => {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    },
    
    // Check if two circles overlap
    circleCollision: (c1, c2) => {
        return Utils.distance(c1.x, c1.y, c2.x, c2.y) < c1.radius + c2.radius;
    },
    
    // Random item from array
    randomFrom: (arr) => arr[Math.floor(Math.random() * arr.length)],
    
    // Shuffle array
    shuffle: (arr) => {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Format number with commas
    formatNumber: (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    
    // Ease out quad
    easeOutQuad: (t) => t * (2 - t),
    
    // Ease in out quad
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Convert HSL to RGB hex
    hslToHex: (h, s, l) => {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
};

// Death quips for game over
const DEATH_QUIPS = [
    "Your corpse will make a fine addition to the pile.",
    "Even your mother wouldn't recognize that face now.",
    "You died as you lived: badly.",
    "Hell's waiting room is that way →",
    "Your blood type was 'loser'.",
    "That's gonna leave a mark... on the floor.",
    "You fought bravely. Just kidding, that was pathetic.",
    "Rest in pieces, literally.",
    "The monsters are fighting over your leftovers.",
    "Achievement Unlocked: Professional Corpse",
    "Your tombstone will read: 'Should have dodged'",
    "Death called. He wants his dignity back.",
    "You're not dead, you're just... extremely not alive.",
    "Game over, man! GAME OVER!",
    "Insert coin to continue... oh wait, you're broke AND dead."
];

// Boss names
const BOSS_NAMES = [
    "CAPTAIN CHUNKY GUTS",
    "LORD BUTTFACE THE FLATULENT",
    "MEATBALL SUPREME",
    "THE UNHOLY TOENAIL",
    "BARON VON STINKBUTT",
    "GRANNY DEATHFARTS",
    "SIR POOPS-A-LOT",
    "THE BELCHING HORROR",
    "KING CRUSTY III",
    "NIGHTMARE KAREN"
];

// Wave announcements
const WAVE_ANNOUNCEMENTS = [
    "Here they come, buttercup!",
    "Time to earn your grave!",
    "Hope you're wearing brown pants!",
    "They smell fear... and your BO.",
    "Wave incoming! Try not to cry.",
    "More cannon fodder arriving!",
    "The horde hungers for your face!",
    "Death approaches! Act surprised.",
    "New wave, same you getting wrecked.",
    "Incoming! Duck and pray!"
];

