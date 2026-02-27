import React from 'react';
import { Shield, Repeat, Crosshair, Plus, X } from 'lucide-react';
import type { GameState, GameAction, ActionType } from '../types';
import { networkService } from '../utils/network';

interface ActionBarProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentPlayer?: 'player1' | 'player2';
}

const ActionBar: React.FC<ActionBarProps> = ({ state, dispatch, currentPlayer = 'player1' }) => {
  const { gameMode, turnInProgress, playerAction, enemyAction, roomCode, playerId, highlightedAction } = state;

  const isPlayer2 = (gameMode === 'localPvp' && currentPlayer === 'player2') || (gameMode === 'pvp' && playerId === 'player2');
  const isTutorial = gameMode === 'tutorial';

  // Determine which player's stats to use
  const health = isPlayer2 ? state.enemyHealth : state.playerHealth;
  const bullets = isPlayer2 ? state.enemyBullets : state.playerBullets;
  const defenseLeft = isPlayer2 ? state.enemyDefenseLeft : state.playerDefenseLeft;
  const evadeLeft = isPlayer2 ? state.enemyEvadeLeft : state.playerEvadeLeft;
  const healLeft = isPlayer2 ? state.enemyHealLeft : state.playerHealLeft;
  
  const handleAction = (action: ActionType) => {
    if (action === 'fire') {
      dispatch({ type: 'SHOW_FIRE_CONTROLS', payload: true });
    } else {
        const payload = { action, fireCount: 0 };
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
        }
    }
  };
  
  // Disable controls if the turn is processing, OR if this specific player has already made their move.
  let myActionIsSet = false;
  if (gameMode === 'pvp') {
    myActionIsSet = (playerId === 'player1' && !!playerAction) || (playerId === 'player2' && !!enemyAction);
  } else if (gameMode === 'localPvp') {
    myActionIsSet = (isPlayer2 && !!enemyAction) || (!isPlayer2 && !!playerAction);
  } else { // PVE or Tutorial
    myActionIsSet = !!playerAction;
  }
  
  const isActionDisabled = turnInProgress || myActionIsSet;

  const isButtonDisabledForTutorial = (action: ActionType) => {
    return isTutorial && highlightedAction !== null && highlightedAction !== action;
  };
  
  const getButtonClass = (action: ActionType) => {
    if (isTutorial && highlightedAction === action) {
      return 'animate-pulse ring-2 ring-yellow-400';
    }
    return '';
  };


  return (
    <div className="bg-gray-800 p-4">
       { gameMode === 'localPvp' && 
        <div className="text-center text-lg font-bold text-yellow-300 mb-2">
            {isPlayer2 ? '플레이어 2의 턴' : '플레이어 1의 턴'}
        </div>
      }
      <div className="grid grid-cols-5 gap-2">
        <button onClick={() => handleAction('load')} disabled={isActionDisabled || isButtonDisabledForTutorial('load')} className={`flex flex-col items-center justify-center bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-2 rounded-lg disabled:opacity-50 transition ${getButtonClass('load')}`}>
          <Repeat className="w-5 h-5 mb-1" />장전
        </button>
        <button onClick={() => handleAction('fire')} disabled={isActionDisabled || bullets <= 0 || isButtonDisabledForTutorial('fire')} className={`relative flex flex-col items-center justify-center bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-2 rounded-lg disabled:opacity-50 transition ${getButtonClass('fire')}`}>
          <Crosshair className="w-5 h-5 mb-1" />발사 ({bullets})
          {bullets >= 4 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1 rounded-full animate-pulse">!</span>}
        </button>
        <button onClick={() => handleAction('defend')} disabled={isActionDisabled || defenseLeft <= 0 || isButtonDisabledForTutorial('defend')} className={`flex flex-col items-center justify-center bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-2 rounded-lg disabled:opacity-50 transition ${getButtonClass('defend')}`}>
          <Shield className="w-5 h-5 mb-1" />반사 ({defenseLeft})
        </button>
        <button onClick={() => handleAction('evade')} disabled={isActionDisabled || defenseLeft > 0 || evadeLeft <= 0 || isButtonDisabledForTutorial('evade')} className={`flex flex-col items-center justify-center bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-2 rounded-lg disabled:opacity-50 transition ${!(isActionDisabled || defenseLeft > 0 || evadeLeft <= 0) && 'animate-pulse'} ${getButtonClass('evade')}`}>
          <X className="w-5 h-5 mb-1" />회피 ({evadeLeft})
        </button>
        <button onClick={() => handleAction('heal')} disabled={isActionDisabled || health > 3 || healLeft <= 0 || isButtonDisabledForTutorial('heal')} className={`flex flex-col items-center justify-center bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-2 rounded-lg disabled:opacity-50 transition ${!(isActionDisabled || health > 3 || healLeft <= 0) && 'animate-pulse'} ${getButtonClass('heal')}`}>
          <Plus className="w-5 h-5 mb-1" />회복 ({healLeft})
        </button>
      </div>
      { isActionDisabled && !turnInProgress && gameMode === 'pvp' &&
        <p className="text-center text-yellow-300 mt-2 text-sm">상대방의 선택을 기다리는 중...</p>
      }
    </div>
  );
};

export default ActionBar;
