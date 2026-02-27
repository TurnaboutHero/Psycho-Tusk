import React from 'react';
import type { GameState, GameAction } from '../types';
import { calculateProgressiveDamage } from '../utils/gameUtils';
import { networkService } from '../utils/network';

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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full max-w-sm">
        <h3 className="text-lg font-bold">발사 제어 {isPlayer2 && "(플레이어 2)"}</h3>
        <div className="my-4 flex items-center justify-between">
          <span>발사할 총알 수:</span>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch({ type: 'SET_PLAYER_FIRE_COUNT', payload: Math.max(1, playerFireCount - 1) })} className="w-8 h-8 bg-gray-700 rounded">-</button>
            <span className="text-xl font-bold w-8 text-center">{playerFireCount}</span>
            <button onClick={() => dispatch({ type: 'SET_PLAYER_FIRE_COUNT', payload: Math.min(maxBullets, playerFireCount + 1) })} className="w-8 h-8 bg-gray-700 rounded">+</button>
          </div>
        </div>
        <p className="text-center text-red-400 font-bold text-xl mb-4">
          총 데미지: {calculateProgressiveDamage(playerFireCount)}
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => dispatch({ type: 'SHOW_FIRE_CONTROLS', payload: false })} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-4 rounded">취소</button>
          <button onClick={handleConfirmFire} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">발사 확인</button>
        </div>
      </div>
    </div>
  );
};

export default FireModal;
