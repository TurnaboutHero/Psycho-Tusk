
import React, { useState } from 'react';
import type { GameAction } from '../types';
import HowToPlayModal from './HowToPlayModal';

interface LobbyProps {
  dispatch: React.Dispatch<GameAction>;
}

const Lobby: React.FC<LobbyProps> = ({ dispatch }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700">
          <h1 className="text-4xl font-bold text-center mb-4 text-blue-400">심리 Tusk</h1>
          <p className="text-center text-gray-400 mb-8">재치와 속임수의 게임</p>
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
