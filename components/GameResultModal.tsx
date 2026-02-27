
import React, { useEffect } from 'react';
import { updatePveGameResult } from '../utils/statsManager';
import type { GameMode } from '../types';

interface GameResultModalProps {
  result: string;
  onPlayAgain: () => void;
  onLobby: () => void;
  gameMode: GameMode;
}

const GameResultModal: React.FC<GameResultModalProps> = ({ result, onPlayAgain, onLobby, gameMode }) => {
  const resultColor = result === '승리!' ? 'text-green-400' : result === '패배!' ? 'text-red-500' : 'text-yellow-400';

  useEffect(() => {
    // PVE 게임일 때만 통계를 업데이트합니다.
    if (gameMode === 'pve' && (result === '승리!' || result === '패배!' || result === '무승부!')) {
      updatePveGameResult(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 모달이 처음 표시될 때 한 번만 실행합니다.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 text-center max-w-sm border-2 border-yellow-500 shadow-lg">
        <h2 className={`text-5xl font-bold mb-6 ${resultColor}`}>{result}</h2>
        <div className="flex space-x-4 justify-center">
          <button onClick={onPlayAgain} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">
            다시하기
          </button>
          <button onClick={onLobby} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
            로비
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;
