
import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, ChevronsRight, Crown } from 'lucide-react';
import type { GameAction } from '../types';
import { loadStats, PlayerStats, LeaderboardEntry } from '../utils/statsManager';

interface StatsScreenProps {
    dispatch: React.Dispatch<GameAction>;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ dispatch }) => {
    const [stats, setStats] = useState<{ playerStats: any; leaderboard: any[] } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('pvp_user');
            let playerStats = { wins: 0, losses: 0, draws: 0, rating: 1200 };
            
            if (storedUser) {
                const user = JSON.parse(storedUser);
                try {
                    const res = await fetch(`/api/user/${user.id}`);
                    if (res.ok) {
                        playerStats = await res.json();
                    }
                } catch (e) {
                    console.error("Failed to fetch user stats", e);
                }
            }

            try {
                const res = await fetch('/api/leaderboard');
                const leaderboard = await res.json();
                setStats({ playerStats, leaderboard });
            } catch (e) {
                console.error("Failed to fetch leaderboard", e);
                setStats({ playerStats, leaderboard: [] });
            }
        };
        fetchData();
    }, []);

    if (!stats) {
        return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
    }

    const { playerStats, leaderboard } = stats;
    // Leaderboard is already sorted by server query
    const sortedLeaderboard = leaderboard;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full border border-gray-700">
                <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">전적 및 리더보드</h1>

                {/* Player Stats */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-yellow-300 mb-4">나의 전적 ({playerStats.username || 'Guest'})</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <Trophy className="mx-auto mb-2 text-green-400" size={32} />
                            <p className="text-2xl font-bold">{playerStats.wins}</p>
                            <p className="text-sm text-gray-400">승리</p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <TrendingDown className="mx-auto mb-2 text-red-400" size={32} />
                            <p className="text-2xl font-bold">{playerStats.losses}</p>
                            <p className="text-sm text-gray-400">패배</p>
                        </div>
                         <div className="bg-gray-700/50 p-4 rounded-lg">
                            <ChevronsRight className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-2xl font-bold">{playerStats.draws}</p>
                            <p className="text-sm text-gray-400">무승부</p>
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg">
                            <TrendingUp className="mx-auto mb-2 text-purple-400" size={32} />
                            <p className="text-2xl font-bold">{playerStats.rating}</p>
                            <p className="text-sm text-gray-400">레이팅</p>
                        </div>
                    </div>
                </div>

                {/* PVE Leaderboard */}
                <div>
                     <h2 className="text-2xl font-semibold text-yellow-300 mb-4">PVE 리더보드</h2>
                     <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-3">순위</th>
                                    <th className="p-3">이름</th>
                                    <th className="p-3 hidden sm:table-cell">칭호</th>
                                    <th className="p-3 text-right">레이팅</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedLeaderboard.map((entry, index) => (
                                    <tr key={index} className={`border-t border-gray-700 ${entry.username === playerStats.username ? 'bg-blue-900/50' : ''}`}>
                                        <td className="p-3 font-bold text-center w-16">
                                            {index === 0 ? <Crown className="mx-auto text-yellow-400" /> : index + 1}
                                        </td>
                                        <td className="p-3 font-semibold">{entry.username}</td>
                                        <td className="p-3 text-gray-400 hidden sm:table-cell">
                                            {entry.rating >= 2000 ? '그랜드마스터' : 
                                             entry.rating >= 1800 ? '마스터' : 
                                             entry.rating >= 1600 ? '다이아몬드' : 
                                             entry.rating >= 1400 ? '플래티넘' : 
                                             entry.rating >= 1200 ? '골드' : '실버'}
                                        </td>
                                        <td className="p-3 text-right font-mono">{entry.rating}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
                
                <div className="text-center mt-8">
                    <button onClick={() => dispatch({ type: 'GO_TO_LOBBY' })} className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition transform hover:scale-105">
                        로비로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsScreen;
