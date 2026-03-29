const sectionCache = new Map();
let dialogAction = hideDialog;
let toastTimeoutId = null;

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function renderSystemMessage(section) {
    return `
        <div class="content-block">
            <h2>${escapeHtml(section.name || "Update")}</h2>
            <p>${escapeHtml(section.content || "No details available.")}</p>
        </div>
    `;
}

async function getSectionMarkup(section) {
    if (!section.file) {
        return renderSystemMessage(section);
    }

    if (sectionCache.has(section.file)) {
        return sectionCache.get(section.file);
    }

    const response = await fetch(section.file);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }

    const markup = await response.text();
    sectionCache.set(section.file, markup);
    return markup;
}

async function displayContent(section, options = {}) {
    const content = document.getElementById("content");
    content.innerHTML = `<p>Loading...</p>`;

    try {
        content.innerHTML = await getSectionMarkup(section);
    } catch (error) {
        console.error("Could not load content:", error);
        content.innerHTML = `
            <div class="content-block">
                <h2>${escapeHtml(section.name || "Error")}</h2>
                <p>Sorry, the content could not be loaded.</p>
            </div>
        `;
    }

    if (options.sectionKey) {
        game.currentViewKey = options.sectionKey;
    }

    updateStatusBar();
}

function updateStatusBar() {
    document.getElementById("health").textContent = `Health: ${player.health}`;
    document.getElementById("xp").textContent = `XP: ${player.xp}`;
    document.getElementById("level").textContent = `Level: ${player.level}`;
    document.getElementById("keys").textContent = `Keys: ${player.keys}`;
}

function showInventory() {
    const inventoryDiv = document.getElementById("inventory");
    const itemsMarkup = player.inventory.length === 0
        ? "<p>Inventory is empty.</p>"
        : player.inventory.map((item) => `
            <div class="inventory-item">
                <span>${escapeHtml(item)}</span>
                <button type="button" data-use-item="${escapeHtml(item)}">Use</button>
            </div>
        `).join("");

    inventoryDiv.innerHTML = `
        <h2>Inventory</h2>
        ${itemsMarkup}
        <div class="modal-actions">
            <button type="button" data-action="close-inventory">Close</button>
        </div>
    `;
    inventoryDiv.classList.remove("hidden");
}

function hideInventory() {
    document.getElementById("inventory").classList.add("hidden");
}

function displayDialog(message, buttonText = "Continue", buttonAction = hideDialog, title = "Message") {
    const dialog = document.getElementById("dialog");
    dialogAction = buttonAction;
    dialog.innerHTML = `
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="modal-actions">
            <button type="button" data-action="run-dialog">${escapeHtml(buttonText)}</button>
            <button type="button" data-action="close-dialog">Close</button>
        </div>
    `;
    dialog.classList.remove("hidden");
}

function hideDialog() {
    document.getElementById("dialog").classList.add("hidden");
}

function gameOver(message) {
    displayDialog(message, "Restart", () => {
        window.location.reload();
    }, "Game Over");
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggle-sidebar");
    const collapsed = sidebar.classList.toggle("collapsed");
    toggleButton.textContent = collapsed ? "≡" : "x";
    toggleButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function showToast(message) {
    const toastRegion = document.getElementById("toast-region");
    toastRegion.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
        toastRegion.innerHTML = "";
    }, 2200);
}

function handleDocumentKeydown(event) {
    if (event.target.closest("input, textarea")) {
        return;
    }

    switch (event.key) {
        case "ArrowUp":
            event.preventDefault();
            player.move(0, -1);
            break;
        case "ArrowDown":
            event.preventDefault();
            player.move(0, 1);
            break;
        case "ArrowLeft":
            event.preventDefault();
            player.move(-1, 0);
            break;
        case "ArrowRight":
            event.preventDefault();
            player.move(1, 0);
            break;
        case " ":
            event.preventDefault();
            player.attackDragon();
            hideDialog();
            break;
        case "i":
        case "I":
            showInventory();
            break;
        case "Escape":
            hideInventory();
            hideDialog();
            break;
        case "Enter":
            if (!document.getElementById("dialog").classList.contains("hidden")) {
                dialogAction();
            }
            break;
    }
}

function handleDocumentClick(event) {
    const openSectionButton = event.target.closest("[data-open-section]");
    if (openSectionButton) {
        game.openSection(openSectionButton.dataset.openSection);
        return;
    }

    const moveButton = event.target.closest("[data-move]");
    if (moveButton) {
        const moves = {
            up: [0, -1],
            down: [0, 1],
            left: [-1, 0],
            right: [1, 0]
        };
        const [dx, dy] = moves[moveButton.dataset.move];
        player.move(dx, dy);
        return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
        switch (actionButton.dataset.action) {
            case "inventory":
                showInventory();
                return;
            case "interact":
                player.attackDragon();
                return;
            case "close-inventory":
                hideInventory();
                return;
            case "close-dialog":
                hideDialog();
                return;
            case "run-dialog":
                dialogAction();
                return;
        }
    }

    const mapCell = event.target.closest("[data-map-cell='true']");
    if (mapCell) {
        handleMapCellClick(Number(mapCell.dataset.x), Number(mapCell.dataset.y));
        return;
    }

    const useItemButton = event.target.closest("[data-use-item]");
    if (useItemButton) {
        player.useItem(useItemButton.dataset.useItem);
        return;
    }

    if (event.target.id === "toggle-sidebar") {
        toggleSidebar();
    }
}

function bindUIEvents() {
    if (document.body.dataset.uiBound === "true") {
        return;
    }

    document.body.dataset.uiBound = "true";
    document.addEventListener("keydown", handleDocumentKeydown);
    document.addEventListener("click", handleDocumentClick);
}
