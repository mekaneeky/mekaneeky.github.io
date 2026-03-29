const CONFIG = {
    mapLayout: [
        "+-----------------+----------+--------+",
        "|  H    R    P    |          |        |",
        "|        ?        |    ?     |   B    |",
        "|                 +          +        |",
        "|                 |          |   $    |",
        "|        ?        |    ?     |        |",
        "|          E      |          |   T    |",
        "+-----------------+----------+--------+"
    ],
    playerChar: "@",
    dragonChar: "D",
    initialPlayerHealth: 100,
    initialDragonHealth: 100,
    dragonX: 22,
    dragonY: 3,
    levelUpThreshold: 100,
    healthRestoreOnLevelUp: 20
};

const START_SECTION = "H";
const SECTION_ORDER = ["H", "R", "P", "E", "L", "C", "B", "D", "T", "$"];

const SECTIONS = {
    H: {
        name: "Home Base",
        file: "home.html",
        summary: "Quick orientation, links, and the cleanest path through the site.",
        tier: "core"
    },
    R: {
        name: "Research",
        file: "research.html",
        summary: "Current projects, problem spaces, and where the curiosity is pointed.",
        tier: "core"
    },
    P: {
        name: "Publications",
        file: "publications.html",
        summary: "Selected papers, posters, and research outputs.",
        tier: "core"
    },
    C: {
        name: "Contact",
        file: "contact.html",
        summary: "Where the active work lives and the easiest places to find it.",
        tier: "core"
    },
    E: {
        name: "Experience",
        file: "experience.html",
        summary: "Education, previous roles, and the practical path here.",
        tier: "core"
    },
    L: {
        name: "Lab",
        file: "lab.html",
        summary: "Experiments, dashboards, and rough edges that are worth seeing.",
        tier: "core"
    },
    B: {
        name: "Boss Room",
        file: "boss-room.html",
        summary: "The hardest research problems currently worth wrestling with.",
        tier: "bonus"
    },
    D: {
        name: "Dragon's Den",
        file: "dragons-den.html",
        summary: "High-risk experiments, weird ideas, and the mascot for all of it.",
        tier: "bonus"
    },
    T: {
        name: "Time Machine",
        file: "time-machine.html",
        summary: "A shorter timeline view for people who prefer the fast version.",
        tier: "bonus"
    },
    $: {
        name: "Grant Funding",
        file: "grant-funding.html",
        summary: "Where extra time, compute, and support would get deployed next.",
        tier: "bonus"
    }
};
