const CONFIG = {
    mapLayout: [
        "+-----------------+----------+--------+",
        "|  H    R    P    |          |        |",
        "|        ?        |    ?     |   B    |",
        "|                 +          |        |",
        "|                 |          |   $    |",
        "|        ?        |    ?     |        |",
        "|          E      |          |   T    |",
        "+-----------------+----------+--------+"
    ],
    playerChar: '@',
    dragonChar: 'D',
    initialPlayerHealth: 100,
    initialDragonHealth: 100,
    dragonX: 22,
    dragonY: 3,
    levelUpThreshold: 100,
    healthRestoreOnLevelUp: 20
};

const SECTIONS = {
    'H': { name: 'Home', file: 'home.html' },
    'R': { name: 'Research', file: 'research.html' },
    'P': { name: 'Publications', file: 'publications.html' },
    'C': { name: 'Contact', file: 'contact.html' },
    'E': { name: 'Experience', file: 'experience.html' },
    'L': { name: 'Lab', file: 'lab.html' },
    'B': { name: 'Boss Room', file: 'boss-room.html' },
    'D': { name: 'Dragon\'s Den', file: 'dragons-den.html' },
    'T': { name: 'Time Machine', file: 'time-machine.html' },
    '$': { name: 'Grant Funding', file: 'grant-funding.html' }
};
