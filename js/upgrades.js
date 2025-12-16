// ============================================
// GOREBLADE: UNHOLY SURVIVORS
// Upgrade System
// ============================================

// Stat upgrade definitions
const STAT_UPGRADES = {
    MAX_HEALTH: {
        id: 'max_health',
        name: 'More Meat',
        description: 'Increase max health by 20. You\'ll need it.',
        icon: '❤️',
        apply: (player) => {
            player.maxHealth += 20;
            player.health += 20;
        },
        maxStacks: 10
    },
    
    MOVE_SPEED: {
        id: 'move_speed',
        name: 'Hasty Legs',
        description: 'Move 10% faster. Run, you fool!',
        icon: '👟',
        apply: (player) => {
            player.speed *= 1.1;
        },
        maxStacks: 5
    },
    
    PICKUP_RANGE: {
        id: 'pickup_range',
        name: 'Soul Magnet',
        description: 'Increase pickup range by 30. Lazy but effective.',
        icon: '🧲',
        apply: (player) => {
            player.pickupRange += 30;
        },
        maxStacks: 5
    },
    
    HEAL: {
        id: 'heal',
        name: 'Mystery Meat',
        description: 'Heal 30 HP. Don\'t ask what it is.',
        icon: '🍖',
        apply: (player) => {
            player.heal(30);
        },
        maxStacks: Infinity
    },
    
    FULL_HEAL: {
        id: 'full_heal',
        name: 'Necromancer\'s Touch',
        description: 'Fully restore health. You\'re welcome.',
        icon: '💚',
        apply: (player) => {
            player.health = player.maxHealth;
        },
        maxStacks: Infinity,
        rare: true
    }
};

// Upgrade manager
class UpgradeManager {
    constructor() {
        this.upgradeStacks = {};
    }
    
    getUpgradeStacks(upgradeId) {
        return this.upgradeStacks[upgradeId] || 0;
    }
    
    canApplyUpgrade(upgradeId) {
        const upgrade = STAT_UPGRADES[upgradeId];
        if (!upgrade) return false;
        return this.getUpgradeStacks(upgradeId) < upgrade.maxStacks;
    }
    
    applyUpgrade(player, upgradeId) {
        const upgrade = STAT_UPGRADES[upgradeId];
        if (!upgrade || !this.canApplyUpgrade(upgradeId)) return false;
        
        upgrade.apply(player);
        this.upgradeStacks[upgradeId] = (this.upgradeStacks[upgradeId] || 0) + 1;
        return true;
    }
    
    // Generate upgrade choices for the shop
    generateChoices(player, count = 3) {
        const choices = [];
        
        // Determine what can be offered
        const availableWeapons = [];
        const availableUpgrades = [];
        const weaponUpgrades = [];
        
        // New weapons player doesn't have (only if not at max weapons)
        const canAddNewWeapon = player.weapons.length < player.maxWeapons;
        
        for (const type of Object.keys(WEAPON_TYPES)) {
            if (!player.hasWeapon(type) && canAddNewWeapon) {
                availableWeapons.push({
                    type: 'new_weapon',
                    weaponType: type,
                    data: WEAPON_TYPES[type]
                });
            } else if (player.hasWeapon(type)) {
                // Can upgrade existing weapon
                const level = player.getWeaponLevel(type);
                if (level < WEAPON_TYPES[type].maxLevel) {
                    weaponUpgrades.push({
                        type: 'weapon_upgrade',
                        weaponType: type,
                        data: WEAPON_TYPES[type],
                        currentLevel: level
                    });
                }
            }
        }
        
        // Stat upgrades
        for (const type of Object.keys(STAT_UPGRADES)) {
            if (this.canApplyUpgrade(type)) {
                // Don't offer heal if at full health
                if (type === 'HEAL' && player.health >= player.maxHealth) continue;
                if (type === 'FULL_HEAL' && player.health >= player.maxHealth * 0.5) continue;
                
                availableUpgrades.push({
                    type: 'stat_upgrade',
                    upgradeType: type,
                    data: STAT_UPGRADES[type]
                });
            }
        }
        
        // Build choice pool with weighted randomness
        const pool = [];
        
        // Weight new weapons highly if player has few (and can still get new weapons)
        if (canAddNewWeapon && availableWeapons.length > 0) {
            const weaponWeight = player.weapons.length < 3 ? 3 : 1;
            for (let i = 0; i < weaponWeight; i++) {
                pool.push(...availableWeapons);
            }
        }
        
        // Weapon upgrades are good
        pool.push(...weaponUpgrades);
        pool.push(...weaponUpgrades); // Double chance
        
        // Stat upgrades
        pool.push(...availableUpgrades);
        
        // Shuffle and pick
        const shuffled = Utils.shuffle(pool);
        const picked = new Set();
        
        for (const item of shuffled) {
            if (choices.length >= count) break;
            
            // Avoid duplicates
            const key = item.type + (item.weaponType || item.upgradeType);
            if (picked.has(key)) continue;
            
            picked.add(key);
            choices.push(item);
        }
        
        // If we don't have enough choices, pad with heal
        while (choices.length < count) {
            const healExists = choices.some(c => c.upgradeType === 'HEAL');
            if (!healExists && player.health < player.maxHealth) {
                choices.push({
                    type: 'stat_upgrade',
                    upgradeType: 'HEAL',
                    data: STAT_UPGRADES.HEAL
                });
            } else {
                // Add any remaining weapon upgrades
                for (const wu of weaponUpgrades) {
                    const key = wu.type + wu.weaponType;
                    if (!picked.has(key)) {
                        choices.push(wu);
                        picked.add(key);
                        break;
                    }
                }
                break;
            }
        }
        
        return choices;
    }
    
    // Apply a choice
    applyChoice(player, choice) {
        switch(choice.type) {
            case 'new_weapon':
                // Double-check we can still add a weapon
                if (player.weapons.length >= player.maxWeapons) {
                    console.warn('Cannot add weapon - at max capacity');
                    return false;
                }
                return player.addWeapon(choice.weaponType);
                
            case 'weapon_upgrade':
                const weapon = player.weapons.find(w => w.type === choice.weaponType);
                if (weapon) {
                    return weapon.levelUp();
                }
                return false;
                
            case 'stat_upgrade':
                return this.applyUpgrade(player, choice.upgradeType);
        }
        return false;
    }
    
    // Create UI card for a choice
    createChoiceCard(choice, onClick) {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        
        let icon, name, desc;
        
        switch(choice.type) {
            case 'new_weapon':
                card.classList.add('new-weapon');
                icon = choice.data.icon;
                name = `NEW: ${choice.data.name}`;
                desc = choice.data.description;
                break;
                
            case 'weapon_upgrade':
                icon = choice.data.icon;
                name = `${choice.data.name} Lv.${choice.currentLevel + 1}`;
                desc = this.getWeaponUpgradeDesc(choice.data, choice.currentLevel);
                break;
                
            case 'stat_upgrade':
                icon = choice.data.icon;
                name = choice.data.name;
                desc = choice.data.description;
                if (choice.data.rare) {
                    card.classList.add('new-weapon');
                }
                break;
        }
        
        card.innerHTML = `
            <div class="icon">${icon}</div>
            <div class="name">${name}</div>
            <div class="desc">${desc}</div>
        `;
        
        // Menu sounds
        card.addEventListener('mouseenter', () => Audio.playMenuHover());
        card.addEventListener('click', () => {
            Audio.playMenuSelect();
            onClick(choice);
        });
        
        return card;
    }
    
    getWeaponUpgradeDesc(weaponData, currentLevel) {
        const bonuses = weaponData.levelBonuses;
        const parts = [];
        
        if (bonuses.damage) {
            parts.push(`+${bonuses.damage} damage`);
        }
        if (bonuses.fireRate) {
            parts.push(`${bonuses.fireRate}ms fire rate`);
        }
        if (bonuses.projectileSize) {
            parts.push(`+${bonuses.projectileSize} projectile size`);
        }
        if (bonuses.spreadCount) {
            parts.push(`+${bonuses.spreadCount} projectile`);
        }
        if (bonuses.orbitCount) {
            parts.push(`+${bonuses.orbitCount} orbiter`);
        }
        if (bonuses.orbitRadius) {
            parts.push(`+${bonuses.orbitRadius} orbit radius`);
        }
        if (bonuses.chainCount) {
            parts.push(`+${bonuses.chainCount} chain`);
        }
        if (bonuses.explosionRadius) {
            parts.push(`+${bonuses.explosionRadius} explosion radius`);
        }
        
        return parts.join(', ') || 'Power increase!';
    }
    
    reset() {
        this.upgradeStacks = {};
    }
}

