// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Character System
// ============================================

const CHARACTERS = {
    DEATH_DEALER: {
        id: 'death_dealer',
        name: 'Derek the Death Dealer',
        description: '"I used to be an accountant. Now I account for bodies."',
        tagline: 'Balanced • Easy to Play',
        startingWeapon: 'BLOOD_SHOOTER',
        bodyColor: '#DDA0A0',
        clothColor: '#4A0000',
        hairColor: '#2F1F1F',
        bosses: ['MEGA_ZOMBIE', 'DEMON_LORD', 'GHOST_KING', 'NIGHTMARE'],
        levelTheme: {
            name: 'Cursed Graveyard',
            bgColor: '#0A0A0A',
            bgGradient: ['#0A0A0A', '#1A0A0A'],
            gridColor: '#1a1a1a',
            gridStyle: 'normal',
            particleColor: '#444',
            particleType: 'ash',
            accentColor: '#8B0000',
            decorations: 'gravestones',
            ambientGlow: '#330000'
        }
    },
    
    GRANNY_GRAVES: {
        id: 'granny_graves',
        name: 'Granny Graves',
        description: '"Back in my day, we killed demons UPHILL both ways!"',
        tagline: 'Slow but Deadly • Hard Mode',
        startingWeapon: 'REAPER_SCYTHE',
        bodyColor: '#E8D4C4',
        clothColor: '#4B0082',
        hairColor: '#C0C0C0',
        speed: 0.8,
        damage: 1.3,
        bosses: ['DENTURE_DRAGON', 'BINGO_BEAST', 'KNITTING_NIGHTMARE', 'GRANDPA_GHOUL'],
        levelTheme: {
            name: 'Haunted Mansion',
            bgColor: '#0D0811',
            bgGradient: ['#0D0811', '#1A0A20'],
            gridColor: '#1f1525',
            gridStyle: 'wallpaper',
            particleColor: '#9966CC',
            particleType: 'dust',
            accentColor: '#4B0082',
            decorations: 'cobwebs',
            ambientGlow: '#2A0040'
        }
    },
    
    EDGY_EDDIE: {
        id: 'edgy_eddie',
        name: 'Edgy Eddie',
        description: '"You wouldn\'t understand. My soul is darker than my eyeliner."',
        tagline: 'Fast • Glass Cannon',
        startingWeapon: 'SOUL_SEEKER',
        bodyColor: '#E8E8E8',
        clothColor: '#000000',
        hairColor: '#000000',
        speed: 1.3,
        health: 0.7,
        bosses: ['EMO_EMPEROR', 'DARKNESS_DADDY', 'TEARS_TITAN', 'VOID_VINCENT'],
        levelTheme: {
            name: 'The Endless Void',
            bgColor: '#000000',
            bgGradient: ['#000000', '#050008'],
            gridColor: '#0a0a0a',
            gridStyle: 'none',
            particleColor: '#8B008B',
            particleType: 'void',
            accentColor: '#FF00FF',
            decorations: 'tears',
            ambientGlow: '#1A001A'
        }
    },
    
    CHEF_CLEAVER: {
        id: 'chef_cleaver',
        name: 'Chef Cleaver',
        description: '"Tonight\'s special: YOU, served with a side of PAIN!"',
        tagline: 'Explosive • Area Damage',
        startingWeapon: 'MEAT_CANNON',
        bodyColor: '#DDB0A0',
        clothColor: '#FFFFFF',
        hairColor: '#8B4513',
        bosses: ['GLUTTON_GOLEM', 'FOOD_FIGHT_FIEND', 'KITCHEN_KRAKEN', 'HANGRY_HORROR'],
        levelTheme: {
            name: "Hell's Kitchen",
            bgColor: '#0F0805',
            bgGradient: ['#0F0805', '#1A0A05'],
            gridColor: '#2a1a10',
            gridStyle: 'checkered',
            particleColor: '#FF4500',
            particleType: 'flames',
            accentColor: '#FF6600',
            decorations: 'flames',
            ambientGlow: '#331100'
        }
    },
    
    DISCO_DAVE: {
        id: 'disco_dave',
        name: 'Disco Dave',
        description: '"Stayin\' alive? More like SLAYIN\' alive! Ah ah ah ah..."',
        tagline: 'Flashy • Multi-hit',
        startingWeapon: 'HELLFIRE_NOVA',
        bodyColor: '#DDA0D0',
        clothColor: '#FFD700',
        hairColor: '#8B4513',
        bosses: ['BOOGIE_BEAST', 'FUNKY_PHANTOM', 'RHYTHM_REAPER', 'SATURDAY_NIGHTMARE'],
        levelTheme: {
            name: 'Disco Inferno',
            bgColor: '#050510',
            bgGradient: ['#050510', '#0A0515'],
            gridColor: '#15152a',
            gridStyle: 'disco',
            particleColor: '#FFD700',
            particleType: 'sparkles',
            accentColor: '#FF1493',
            decorations: 'discoball',
            ambientGlow: '#200030'
        }
    },
    
    NERDY_NANCY: {
        id: 'nerdy_nancy',
        name: 'Nerdy Nancy',
        description: '"According to my calculations, you have a 0% chance of survival."',
        tagline: 'Strategic • Homing Attacks',
        startingWeapon: 'GHOST_CHAIN',
        bodyColor: '#F5DEB3',
        clothColor: '#4169E1',
        hairColor: '#8B0000',
        xpBonus: 1.2,
        bosses: ['ALGORITHM_ABOMINATION', 'BINARY_BEHEMOTH', 'STACK_OVERFLOW_SPECTER', 'FINAL_BOSS_404'],
        levelTheme: {
            name: 'The Digital Realm',
            bgColor: '#000A00',
            bgGradient: ['#000A00', '#001000'],
            gridColor: '#003300',
            gridStyle: 'circuit',
            particleColor: '#00FF00',
            particleType: 'code',
            accentColor: '#00FF00',
            decorations: 'binary',
            ambientGlow: '#002200'
        }
    }
};

// Character-specific boss definitions
const CHARACTER_BOSSES = {
    // Granny Graves bosses
    DENTURE_DRAGON: {
        id: 'denture_dragon',
        name: 'THE DENTURE DRAGON',
        color: '#F5F5DC',
        accentColor: '#FFB6C1',
        size: 65,
        health: 550,
        damage: 22,
        speed: 0.9,
        xpValue: 220,
        attackPattern: 'charge'
    },
    BINGO_BEAST: {
        id: 'bingo_beast',
        name: 'BINGO BEAST',
        color: '#FF69B4',
        accentColor: '#FFD700',
        size: 70,
        health: 650,
        damage: 25,
        speed: 0.8,
        xpValue: 280,
        attackPattern: 'spiral'
    },
    KNITTING_NIGHTMARE: {
        id: 'knitting_nightmare',
        name: 'THE KNITTING NIGHTMARE',
        color: '#DDA0DD',
        accentColor: '#FF0000',
        size: 60,
        health: 500,
        damage: 30,
        speed: 1.2,
        xpValue: 250,
        attackPattern: 'teleport'
    },
    GRANDPA_GHOUL: {
        id: 'grandpa_ghoul',
        name: 'GRANDPA GHOUL',
        color: '#808080',
        accentColor: '#2F4F4F',
        size: 80,
        health: 1000,
        damage: 35,
        speed: 0.7,
        xpValue: 500,
        attackPattern: 'all',
        isFinalBoss: true
    },
    
    // Edgy Eddie bosses
    EMO_EMPEROR: {
        id: 'emo_emperor',
        name: 'THE EMO EMPEROR',
        color: '#000000',
        accentColor: '#8B0000',
        size: 65,
        health: 480,
        damage: 28,
        speed: 1.3,
        xpValue: 230,
        attackPattern: 'charge'
    },
    DARKNESS_DADDY: {
        id: 'darkness_daddy',
        name: 'DARKNESS DADDY',
        color: '#1a1a1a',
        accentColor: '#4B0082',
        size: 70,
        health: 600,
        damage: 30,
        speed: 1.1,
        xpValue: 300,
        attackPattern: 'spiral'
    },
    TEARS_TITAN: {
        id: 'tears_titan',
        name: 'THE TEARS TITAN',
        color: '#4169E1',
        accentColor: '#000080',
        size: 75,
        health: 700,
        damage: 25,
        speed: 0.9,
        xpValue: 320,
        attackPattern: 'teleport'
    },
    VOID_VINCENT: {
        id: 'void_vincent',
        name: 'VOID VINCENT',
        color: '#0a0a0a',
        accentColor: '#FF00FF',
        size: 85,
        health: 1100,
        damage: 40,
        speed: 1.0,
        xpValue: 550,
        attackPattern: 'all',
        isFinalBoss: true
    },
    
    // Chef Cleaver bosses
    GLUTTON_GOLEM: {
        id: 'glutton_golem',
        name: 'THE GLUTTON GOLEM',
        color: '#DEB887',
        accentColor: '#8B4513',
        size: 80,
        health: 700,
        damage: 20,
        speed: 0.6,
        xpValue: 250,
        attackPattern: 'charge'
    },
    FOOD_FIGHT_FIEND: {
        id: 'food_fight_fiend',
        name: 'FOOD FIGHT FIEND',
        color: '#FF6347',
        accentColor: '#228B22',
        size: 65,
        health: 550,
        damage: 28,
        speed: 1.0,
        xpValue: 270,
        attackPattern: 'spiral'
    },
    KITCHEN_KRAKEN: {
        id: 'kitchen_kraken',
        name: 'THE KITCHEN KRAKEN',
        color: '#4682B4',
        accentColor: '#FF4500',
        size: 90,
        health: 800,
        damage: 25,
        speed: 0.8,
        xpValue: 350,
        attackPattern: 'teleport'
    },
    HANGRY_HORROR: {
        id: 'hangry_horror',
        name: 'THE HANGRY HORROR',
        color: '#8B0000',
        accentColor: '#FFD700',
        size: 85,
        health: 1200,
        damage: 38,
        speed: 1.1,
        xpValue: 600,
        attackPattern: 'all',
        isFinalBoss: true
    },
    
    // Disco Dave bosses
    BOOGIE_BEAST: {
        id: 'boogie_beast',
        name: 'THE BOOGIE BEAST',
        color: '#FF69B4',
        accentColor: '#00FFFF',
        size: 65,
        health: 500,
        damage: 24,
        speed: 1.4,
        xpValue: 220,
        attackPattern: 'charge'
    },
    FUNKY_PHANTOM: {
        id: 'funky_phantom',
        name: 'FUNKY PHANTOM',
        color: '#9400D3',
        accentColor: '#FFD700',
        size: 60,
        health: 450,
        damage: 22,
        speed: 1.5,
        xpValue: 240,
        attackPattern: 'teleport'
    },
    RHYTHM_REAPER: {
        id: 'rhythm_reaper',
        name: 'THE RHYTHM REAPER',
        color: '#FF4500',
        accentColor: '#32CD32',
        size: 70,
        health: 650,
        damage: 30,
        speed: 1.2,
        xpValue: 310,
        attackPattern: 'spiral'
    },
    SATURDAY_NIGHTMARE: {
        id: 'saturday_nightmare',
        name: 'SATURDAY NIGHTMARE FEVER',
        color: '#FFD700',
        accentColor: '#FF1493',
        size: 80,
        health: 950,
        damage: 35,
        speed: 1.3,
        xpValue: 520,
        attackPattern: 'all',
        isFinalBoss: true
    },
    
    // Nerdy Nancy bosses
    ALGORITHM_ABOMINATION: {
        id: 'algorithm_abomination',
        name: 'THE ALGORITHM ABOMINATION',
        color: '#00FF00',
        accentColor: '#000000',
        size: 65,
        health: 520,
        damage: 26,
        speed: 1.1,
        xpValue: 240,
        attackPattern: 'charge'
    },
    BINARY_BEHEMOTH: {
        id: 'binary_behemoth',
        name: 'BINARY BEHEMOTH',
        color: '#00FF00',
        accentColor: '#0000FF',
        size: 75,
        health: 680,
        damage: 28,
        speed: 0.9,
        xpValue: 290,
        attackPattern: 'spiral'
    },
    STACK_OVERFLOW_SPECTER: {
        id: 'stack_overflow_specter',
        name: 'STACK OVERFLOW SPECTER',
        color: '#FF8C00',
        accentColor: '#1E90FF',
        size: 70,
        health: 600,
        damage: 32,
        speed: 1.3,
        xpValue: 330,
        attackPattern: 'teleport'
    },
    FINAL_BOSS_404: {
        id: 'final_boss_404',
        name: 'ERROR 404: MERCY NOT FOUND',
        color: '#FF0000',
        accentColor: '#00FF00',
        size: 85,
        health: 1050,
        damage: 36,
        speed: 1.0,
        xpValue: 540,
        attackPattern: 'all',
        isFinalBoss: true
    }
};

// Merge character bosses into BOSS_TYPES
Object.assign(BOSS_TYPES, CHARACTER_BOSSES);

// Selected character (default)
let selectedCharacter = CHARACTERS.DEATH_DEALER;

function selectCharacter(characterId) {
    selectedCharacter = CHARACTERS[characterId];
    return selectedCharacter;
}

function getSelectedCharacter() {
    return selectedCharacter;
}

