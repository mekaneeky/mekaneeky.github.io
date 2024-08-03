function displayContent(section) {
    const content = document.getElementById('content');
    content.innerHTML = `<h2>${section.name}</h2><p>${section.content}</p>`;
}

function updateStatusBar() {
    document.getElementById('health').textContent = `Health: ${player.health}`;
    document.getElementById('xp').textContent = `XP: ${player.xp}`;
    document.getElementById('level').textContent = `Level: ${player.level}`;
    document.getElementById('keys').textContent = `Keys: ${player.keys}`;
}

function showInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '<h2>Inventory</h2>';
    player.inventory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.textContent = item;
        itemDiv.onclick = () => player.useItem(item);
        inventoryDiv.appendChild(itemDiv);
    });
    inventoryDiv.classList.remove('hidden');
}

function hideInventory() {
    document.getElementById('inventory').classList.add('hidden');
}

function displayDialog(message, buttonText, buttonAction) {
    const dialog = document.getElementById('dialog');
    dialog.innerHTML = `
        <p>${message}</p>
        <button onclick="dialogButtonAction()">${buttonText}</button>
    `;
    dialog.classList.remove('hidden');
    window.dialogButtonAction = buttonAction;
}

function hideDialog() {
    document.getElementById('dialog').classList.add('hidden');
}

function gameOver(message) {
    displayDialog(message, 'Restart', () => {
        location.reload();
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    const toggleButton = document.getElementById('toggle-sidebar');
    toggleButton.textContent = sidebar.classList.contains('collapsed') ? '≡' : '×';
}

// Event listeners
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': player.move(0, -1); break;
        case 'ArrowDown': player.move(0, 1); break;
        case 'ArrowLeft': player.move(-1, 0); break;
        case 'ArrowRight': player.move(1, 0); break;
        case ' ': player.attackDragon(); hideDialog(); break;
        case 'i': showInventory(); break;
        case 'Escape': hideInventory(); hideDialog(); break;
        case 'Enter': hideDialog(); break;
    }
});

document.getElementById('toggle-sidebar').addEventListener('click', toggleSidebar);