import React from 'react';
import { Clock } from 'lucide-react';
import type { GameMode } from '../types';

interface HeaderProps {
  gameMode: GameMode;
  roomCode: string;
  timeLeft: number;
  turnCount: number;
  isConnected?: boolean;
}

const Header: React.FC<HeaderProps> = ({ gameMode, roomCode, timeLeft, turnCount, isConnected }) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-blue-400">
            {gameMode.toUpperCase()} 모드 | {roomCode}
        </h1>
        {gameMode === 'pvp' && (
            <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? '● 연결됨' : '● 연결 끊김'}
            </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-800 px-3 py-1 rounded border border-gray-700">
          <Clock className="w-4 h-4 mr-2 text-yellow-400" />
          <span className={`font-bold ${timeLeft <= 5 && gameMode !== 'tutorial' ? "text-red-500" : "text-white"}`}>
            {gameMode === 'tutorial' ? '--' : timeLeft}초
          </span>
        </div>
        <div className="bg-gray-800 px-3 py-1 rounded border border-gray-700 font-bold">
          턴 {turnCount}
        </div>
      </div>
    </div>
  );
};

export default Header;
