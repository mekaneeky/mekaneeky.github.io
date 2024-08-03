const CONFIG = {
    mapLayout: [
        "+-----------------+----------+--------+",
        "|  H    R    P    |          |        |",
        "|        ?        |    ?     |   B    |",
        "|                 +          |        |",
        "|                 |          |   $    |",
        "|        ?        |    ?     |        |",
        "|  C    E    L    |          |   T    |",
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
    'H': { name: 'Home', content: 'Welcome to Dr. Pixel\'s Research Realm! Explore the map to learn about my work and face challenges.' },
    'R': { name: 'Research', content: 'My current research focuses on the intersection of quantum computing and artificial intelligence.' },
    'P': { name: 'Publications', content: 'Check out my latest publications in top-tier journals and conferences.' },
    'C': { name: 'Contact', content: 'You can reach me at drpixel@quantumai.edu' },
    'E': { name: 'Education', content: 'Ph.D. in Quantum Information Science from Pixel University' },
    'L': { name: 'Lab', content: 'This is where the magic happens! My quantum computer setup and AI models are housed here.' },
    'B': { name: 'Boss Room', content: 'You\'ve entered the domain of the Research Review Committee. Prepare to defend your thesis!' },
    'D': { name: 'Dragon\'s Den', content: 'A fearsome dragon guards ancient knowledge. Defeat it to gain insights!' },
    'T': { name: 'Time Machine', content: 'A mysterious device that seems to bend the fabric of spacetime. Use with caution!' },
    '$': { name: 'Grant Funding', content: 'You\'ve discovered a cache of research funding! Your XP increases significantly.' }
};