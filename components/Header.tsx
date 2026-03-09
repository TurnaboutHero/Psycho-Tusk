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
        <h1 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
            {gameMode.toUpperCase()} <span className="text-zinc-500 font-normal">| {roomCode}</span>
        </h1>
        {gameMode === 'pvp' && (
            <span className={`text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 ${isConnected ? 'text-emerald-500' : 'text-red-500'}`}>
                {isConnected ? '● 연결됨' : '● 연결 끊김'}
            </span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center bg-zinc-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-zinc-800">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-zinc-400" />
          <span className={`font-mono text-sm sm:text-base font-bold ${timeLeft <= 5 && gameMode !== 'tutorial' ? "text-red-500 animate-pulse" : "text-zinc-100"}`}>
            {gameMode === 'tutorial' ? '--' : timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
