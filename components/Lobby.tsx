
import React, { useState, useEffect } from 'react';
import type { GameAction } from '../types';
import HowToPlayModal from './HowToPlayModal';
import { networkService } from '../utils/network';
import { motion } from 'motion/react';

interface LobbyProps {
  dispatch: React.Dispatch<GameAction>;
}

const Lobby: React.FC<LobbyProps> = ({ dispatch }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
      const storedUser = localStorage.getItem('pvp_user');
      if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username);
          setIsRegistered(true);
          networkService.registerUser(user.id);
      }
  }, []);

  const handleRegister = async () => {
      if (!username.trim()) return;
      try {
          const res = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username })
          });
          const user = await res.json();
          localStorage.setItem('pvp_user', JSON.stringify(user));
          setIsRegistered(true);
          networkService.registerUser(user.id);
      } catch (e) {
          console.error("Registration failed", e);
      }
  };

  if (!isRegistered) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-100 font-sans">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-zinc-800 text-center"
            >
                <h1 className="text-4xl font-bold text-zinc-50 mb-2 tracking-tighter">심리터스크</h1>
                <p className="text-zinc-400 mb-8 text-sm">Psychological Tusk</p>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Nickname</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-950 text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 transition-colors"
                        placeholder="Enter your name"
                        onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    />
                  </div>
                  <button 
                    onClick={handleRegister} 
                    disabled={!username.trim()}
                    className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      시작하기
                  </button>
                </div>
            </motion.div>
        </div>
      );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-100 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-zinc-800"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2 text-zinc-50 tracking-tighter">심리터스크</h1>
          <p className="text-center text-zinc-400 mb-6 sm:mb-8 text-xs sm:text-sm">환영합니다, <span className="text-zinc-100 font-bold">{username}</span>님!</p>
          
          <div className="space-y-3">
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { mode: 'pve' } })} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-700/50 text-sm sm:text-base">
              PVE 모드 (AI 대전)
            </button>
            <button onClick={() => dispatch({ type: 'START_TUTORIAL' })} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-700/50 text-sm sm:text-base">
              튜토리얼
            </button>
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { mode: 'localPvp' } })} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-700/50 text-sm sm:text-base">
              로컬 PVP (핫시트)
            </button>
            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'pvp' })} className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-4 rounded-xl transition-colors text-sm sm:text-base">
              PVP 모드 (온라인)
            </button>
            <button onClick={() => dispatch({ type: 'SHOW_STATS' })} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-700/50 text-sm sm:text-base">
              전적 및 리더보드
            </button>
            <button onClick={() => setShowHowToPlay(true)} className="w-full bg-zinc-950 hover:bg-zinc-800 text-zinc-400 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-800 mt-4 text-sm sm:text-base">
              게임 방법
            </button>
          </div>
        </motion.div>
      </div>
      <HowToPlayModal show={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </>
  );
};

export default Lobby;
