import React, { useState } from 'react';
import { Shield, RefreshCw, Crosshair, MessageCircle } from 'lucide-react';
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
  const bullets = isPlayer2 ? state.enemyBullets : state.playerBullets;
  const blockLeft = isPlayer2 ? state.enemyBlockLeft : state.playerBlockLeft;
  
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [fireAmount, setFireAmount] = useState<number>(1);
  const [showEmotes, setShowEmotes] = useState(false);
  const emotes = ['😎', '😡', '🏳️', '🎯', '🤔', '👍'];

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

  const submitAction = () => {
      if (!selectedAction) return;
      const payload = { action: selectedAction, fireCount: selectedAction === 'fire' ? fireAmount : 0 };
      
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
      setSelectedAction(null);
  };

  const handleEmote = (emote: string) => {
    if (gameMode === 'pvp' && roomCode && playerId) {
      networkService.sendEmote(roomCode, playerId, emote);
    } else {
      dispatch({ type: 'SET_EMOTE', payload: { player: isPlayer2 ? 'player2' : 'player1', emote } });
      setTimeout(() => {
        dispatch({ type: 'CLEAR_EMOTE', payload: { player: isPlayer2 ? 'player2' : 'player1' } });
      }, 3000);
    }
    setShowEmotes(false);
  };

  if (isActionDisabled) {
      return (
          <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex flex-col items-center justify-center">
              <div className="text-zinc-500 mb-2">행동 확정됨</div>
              <div className="text-2xl font-bold tracking-widest text-zinc-100 uppercase">
                  {myActionIsSet ? '대기 중...' : '턴 진행 중...'}
              </div>
              <div className="mt-4 text-sm text-zinc-600 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {gameMode === 'pvp' ? '상대방을 기다리는 중...' : '처리 중...'}
              </div>
          </div>
      );
  }

  return (
    <div className="bg-zinc-900 p-2.5 sm:p-6 border-t border-zinc-800">
       { gameMode === 'localPvp' && 
        <div className="text-center text-xs sm:text-lg font-bold text-yellow-500 mb-2 sm:mb-4">
            {isPlayer2 ? '플레이어 2의 턴' : '플레이어 1의 턴'}
        </div>
      }
      
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-6 relative">
        {showEmotes && (
          <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 p-2 rounded-xl border border-zinc-700 shadow-2xl flex gap-2 z-50">
            {emotes.map((e, i) => (
              <button key={i} onClick={() => handleEmote(e)} className="text-xl sm:text-2xl hover:scale-125 transition-transform p-1">
                {e}
              </button>
            ))}
          </div>
        )}
        
        <button
          onClick={() => setSelectedAction('load')}
          disabled={isButtonDisabledForTutorial('load')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
            selectedAction === 'load' 
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' 
              : 'border-zinc-800 hover:border-emerald-500/50 bg-zinc-950 text-emerald-500/70'
          } ${isTutorial && highlightedAction === 'load' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">장전</span>
          <div className="absolute top-1 right-1.5 flex gap-0.5">
            {Array.from({ length: Math.min(bullets, 5) }).map((_, i) => (
              <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500/50" />
            ))}
          </div>
        </button>
        
        <button
          onClick={() => { setSelectedAction('fire'); setFireAmount(1); }}
          disabled={bullets <= 0 || isButtonDisabledForTutorial('fire')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
            bullets <= 0 ? 'opacity-50 cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-600' :
            selectedAction === 'fire' 
              ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.02]' 
              : 'border-zinc-800 hover:border-red-500/50 bg-zinc-950 text-red-500/70'
          } ${isTutorial && highlightedAction === 'fire' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          <Crosshair className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">발사 ({bullets})</span>
          {bullets >= 5 && <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-yellow-500 text-zinc-950 text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded-full animate-pulse shadow-lg">MAX</span>}
        </button>

        <button
          onClick={() => setSelectedAction('block')}
          disabled={blockLeft <= 0 || isButtonDisabledForTutorial('block')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
            blockLeft <= 0 ? 'opacity-50 cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-600' :
            selectedAction === 'block' 
              ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.02]' 
              : 'border-zinc-800 hover:border-blue-500/50 bg-zinc-950 text-blue-500/70'
          } ${isTutorial && highlightedAction === 'block' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          <Shield className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">반사 ({blockLeft})</span>
          <div className="absolute top-1 right-1.5 flex gap-0.5">
            {Array.from({ length: blockLeft }).map((_, i) => (
              <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500/50" />
            ))}
          </div>
        </button>
      </div>

      {selectedAction === 'fire' && (
        <div className="mb-3 sm:mb-6 p-3 sm:p-5 bg-zinc-950/80 rounded-xl border border-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <label className="block text-[10px] sm:text-sm font-medium text-red-400/80 mb-2 sm:mb-4 text-center tracking-wide">발사할 총알 개수를 선택하세요</label>
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {Array.from({ length: bullets }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setFireAmount(num)}
                className={`relative w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl font-bold text-sm sm:text-xl transition-all flex items-center justify-center ${
                  fireAmount === num
                    ? 'bg-red-500 text-white scale-110 shadow-[0_0_20px_rgba(239,68,68,0.4)] border-2 border-red-400'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-red-500/50 hover:text-red-400 hover:bg-zinc-800'
                }`}
              >
                {num}
                {fireAmount === num && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1.5 sm:gap-4 items-center">
          <button onClick={() => setShowEmotes(!showEmotes)} className="p-2.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={submitAction}
            disabled={!selectedAction}
            className={`flex-1 font-bold rounded-xl px-3 py-2.5 sm:py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs sm:text-base ${
              selectedAction === 'load' ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
              selectedAction === 'fire' ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
              selectedAction === 'block' ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' :
              'bg-zinc-800 text-zinc-500'
            }`}
          >
            {selectedAction === 'load' ? '장전 확정' :
             selectedAction === 'fire' ? `${fireAmount}발 발사 확정` :
             selectedAction === 'block' ? '반사 확정' :
             '행동 선택'}
          </button>
      </div>
    </div>
  );
};

export default ActionBar;
