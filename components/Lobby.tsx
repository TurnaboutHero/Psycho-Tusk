
import React, { useState, useEffect } from 'react';
import type { GameAction, CharacterTheme } from '../types';
import HowToPlayModal from './HowToPlayModal';
import { networkService } from '../utils/network';
import { motion } from 'motion/react';
import { themes, PlayerCharacter } from './Character';

interface LobbyProps {
  dispatch: React.Dispatch<GameAction>;
}

const Lobby: React.FC<LobbyProps> = ({ dispatch }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [appearance, setAppearance] = useState<CharacterTheme>('blue');

  useEffect(() => {
      const storedUser = localStorage.getItem('pvp_user');
      if (storedUser) {
          const user = JSON.parse(storedUser);
          setUsername(user.username);
          setIsRegistered(true);
          networkService.registerUser(user.id);
      }
      const storedAppearance = localStorage.getItem('pvp_appearance') as CharacterTheme;
      if (storedAppearance && themes[storedAppearance]) {
          setAppearance(storedAppearance);
          dispatch({ type: 'SET_APPEARANCE', payload: { player: 'player1', appearance: storedAppearance } });
      }
  }, [dispatch]);

  const handleAppearanceChange = (theme: CharacterTheme) => {
      setAppearance(theme);
      localStorage.setItem('pvp_appearance', theme);
      dispatch({ type: 'SET_APPEARANCE', payload: { player: 'player1', appearance: theme } });
  };

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
          
          <div className="flex justify-center mb-6">
            <button 
              onClick={() => setShowAppearanceModal(true)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-4 rounded-xl text-sm font-medium transition-colors border border-zinc-700/50 flex items-center gap-2"
            >
              <div className="w-6 h-6 overflow-hidden rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-700">
                <div className="scale-[0.25] origin-top">
                  <PlayerCharacter action="normal" themeType={appearance} />
                </div>
              </div>
              캐릭터 외형 변경 ({appearance})
            </button>
          </div>

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
      
      {showAppearanceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl border border-zinc-800 relative"
          >
            <button 
              onClick={() => setShowAppearanceModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-zinc-50 mb-6 tracking-tighter text-center">캐릭터 외형 선택</h2>
            
            <div className="flex gap-2 sm:gap-4 justify-center items-end flex-wrap bg-zinc-950 p-6 rounded-xl border border-zinc-800">
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => handleAppearanceChange(themeName as CharacterTheme)}
                  className={`relative p-2 rounded-xl transition-all ${appearance === themeName ? 'bg-zinc-800 ring-2 ring-zinc-500 scale-110 z-10' : 'bg-transparent hover:bg-zinc-800/50 scale-100 opacity-60 hover:opacity-100'}`}
                >
                  <div className="w-16 h-24 sm:w-20 sm:h-32 flex items-center justify-center transform origin-bottom">
                     {/* Miniature version of character */}
                     <div className="scale-50 sm:scale-75 origin-bottom pointer-events-none">
                        <PlayerCharacter action="normal" themeType={themeName as CharacterTheme} />
                     </div>
                  </div>
                  <span className="block text-[10px] sm:text-xs text-center mt-2 capitalize font-medium">{themeName}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setShowAppearanceModal(false)}
                className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-colors"
              >
                완료
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <HowToPlayModal show={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </>
  );
};

export default Lobby;
