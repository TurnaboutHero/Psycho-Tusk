
import React, { useEffect } from 'react';
import { updatePveGameResult } from '../utils/statsManager';
import type { GameMode } from '../types';
import { motion } from 'motion/react';

interface GameResultModalProps {
  result: string;
  onPlayAgain: () => void;
  onLobby: () => void;
  gameMode: GameMode;
  playerId?: 'player1' | 'player2' | null;
}

const GameResultModal: React.FC<GameResultModalProps> = ({ result, onPlayAgain, onLobby, gameMode, playerId }) => {
  let displayResult = result;
  if (gameMode === 'pvp' && playerId === 'player2') {
    if (result === '승리!') displayResult = '패배!';
    else if (result === '패배!') displayResult = '승리!';
  }

  const resultColor = displayResult === '승리!' ? 'text-emerald-500' : displayResult === '패배!' ? 'text-red-500' : 'text-yellow-500';

  useEffect(() => {
    // PVE 게임일 때만 통계를 업데이트합니다.
    if (gameMode === 'pve' && (result === '승리!' || result === '패배!' || result === '무승부!')) {
      updatePveGameResult(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 모달이 처음 표시될 때 한 번만 실행합니다.

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-2xl p-6 sm:p-10 text-center w-[90%] max-w-sm border border-zinc-800 shadow-2xl"
      >
        <h2 className={`text-4xl sm:text-5xl font-bold mb-6 sm:mb-8 tracking-tighter ${resultColor}`}>{displayResult}</h2>
        <div className="flex flex-col space-y-3 justify-center">
          <button onClick={onPlayAgain} className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-6 rounded-xl transition-colors text-sm sm:text-base">
            다시하기
          </button>
          <button onClick={onLobby} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold py-3 px-6 rounded-xl transition-colors text-sm sm:text-base">
            로비로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameResultModal;
