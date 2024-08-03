const ENTITIES = {
    '?': { name: 'Mystery Box', action: openMysteryBox },
    '$': { name: 'Grant Funding', action: collectFunding },
    'K': { name: 'Key', action: collectKey }
};

function openMysteryBox() {
    const items = ['Health Potion', 'XP Boost', 'Shield', 'Quantum Analyzer', 'Key'];
    const item = items[Math.floor(Math.random() * items.length)];
    if (item === 'Key') {
        player.keys++;
        displayDialog("You found a key!", "Add to Inventory", () => {
            hideDialog();
            displayContent({ name: 'Inventory', content: "You added a key to your inventory." });
        });
    } else {
        player.inventory.push(item);
        displayDialog(`You found a ${item}!`, "Add to Inventory", () => {
            hideDialog();
            displayContent({ name: 'Inventory', content: `You added ${item} to your inventory.` });
        });
    }
    removeEntityFromMap(player.x, player.y);
}

function collectFunding() {
    const funding = Math.floor(Math.random() * 50) + 50;
    player.gainXP(funding);
    displayDialog(`You've secured $${funding}K in grant funding!`, 'Accept Funding', () => {
        hideDialog();
        displayContent({ name: 'Funding Secured', content: `You gained ${funding} XP from your new grant.` });
    });
    removeEntityFromMap(player.x, player.y);
}

function collectKey() {
    player.keys++;
    displayDialog("You found a key!", "Add to Inventory", () => {
        hideDialog();
        displayContent({ name: 'Inventory', content: "You added a key to your inventory." });
    });
    removeEntityFromMap(player.x, player.y);
}

function removeEntityFromMap(x, y) {
    CONFIG.mapLayout[y] = CONFIG.mapLayout[y].substring(0, x) + ' ' + CONFIG.mapLayout[y].substring(x + 1);
}