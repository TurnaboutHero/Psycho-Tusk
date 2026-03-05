
import React, { useState, useEffect } from 'react';
import type { GameAction } from '../types';
import HowToPlayModal from './HowToPlayModal';
import { networkService } from '../utils/network';

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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700 text-center">
                <h1 className="text-3xl font-bold text-blue-400 mb-6">환영합니다!</h1>
                <p className="text-gray-400 mb-4">게임에서 사용할 닉네임을 입력해주세요.</p>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 mb-4 text-center"
                    placeholder="닉네임"
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
                <button onClick={handleRegister} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
                    시작하기
                </button>
            </div>
        </div>
      );
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-2 text-blue-400">심리 Tusk</h1>
          <p className="text-center text-gray-400 mb-8">환영합니다, <span className="text-yellow-400 font-bold">{username}</span>님!</p>
          <div className="space-y-4">
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { mode: 'pve' } })} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              PVE 모드 (AI 대전)
            </button>
            <button onClick={() => dispatch({ type: 'START_TUTORIAL' })} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              튜토리얼
            </button>
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { mode: 'localPvp' } })} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              로컬 PVP (핫시트)
            </button>
            <button onClick={() => dispatch({ type: 'SET_MODE', payload: 'pvp' })} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              PVP 모드 (온라인)
            </button>
            <button onClick={() => dispatch({ type: 'SHOW_STATS' })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              전적 및 리더보드
            </button>
            <button onClick={() => setShowHowToPlay(true)} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105">
              게임 방법
            </button>
          </div>
        </div>
      </div>
      <HowToPlayModal show={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
    </>
  );
};

export default Lobby;
