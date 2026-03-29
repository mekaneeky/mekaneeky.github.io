const player = {
    x: 9,
    y: 4,
    health: CONFIG.initialPlayerHealth,
    maxHealth: CONFIG.initialPlayerHealth,
    xp: 0,
    level: 1,
    inventory: [],
    keys: 0,

    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        const targetRow = game.map[newY];

        if (!targetRow || newX < 0 || newX >= targetRow.length) {
            showToast("The map ends there.");
            return;
        }

        const targetChar = targetRow[newX];

        if (this.canMoveTo(newX, newY, targetChar)) {
            this.x = newX;
            this.y = newY;
            game.updatePositions();
            game.checkSection();
            game.checkEntity();
        } else if (targetChar === "|" || targetChar === "-") {
            showToast("That wall is decorative, not a path.");
        }
    },

    canMoveTo(x, y, targetChar) {
        if (targetChar === "+") {
            if (this.keys > 0) {
                this.keys--;
                CONFIG.mapLayout[y] = CONFIG.mapLayout[y].substring(0, x) + " " + CONFIG.mapLayout[y].substring(x + 1);
                displayDialog("Door unlocked.", "Continue", hideDialog);
                showToast("Unlocked path opened.");
                return true;
            }

            displayDialog("This door is locked. You need a key to open it.", "OK", hideDialog);
            return false;
        }

        return (
            x > 0 &&
            x < game.map[0].length - 1 &&
            y > 0 &&
            y < game.map.length - 1 &&
            targetChar !== "|" &&
            targetChar !== "-"
        );
    },

    attackDragon() {
        if (game.dragonHealth <= 0) {
            showToast("The dragon is already down.");
            return;
        }

        if (Math.abs(this.x - CONFIG.dragonX) <= 1 && Math.abs(this.y - CONFIG.dragonY) <= 1) {
            const damage = Math.floor(Math.random() * 20) + 10;
            game.dragonHealth -= damage;
            displayContent({
                name: "Combat log",
                content: `You attack the dragon for ${damage} damage. Dragon health: ${Math.max(game.dragonHealth, 0)}.`
            });

            if (game.dragonHealth <= 0) {
                displayContent({
                    name: "Victory",
                    content: "You defeated the dragon and gained 100 XP worth of research insights."
                });
                this.gainXP(100);
                game.updatePositions();
                showToast("Dragon defeated.");
                return;
            }

            game.dragonAttack();
        } else {
            showToast("No dragon in range.");
        }
    },

    gainXP(amount) {
        this.xp += amount;
        const levelUps = [];

        while (this.xp >= this.level * CONFIG.levelUpThreshold) {
            this.level++;
            this.health = Math.min(this.health + CONFIG.healthRestoreOnLevelUp, this.maxHealth);
            levelUps.push(`Level ${this.level} reached. Integrity restored by ${CONFIG.healthRestoreOnLevelUp}.`);
        }

        if (levelUps.length > 0) {
            displayDialog(levelUps.join(" "), "Continue", hideDialog);
        }

        updateStatusBar();
    },

    useItem(item) {
        switch (item) {
            case "Health Potion":
                this.health = Math.min(this.health + 30, this.maxHealth);
                displayContent({ name: "Item used", content: "Health Potion consumed. +30 integrity." });
                break;
            case "XP Boost":
                this.gainXP(50);
                displayContent({ name: "Item used", content: "XP Boost applied. +50 XP." });
                break;
            case "Shield":
                this.maxHealth += 20;
                this.health += 20;
                displayContent({ name: "Item used", content: "Shield equipped. +20 max integrity." });
                break;
            case "Quantum Analyzer":
                displayContent({
                    name: "Item used",
                    content: "Quantum Analyzer activated. Hidden fluctuations detected, interpretation still pending."
                });
                break;
        }

        const itemIndex = this.inventory.indexOf(item);
        if (itemIndex >= 0) {
            this.inventory.splice(itemIndex, 1);
        }

        hideInventory();
        updateStatusBar();
    }
};
