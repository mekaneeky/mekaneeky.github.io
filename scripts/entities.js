const ENTITIES = {
    "?": { name: "Mystery Box", action: openMysteryBox },
    "$": { name: "Grant Funding", action: collectFunding },
    K: { name: "Key", action: collectKey }
};

function openMysteryBox() {
    const items = ["Health Potion", "XP Boost", "Shield", "Quantum Analyzer", "Key"];
    const item = items[Math.floor(Math.random() * items.length)];

    if (item === "Key") {
        player.keys++;
        displayDialog("You found a key.", "Nice", () => {
            hideDialog();
            showToast("Key added. Doors marked with + can now be unlocked.");
        });
    } else {
        player.inventory.push(item);
        displayDialog(`You found a ${item}.`, "Stash it", () => {
            hideDialog();
            showToast(`${item} added to your inventory.`);
        });
    }

    removeEntityFromMap(player.x, player.y);
}

function collectFunding() {
    const funding = Math.floor(Math.random() * 50) + 50;
    player.gainXP(funding);
    displayDialog(`You secured $${funding}K in grant funding.`, "Claim XP", () => {
        hideDialog();
        displayContent({
            name: "Funding secured",
            content: `You gained ${funding} XP from the new grant drop.`
        });
    });
    removeEntityFromMap(player.x, player.y);
}

function collectKey() {
    player.keys++;
    displayDialog("You found a key.", "Store it", () => {
        hideDialog();
        showToast("Key added. Doors marked with + can now be unlocked.");
    });
    removeEntityFromMap(player.x, player.y);
}

function removeEntityFromMap(x, y) {
    CONFIG.mapLayout[y] = CONFIG.mapLayout[y].substring(0, x) + " " + CONFIG.mapLayout[y].substring(x + 1);
}
