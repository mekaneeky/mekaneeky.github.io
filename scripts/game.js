const game = {
    map: [],
    dragonHealth: CONFIG.initialDragonHealth,
    currentViewKey: START_SECTION,

    init() {
        bindUIEvents();
        this.updatePositions();
        updateStatusBar();
        this.openSection(START_SECTION);
        displayDialog(
            "Welcome to Ali's Research Realm! Use arrow keys to move, I for inventory, space to attack, and tap the on-screen controls on phones.",
            "Start Adventure",
            hideDialog
        );
    },

    updatePositions,

    openSection(sectionKey) {
        const section = SECTIONS[sectionKey];
        if (!section) {
            return;
        }

        this.currentViewKey = sectionKey;
        displayContent(section, { sectionKey });
    },

    checkSection() {
        const currentChar = CONFIG.mapLayout[player.y][player.x];
        if (SECTIONS[currentChar]) {
            this.openSection(currentChar);
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
            displayContent({ name: "Dragon Attack", content: `The dragon breathes fire for ${damage} damage! Your health: ${player.health}` });
            updateStatusBar();
            if (player.health <= 0) {
                gameOver("The dragon has defeated you. Your research has been lost to the ages.");
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    game.init();
});
