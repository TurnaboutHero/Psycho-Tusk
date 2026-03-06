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
    <div className="flex justify-between items-center w-full">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
            {gameMode.toUpperCase()} <span className="text-zinc-500 font-normal">| {roomCode}</span>
        </h1>
        {gameMode === 'pvp' && (
            <span className={`text-xs font-medium mt-1 ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                {isConnected ? '● 연결됨' : '● 연결 끊김'}
            </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
          <Clock className="w-4 h-4 mr-2 text-zinc-400" />
          <span className={`font-mono font-bold ${timeLeft <= 5 && gameMode !== 'tutorial' ? "text-red-500 animate-pulse" : "text-zinc-100"}`}>
            {gameMode === 'tutorial' ? '--' : timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
