const player = {
    x: 9,
    y: 4,
    health: CONFIG.initialPlayerHealth,
    xp: 0,
    level: 1,
    inventory: [],
    keys: 0,

    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        const targetChar = game.map[newY][newX];
        
        if (this.canMoveTo(newX, newY, targetChar)) {
            this.x = newX;
            this.y = newY;
            game.updatePositions();
            game.checkSection();
            game.checkEntity();
        }
    },

    canMoveTo(x, y, targetChar) {
        if (targetChar === '+') {
            if (this.keys > 0) {
                this.keys--;
                CONFIG.mapLayout[y] = CONFIG.mapLayout[y].substring(0, x) + ' ' + CONFIG.mapLayout[y].substring(x + 1);
                displayDialog("You've unlocked a door!", "Continue", hideDialog);
                return true;
            } else {
                displayDialog("This door is locked. You need a key to open it.", "OK", hideDialog);
                return false;
            }
        }
        return x > 0 && x < game.map[0].length - 1 && y > 0 && y < game.map.length - 1 && targetChar !== '|' && targetChar !== '-';
    },

    attackDragon() {
        if (Math.abs(this.x - CONFIG.dragonX) <= 1 && Math.abs(this.y - CONFIG.dragonY) <= 1) {
            const damage = Math.floor(Math.random() * 20) + 10;
            game.dragonHealth -= damage;
            displayContent({ name: 'Combat', content: `You attack the dragon for ${damage} damage! Dragon health: ${game.dragonHealth}` });
            if (game.dragonHealth <= 0) {
                displayContent({ name: 'Victory', content: 'You have defeated the dragon! You gain valuable research insights and 100 XP.' });
                this.gainXP(100);
                return;
            }
            game.dragonAttack();
        } else {
            displayContent({ name: 'Miss', content: 'You swing at the air. The dragon is not close enough.' });
        }
    },

    gainXP(amount) {
        this.xp += amount;
        if (this.xp >= this.level * CONFIG.levelUpThreshold) {
            this.level++;
            this.health = Math.min(this.health + CONFIG.healthRestoreOnLevelUp, 100);
            displayDialog(`Level Up! You are now level ${this.level}. Health restored by ${CONFIG.healthRestoreOnLevelUp}.`, 'Continue', hideDialog);
        }
        updateStatusBar();
    },

    useItem(item) {
        switch(item) {
            case 'Health Potion':
                this.health = Math.min(this.health + 30, 100);
                displayContent({ name: 'Item Used', content: 'You used a Health Potion. +30 Health!' });
                break;
            case 'XP Boost':
                this.gainXP(50);
                displayContent({ name: 'Item Used', content: 'You used an XP Boost. +50 XP!' });
                break;
            case 'Shield':
                this.health += 20;
                displayContent({ name: 'Item Used', content: 'You equipped a Shield. +20 Max Health!' });
                break;
            case 'Quantum Analyzer':
                displayContent({ name: 'Item Used', content: 'You used the Quantum Analyzer. It reveals hidden quantum fluctuations in the environment, but you\'re not sure how to interpret the results yet.' });
                break;
        }
        this.inventory = this.inventory.filter(i => i !== item);
        hideInventory();
        updateStatusBar();
    }
};