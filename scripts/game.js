const game = {
    map: [],
    dragonHealth: CONFIG.initialDragonHealth,
    currentViewKey: START_SECTION,
    visitedSections: new Set(),

    init() {
        bindUIEvents();
        renderLocationDirectory();
        this.updatePositions();
        updateStatusBar();
        this.openSection(START_SECTION);
        displayDialog(
            "Welcome to the research realm. Use the directory, click room labels on the map, or move with the pad and arrow keys.",
            "Start exploring",
            hideDialog,
            "Boot sequence complete"
        );
    },

    updatePositions,

    openSection(sectionKey) {
        const section = SECTIONS[sectionKey];
        if (!section) {
            return;
        }

        this.currentViewKey = sectionKey;
        this.visitedSections.add(sectionKey);
        displayContent(section, { sectionKey, viewName: section.name });
    },

    checkSection() {
        const currentTile = CONFIG.mapLayout[player.y][player.x];
        if (SECTIONS[currentTile]) {
            this.openSection(currentTile);
        } else {
            updateStatusBar();
        }
    },

    checkEntity() {
        const currentTile = CONFIG.mapLayout[player.y][player.x];
        if (ENTITIES[currentTile]) {
            ENTITIES[currentTile].action();
        }
    },

    dragonAttack() {
        if (Math.abs(player.x - CONFIG.dragonX) <= 2 && Math.abs(player.y - CONFIG.dragonY) <= 2) {
            const damage = Math.floor(Math.random() * 15) + 5;
            player.health -= damage;
            displayContent({
                name: "Dragon attack",
                content: `The dragon breathes fire for ${damage} damage. Integrity now at ${Math.max(player.health, 0)}.`
            });
            updateStatusBar();
            if (player.health <= 0) {
                gameOver("The dragon won this round. Research notes lost to the void.");
            }
        }
    },

    getObjective() {
        if (this.dragonHealth <= 0) {
            return "Dragon cleared. The rest of the map is yours.";
        }

        if (Math.abs(player.x - CONFIG.dragonX) <= 1 && Math.abs(player.y - CONFIG.dragonY) <= 1) {
            return "Dragon nearby. Press ACTION or Space to attack.";
        }

        const currentTile = CONFIG.mapLayout[player.y][player.x];
        if (player.keys > 0) {
            return `You have ${player.keys} key${player.keys === 1 ? "" : "s"}. Walk into a + door to unlock it.`;
        }

        if (currentTile === " ") {
            return "Roam the corridor or click a room label to preview it instantly.";
        }

        if (ENTITIES[currentTile]) {
            return `${ENTITIES[currentTile].name} found. Step on it to trigger the event.`;
        }

        return "Use the directory for the fast path, or keep exploring manually.";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    game.init();
});
