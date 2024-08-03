function drawMap() {
    const gameMap = document.getElementById('game-map');
    gameMap.innerHTML = game.map.join('\n')
        .replace(/@/g, '<span class="entity">@</span>')
        .replace(/D/g, '<span class="entity">D</span>')
        .replace(/\?/g, '<span class="entity">?</span>')
        .replace(/\$/g, '<span class="entity">$</span>')
        .replace(/K/g, '<span class="entity" style="color: #ffff00;">K</span>')
        .replace(/\+/g, '<span style="color: #ff0;">+</span>');
}

function updatePositions() {
    game.map = JSON.parse(JSON.stringify(CONFIG.mapLayout));
    game.map[player.y] = game.map[player.y].substring(0, player.x) + CONFIG.playerChar + game.map[player.y].substring(player.x + 1);
    if (game.dragonHealth > 0) {
        game.map[CONFIG.dragonY] = game.map[CONFIG.dragonY].substring(0, CONFIG.dragonX) + CONFIG.dragonChar + game.map[CONFIG.dragonY].substring(CONFIG.dragonX + 1);
    }
    drawMap();
    updateStatusBar();
}