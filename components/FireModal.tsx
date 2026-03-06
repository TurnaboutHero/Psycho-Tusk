import React from 'react';
import type { GameState, GameAction } from '../types';
import { networkService } from '../utils/network';
import { motion } from 'motion/react';
import { Crosshair, Minus, Plus } from 'lucide-react';

interface FireModalProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentPlayer?: 'player1' | 'player2';
}

const FireModal: React.FC<FireModalProps> = ({ state, dispatch, currentPlayer = 'player1' }) => {
  const { playerFireCount, gameMode, roomCode, playerId } = state;
  const isPlayer2 = (gameMode === 'localPvp' && currentPlayer === 'player2') || (gameMode === 'pvp' && playerId === 'player2');

  const handleConfirmFire = () => {
    const payload = { action: 'fire' as const, fireCount: playerFireCount };
    if (gameMode === 'pve' || gameMode === 'tutorial') {
        dispatch({ type: 'SET_PLAYER_ACTION', payload });
    } else if (gameMode === 'localPvp') {
        if (isPlayer2) {
            dispatch({ type: 'SET_LOCAL_OPPONENT_ACTION', payload });
        } else {
            dispatch({ type: 'SET_PLAYER_ACTION', payload });
        }
    } else if (gameMode === 'pvp' && roomCode && playerId) {
        networkService.sendAction(roomCode, playerId, payload);
        dispatch({ type: 'SHOW_FIRE_CONTROLS', payload: false });
    }
  }

  const maxBullets = isPlayer2 ? state.enemyBullets : state.playerBullets;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl w-full max-w-sm mx-4"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500/10 p-3 rounded-2xl">
            <Crosshair className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-100 tracking-tight">발사 제어</h3>
            <p className="text-sm text-zinc-500">{isPlayer2 ? "플레이어 2" : "플레이어 1"}</p>
          </div>
        </div>

        <div className="bg-zinc-950 rounded-2xl p-6 mb-8 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-6">
            <span className="text-zinc-400 font-medium">사용할 총알</span>
            <div className="flex items-center gap-4 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              <button 
                onClick={() => dispatch({ type: 'SET_PLAYER_FIRE_COUNT', payload: Math.max(1, playerFireCount - 1) })} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold w-8 text-center text-zinc-100 font-mono">{playerFireCount}</span>
              <button 
                onClick={() => dispatch({ type: 'SET_PLAYER_FIRE_COUNT', payload: Math.min(maxBullets, playerFireCount + 1) })} 
                className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
            <span className="text-zinc-400 font-medium">예상 데미지</span>
            <span className="text-3xl font-black text-red-500">
              {playerFireCount}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => dispatch({ type: 'SHOW_FIRE_CONTROLS', payload: false })} 
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 px-4 rounded-xl transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleConfirmFire} 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg shadow-red-500/20"
          >
            발사 확인
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FireModal;
