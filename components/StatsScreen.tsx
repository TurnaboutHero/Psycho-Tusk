
import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, ChevronsRight, Crown, ArrowLeft } from 'lucide-react';
import type { GameAction } from '../types';
import { motion } from 'motion/react';

interface StatsScreenProps {
    dispatch: React.Dispatch<GameAction>;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ dispatch }) => {
    const [stats, setStats] = useState<{ playerStats: any; leaderboard: any[] } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('pvp_user');
            let playerStats = { wins: 0, losses: 0, draws: 0, rating: 1200, username: '' };
            
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
        return <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 font-sans">데이터를 불러오는 중...</div>;
    }

    const { playerStats, leaderboard } = stats;
    const sortedLeaderboard = leaderboard;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full bg-zinc-950 text-zinc-100 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-4xl border border-zinc-800"
            >
                <div className="flex justify-between items-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">전적 및 리더보드</h1>
                    <button 
                        onClick={() => dispatch({ type: 'GO_TO_LOBBY' })} 
                        className="flex items-center gap-1 sm:gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm sm:text-base"
                    >
                        <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">로비로 돌아가기</span>
                    </button>
                </div>

                {/* Player Stats */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-lg sm:text-xl font-semibold text-zinc-300 mb-4 sm:mb-6 flex items-center gap-2">
                        <span>나의 전적</span>
                        <span className="text-xs sm:text-sm font-normal text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">{playerStats.username || 'Guest'}</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
                        <div className="bg-zinc-950/50 p-4 sm:p-6 rounded-xl border border-zinc-800/50">
                            <Trophy className="mx-auto mb-2 sm:mb-3 text-emerald-500 w-6 h-6 sm:w-7 sm:h-7" />
                            <p className="text-2xl sm:text-3xl font-bold font-mono">{playerStats.wins}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mt-1">승리</p>
                        </div>
                        <div className="bg-zinc-950/50 p-4 sm:p-6 rounded-xl border border-zinc-800/50">
                            <TrendingDown className="mx-auto mb-2 sm:mb-3 text-red-500 w-6 h-6 sm:w-7 sm:h-7" />
                            <p className="text-2xl sm:text-3xl font-bold font-mono">{playerStats.losses}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mt-1">패배</p>
                        </div>
                         <div className="bg-zinc-950/50 p-4 sm:p-6 rounded-xl border border-zinc-800/50">
                            <ChevronsRight className="mx-auto mb-2 sm:mb-3 text-zinc-500 w-6 h-6 sm:w-7 sm:h-7" />
                            <p className="text-2xl sm:text-3xl font-bold font-mono">{playerStats.draws}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mt-1">무승부</p>
                        </div>
                        <div className="bg-zinc-950/50 p-4 sm:p-6 rounded-xl border border-zinc-800/50">
                            <TrendingUp className="mx-auto mb-2 sm:mb-3 text-amber-500 w-6 h-6 sm:w-7 sm:h-7" />
                            <p className="text-2xl sm:text-3xl font-bold font-mono">{playerStats.rating}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider mt-1">레이팅</p>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div>
                     <h2 className="text-lg sm:text-xl font-semibold text-zinc-300 mb-4 sm:mb-6">글로벌 랭킹 TOP 10</h2>
                     <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-800">
                                <tr>
                                    <th className="p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider w-16 text-center">순위</th>
                                    <th className="p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider">이름</th>
                                    <th className="p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">티어</th>
                                    <th className="p-4 text-xs font-medium text-zinc-500 uppercase tracking-wider text-right">레이팅</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {sortedLeaderboard.map((entry, index) => (
                                    <tr key={index} className={`transition-colors hover:bg-zinc-800/30 ${entry.username === playerStats.username ? 'bg-zinc-800/50' : ''}`}>
                                        <td className="p-4 font-bold text-center">
                                            {index === 0 ? <Crown className="mx-auto text-amber-400" size={20} /> : 
                                             index === 1 ? <span className="text-zinc-300">{index + 1}</span> :
                                             index === 2 ? <span className="text-amber-700">{index + 1}</span> :
                                             <span className="text-zinc-600">{index + 1}</span>}
                                        </td>
                                        <td className="p-4 font-medium text-zinc-200">
                                            {entry.username}
                                            {entry.username === playerStats.username && <span className="ml-2 text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">나</span>}
                                        </td>
                                        <td className="p-4 text-sm hidden sm:table-cell">
                                            {entry.rating >= 2000 ? <span className="text-purple-400 font-medium">그랜드마스터</span> : 
                                             entry.rating >= 1800 ? <span className="text-red-400 font-medium">마스터</span> : 
                                             entry.rating >= 1600 ? <span className="text-blue-400 font-medium">다이아몬드</span> : 
                                             entry.rating >= 1400 ? <span className="text-emerald-400 font-medium">플래티넘</span> : 
                                             entry.rating >= 1200 ? <span className="text-amber-400 font-medium">골드</span> : 
                                             <span className="text-zinc-400 font-medium">실버</span>}
                                        </td>
                                        <td className="p-4 text-right font-mono text-zinc-300">{entry.rating}</td>
                                    </tr>
                                ))}
                                {sortedLeaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            아직 랭킹 데이터가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StatsScreen;
