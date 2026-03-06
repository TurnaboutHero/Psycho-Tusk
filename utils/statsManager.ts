
export interface PlayerStats {
    wins: number;
    losses: number;
    draws: number;
    rating: number;
}

export interface LeaderboardEntry {
    name: string;
    title: string;
    rating: number;
}

const STATS_STORAGE_KEY = 'psych_tusk_stats';

const defaultLeaderboard: LeaderboardEntry[] = [
    { name: '심리 마스터', title: 'The Unreadable', rating: 2000 },
    { name: '전략가 AI', title: 'The Grand Planner', rating: 1600 },
    { name: '블러핑 봇', title: 'The Deceiver', rating: 1300 },
    { name: '플레이어', title: 'The Challenger', rating: 1200 }, // Placeholder for player
    { name: '신중한 상대', title: 'The Cautious', rating: 1100 },
    { name: '초보 봇', title: 'The Learner', rating: 900 },
];

const getInitialStats = (): { playerStats: PlayerStats; leaderboard: LeaderboardEntry[] } => {
    return {
        playerStats: {
            wins: 0,
            losses: 0,
            draws: 0,
            rating: 1200, // Starting Elo
        },
        leaderboard: defaultLeaderboard,
    };
};

export const loadStats = (): { playerStats: PlayerStats; leaderboard: LeaderboardEntry[] } => {
    if (typeof window === 'undefined') {
        return getInitialStats();
    }
    try {
        const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
        if (storedStats) {
            const parsed = JSON.parse(storedStats);
            // Basic validation
            if (parsed.playerStats && parsed.leaderboard) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to load stats from localStorage", error);
    }
    return getInitialStats();
};

const saveStats = (stats: { playerStats: PlayerStats; leaderboard: LeaderboardEntry[] }) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
        console.error("Failed to save stats to localStorage", error);
    }
};

export const updatePveGameResult = (result: string) => {
    const stats = loadStats();
    const { playerStats } = stats;

    const RATING_CHANGE = 15;

    if (result === '승리!') {
        playerStats.wins += 1;
        playerStats.rating += RATING_CHANGE;
    } else if (result === '패배!') {
        playerStats.losses += 1;
        playerStats.rating = Math.max(0, playerStats.rating - RATING_CHANGE);
    } else if (result === '무승부!') {
        playerStats.draws += 1;
    }

    // Update player rating in leaderboard
    const playerEntry = stats.leaderboard.find(e => e.name === '플레이어');
    if (playerEntry) {
        playerEntry.rating = playerStats.rating;
    }

    saveStats(stats);
};
