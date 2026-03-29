function getBaseTile(x, y) {
    return CONFIG.mapLayout[y]?.[x] ?? " ";
}

function getRenderedTile(x, y) {
    return game.map[y]?.[x] ?? " ";
}

function getLocationNameAt(x, y) {
    const currentTile = getRenderedTile(x, y);
    const baseTile = getBaseTile(x, y);

    if (currentTile === CONFIG.playerChar) {
        return "You";
    }

    if (currentTile === CONFIG.dragonChar) {
        return SECTIONS.D.name;
    }

    if (SECTIONS[baseTile]) {
        return SECTIONS[baseTile].name;
    }

    if (ENTITIES[baseTile]) {
        return ENTITIES[baseTile].name;
    }

    if (baseTile === "+") {
        return "Locked door";
    }

    if (baseTile === "|" || baseTile === "-") {
        return "Wall";
    }

    return "Corridor";
}

function describeTileAt(x, y) {
    const currentTile = getRenderedTile(x, y);
    const baseTile = getBaseTile(x, y);

    if (currentTile === CONFIG.dragonChar) {
        return "The dragon is here. Move next to it, then hit ACTION to fight.";
    }

    if (SECTIONS[baseTile]) {
        return `${SECTIONS[baseTile].name}: ${SECTIONS[baseTile].summary}`;
    }

    if (ENTITIES[baseTile]) {
        return `${ENTITIES[baseTile].name}: step onto it to trigger the event.`;
    }

    if (baseTile === "+") {
        return player.keys > 0
            ? "Walk into the door to unlock it with one key."
            : "Locked door. Find a key first.";
    }

    return "Move one tile at a time, or click any room label to preview it directly.";
}

function buildCellMarkup(char, x, y) {
    const baseTile = getBaseTile(x, y);
    const cellClasses = ["map-cell"];
    const isAdjacent = Math.abs(x - player.x) + Math.abs(y - player.y) === 1;
    const isActiveRoom = baseTile === game.currentViewKey;
    let displayChar = char;
    let ariaLabel = getLocationNameAt(x, y);

    if (char === CONFIG.playerChar) {
        cellClasses.push("map-cell--player");
    } else if (char === CONFIG.dragonChar) {
        cellClasses.push("map-cell--dragon");
    } else if (SECTIONS[baseTile]) {
        cellClasses.push("map-cell--section");
    } else if (ENTITIES[baseTile]) {
        cellClasses.push("map-cell--entity");
    } else if (baseTile === "+") {
        cellClasses.push("map-cell--door");
    } else if (baseTile === "|" || baseTile === "-") {
        cellClasses.push("map-cell--wall");
    } else {
        cellClasses.push("map-cell--floor");
        displayChar = "&nbsp;";
    }

    if (isAdjacent) {
        cellClasses.push("map-cell--adjacent");
    }

    if (isActiveRoom) {
        cellClasses.push("map-cell--active");
    }

    ariaLabel = `${ariaLabel} at row ${y + 1}, column ${x + 1}`;

    return `
        <button
            type="button"
            class="${cellClasses.join(" ")}"
            data-map-cell="true"
            data-x="${x}"
            data-y="${y}"
            aria-label="${ariaLabel}"
            title="${getLocationNameAt(x, y)}"
        >
            ${displayChar}
        </button>
    `;
}

function drawMap() {
    const gameMap = document.getElementById("game-map");
    const rows = [];

    for (let y = 0; y < game.map.length; y++) {
        for (let x = 0; x < game.map[y].length; x++) {
            rows.push(buildCellMarkup(game.map[y][x], x, y));
        }
    }

    gameMap.innerHTML = `
        <div class="map-grid" style="--map-cols: ${game.map[0].length};">
            ${rows.join("")}
        </div>
    `;
}

function handleMapCellClick(x, y) {
    if (x === player.x && y === player.y) {
        showToast("You are here.");
        return;
    }

    const dx = x - player.x;
    const dy = y - player.y;

    if (Math.abs(dx) + Math.abs(dy) === 1) {
        player.move(dx, dy);
        return;
    }

    const baseTile = getBaseTile(x, y);
    const currentTile = getRenderedTile(x, y);

    if (SECTIONS[baseTile]) {
        game.openSection(baseTile);
        showToast(`Opened ${SECTIONS[baseTile].name}.`);
        return;
    }

    if (currentTile === CONFIG.dragonChar || ENTITIES[baseTile] || baseTile === "+") {
        showToast(describeTileAt(x, y));
        return;
    }

    showToast("Use the pad or arrow keys to move one tile at a time.");
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
