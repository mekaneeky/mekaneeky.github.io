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
        <div class="content-stack">
            <section class="content-block content-block--system">
                <p class="content-kicker">System update</p>
                <h2>${escapeHtml(section.name || "Update")}</h2>
                <p>${escapeHtml(section.content || "No details available.")}</p>
            </section>
        </div>
    `;
}

async function getSectionMarkup(section) {
    if (section.file) {
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

    return renderSystemMessage(section);
}

async function displayContent(section, options = {}) {
    const content = document.getElementById("content");
    const viewName = options.viewName || section.name || "Console";
    document.getElementById("viewing-room").textContent = viewName;
    content.innerHTML = `<div class="content-loading">Loading ${escapeHtml(viewName)}...</div>`;

    try {
        content.innerHTML = await getSectionMarkup(section);
    } catch (error) {
        console.error("Could not load content:", error);
        content.innerHTML = `
            <div class="content-stack">
                <section class="content-block content-block--error">
                    <p class="content-kicker">Load failure</p>
                    <h2>${escapeHtml(viewName)}</h2>
                    <p>Sorry, this room did not load correctly.</p>
                    <p class="small-print">${escapeHtml(error.message)}</p>
                </section>
            </div>
        `;
    }

    if (options.sectionKey) {
        game.currentViewKey = options.sectionKey;
        syncActiveSectionButtons(options.sectionKey);
    }

    updateStatusBar();
}

function updateStatusBar() {
    document.getElementById("health").textContent = `${player.health}/${player.maxHealth}`;
    document.getElementById("xp").textContent = `${player.xp}`;
    document.getElementById("level").textContent = `${player.level}`;
    document.getElementById("keys").textContent = `${player.keys}`;
    document.getElementById("visited-count").textContent = `${game.visitedSections.size}`;
    document.getElementById("current-room").textContent = getLocationNameAt(player.x, player.y);
    document.getElementById("objective-text").textContent = game.getObjective();
}

function renderLocationDirectory() {
    const directory = document.getElementById("location-directory");
    const groups = [
        { label: "Core rooms", keys: SECTION_ORDER.filter((key) => SECTIONS[key].tier === "core") },
        { label: "Side quests", keys: SECTION_ORDER.filter((key) => SECTIONS[key].tier === "bonus") }
    ];

    directory.innerHTML = groups
        .map(
            (group) => `
                <div class="directory-group">
                    <div class="directory-group-label">${group.label}</div>
                    ${group.keys
                        .map((key) => {
                            const section = SECTIONS[key];
                            return `
                                <button type="button" class="directory-button" data-open-section="${key}">
                                    <span class="directory-button-key">${key}</span>
                                    <span class="directory-button-copy">
                                        <strong>${escapeHtml(section.name)}</strong>
                                        <span>${escapeHtml(section.summary)}</span>
                                    </span>
                                </button>
                            `;
                        })
                        .join("")}
                </div>
            `
        )
        .join("");
}

function syncActiveSectionButtons(activeSectionKey) {
    document.querySelectorAll("[data-open-section]").forEach((button) => {
        const isActive = button.dataset.openSection === activeSectionKey;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
}

function showInventory() {
    const inventoryDiv = document.getElementById("inventory");
    const itemsMarkup =
        player.inventory.length === 0
            ? `<p class="small-print">Inventory is empty. Mystery boxes tend to fix that.</p>`
            : `
                <div class="inventory-list">
                    ${player.inventory
                        .map(
                            (item) => `
                                <div class="inventory-item">
                                    <div>
                                        <strong>${escapeHtml(item)}</strong>
                                    </div>
                                    <button type="button" data-use-item="${escapeHtml(item)}">Use</button>
                                </div>
                            `
                        )
                        .join("")}
                </div>
            `;

    inventoryDiv.innerHTML = `
        <div class="modal-card">
            <div class="modal-header">
                <h2 id="inventory-title">Inventory</h2>
                <button type="button" class="ghost-button" data-action="close-inventory">Close</button>
            </div>
            <p class="small-print">Keys are tracked in the status bar. Inventory items can be consumed here.</p>
            ${itemsMarkup}
        </div>
    `;
    inventoryDiv.classList.remove("hidden");
}

function hideInventory() {
    document.getElementById("inventory").classList.add("hidden");
}

function displayDialog(message, buttonText = "Continue", buttonAction = hideDialog, title = "Terminal message") {
    const dialog = document.getElementById("dialog");
    dialogAction = buttonAction;
    dialog.innerHTML = `
        <div class="modal-card">
            <div class="modal-header">
                <h2 id="dialog-title">${escapeHtml(title)}</h2>
                <button type="button" class="ghost-button" data-action="close-dialog">Close</button>
            </div>
            <p>${escapeHtml(message)}</p>
            <div class="modal-actions">
                <button type="button" data-action="run-dialog">${escapeHtml(buttonText)}</button>
            </div>
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
    }, "Game over");
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggle-sidebar");
    const collapsed = sidebar.classList.toggle("collapsed");
    toggleButton.textContent = collapsed ? "Show map" : "Hide map";
    toggleButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
}

function showToast(message) {
    const toastRegion = document.getElementById("toast-region");
    toastRegion.innerHTML = `<div class="toast">${escapeHtml(message)}</div>`;
    window.clearTimeout(toastTimeoutId);
    toastTimeoutId = window.setTimeout(() => {
        toastRegion.innerHTML = "";
    }, 2500);
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
            case "hide-dialog":
                hideDialog();
                hideInventory();
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
