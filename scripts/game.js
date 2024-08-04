const game = {
    map: [],
    dragonHealth: CONFIG.initialDragonHealth,

    async init() {
        this.updatePositions();
        drawMap();
        updateStatusBar();
        await displayContent(SECTIONS['H']);
        displayDialog("Welcome to Dr. Pixel's Research Realm! Use arrow keys to move, 'i' for inventory, and space to interact. Find keys to unlock doors and explore!", "Start Adventure", hideDialog);
    },

    async checkSection() {
        const currentChar = CONFIG.mapLayout[player.y][player.x];
        if (SECTIONS[currentChar]) {
            await displayContent(SECTIONS[currentChar]);
        }
    },

    updatePositions,

    checkSection() {
        const currentChar = CONFIG.mapLayout[player.y][player.x];
        if (SECTIONS[currentChar]) {
            displayContent(SECTIONS[currentChar]);
        }
    },

    checkEntity() {
        const currentChar = CONFIG.mapLayout[player.y][player.x];
        if (ENTITIES[currentChar]) {
            ENTITIES[currentChar].action();
        }
    },

    dragonAttack() {
        if (Math.abs(player.x - CONFIG.dragonX) <= 2 && Math.abs(player.y - CONFIG.dragonY) <= 2) {
            const damage = Math.floor(Math.random() * 15) + 5;
            player.health -= damage;
            displayContent({ name: 'Dragon Attack', content: `The dragon breathes fire for ${damage} damage! Your health: ${player.health}` });
            if (player.health <= 0) {
                gameOver('The dragon has defeated you. Your research has been lost to the ages.');
            }
        }
    }
};

// Start the game
game.init();