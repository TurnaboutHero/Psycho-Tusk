import React, { useState } from 'react';
import { Shield, RefreshCw, Crosshair, MessageCircle } from 'lucide-react';
import type { GameState, GameAction, ActionType } from '../types';
import { networkService } from '../utils/network';
import { motion, AnimatePresence } from 'motion/react';
import { AudioController } from '../utils/audio';

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

  if (turnInProgress) {
      return (
          <motion.div 
              initial={{ height: 100, opacity: 1 }}
              animate={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-zinc-950 border-t border-zinc-800 overflow-hidden"
          />
      );
  }

  if (isActionDisabled) {
      return (
          <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex flex-col items-center justify-center">
              <div className="text-zinc-500 mb-2">행동 확정됨</div>
              <div className="text-2xl font-bold tracking-widest text-zinc-100 uppercase">
                  대기 중...
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
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-6 relative">
        <AnimatePresence>
          {showEmotes && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full left-0 mb-2 bg-zinc-800 p-2 rounded-xl border border-zinc-700 shadow-2xl flex gap-2 z-50"
            >
              {emotes.map((e, i) => (
                <motion.button 
                  key={i} 
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEmote(e)} 
                  className="text-xl sm:text-2xl p-1"
                >
                  {e}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={!isButtonDisabledForTutorial('load') ? { scale: 1.02 } : {}}
          whileTap={!isButtonDisabledForTutorial('load') ? { scale: 0.95 } : {}}
          animate={{
            y: selectedAction === 'load' ? -4 : 0,
            scale: selectedAction === 'load' ? 1.05 : 1
          }}
          onClick={() => { AudioController.playSelect(); setSelectedAction('load'); }}
          disabled={isButtonDisabledForTutorial('load')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-colors ${
            selectedAction === 'load' 
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'border-zinc-800 hover:border-emerald-500/50 bg-zinc-950 text-emerald-500/70'
          } ${isTutorial && highlightedAction === 'load' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          {selectedAction === 'load' && (
            <motion.div layoutId="activeGlow" className="absolute inset-0 bg-emerald-500/10 rounded-lg sm:rounded-xl blur-md -z-10" />
          )}
          <motion.div animate={{ rotate: selectedAction === 'load' ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          </motion.div>
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">장전</span>
          <div className="absolute top-1 right-1.5 flex gap-0.5">
            {Array.from({ length: Math.min(bullets, 5) }).map((_, i) => (
              <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500/50" />
            ))}
          </div>
        </motion.button>
        
        <motion.button
          whileHover={bullets > 0 && !isButtonDisabledForTutorial('fire') ? { scale: 1.02 } : {}}
          whileTap={bullets > 0 && !isButtonDisabledForTutorial('fire') ? { scale: 0.95 } : {}}
          animate={{
            y: selectedAction === 'fire' ? -4 : 0,
            scale: selectedAction === 'fire' ? 1.05 : 1
          }}
          onClick={() => { AudioController.playSelect(); setSelectedAction('fire'); setFireAmount(1); }}
          disabled={bullets <= 0 || isButtonDisabledForTutorial('fire')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-colors ${
            bullets <= 0 ? 'opacity-50 cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-600' :
            selectedAction === 'fire' 
              ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
              : 'border-zinc-800 hover:border-red-500/50 bg-zinc-950 text-red-500/70'
          } ${isTutorial && highlightedAction === 'fire' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          {selectedAction === 'fire' && (
            <motion.div layoutId="activeGlow" className="absolute inset-0 bg-red-500/10 rounded-lg sm:rounded-xl blur-md -z-10" />
          )}
          <motion.div animate={{ scale: selectedAction === 'fire' ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
            <Crosshair className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          </motion.div>
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">발사 ({bullets})</span>
          {bullets >= 5 && <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-yellow-500 text-zinc-950 text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded-full animate-pulse shadow-lg">MAX</span>}
        </motion.button>

        <motion.button
          whileHover={blockLeft > 0 && !isButtonDisabledForTutorial('block') ? { scale: 1.02 } : {}}
          whileTap={blockLeft > 0 && !isButtonDisabledForTutorial('block') ? { scale: 0.95 } : {}}
          animate={{
            y: selectedAction === 'block' ? -4 : 0,
            scale: selectedAction === 'block' ? 1.05 : 1
          }}
          onClick={() => { AudioController.playSelect(); setSelectedAction('block'); }}
          disabled={blockLeft <= 0 || isButtonDisabledForTutorial('block')}
          className={`relative flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-colors ${
            blockLeft <= 0 ? 'opacity-50 cursor-not-allowed border-zinc-900 bg-zinc-950 text-zinc-600' :
            selectedAction === 'block' 
              ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
              : 'border-zinc-800 hover:border-blue-500/50 bg-zinc-950 text-blue-500/70'
          } ${isTutorial && highlightedAction === 'block' ? 'ring-2 ring-yellow-500 animate-pulse' : ''}`}
        >
          {selectedAction === 'block' && (
            <motion.div layoutId="activeGlow" className="absolute inset-0 bg-blue-500/10 rounded-lg sm:rounded-xl blur-md -z-10" />
          )}
          <motion.div animate={{ scale: selectedAction === 'block' ? 1.1 : 1 }} transition={{ duration: 0.2 }}>
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
          </motion.div>
          <span className="font-bold tracking-wider text-[10px] sm:text-xs">반사 ({blockLeft})</span>
          <div className="absolute top-1 right-1.5 flex gap-0.5">
            {Array.from({ length: blockLeft }).map((_, i) => (
              <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500/50" />
            ))}
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {selectedAction === 'fire' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-3 sm:mb-6 p-3 sm:p-5 bg-zinc-950/80 rounded-xl border border-red-900/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
              <label className="block text-[10px] sm:text-sm font-medium text-red-400/80 mb-2 sm:mb-4 text-center tracking-wide">발사할 총알 개수를 선택하세요</label>
              <div className="flex justify-center gap-1.5 sm:gap-3">
                {Array.from({ length: bullets }, (_, i) => i + 1).map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { AudioController.playSelect(); setFireAmount(num); }}
                    className={`relative w-9 h-9 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl font-bold text-sm sm:text-xl transition-colors flex items-center justify-center ${
                      fireAmount === num
                        ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border-2 border-red-400'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-700 hover:border-red-500/50 hover:text-red-400 hover:bg-zinc-800'
                    }`}
                  >
                    {num}
                    {fireAmount === num && (
                      <motion.span layoutId="fireAmountDot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"></motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1.5 sm:gap-4 items-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmotes(!showEmotes)} 
            className="p-2.5 sm:p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6" />
          </motion.button>
          <motion.button
            whileHover={selectedAction ? { scale: 1.02 } : {}}
            whileTap={selectedAction ? { scale: 0.98 } : {}}
            onClick={submitAction}
            disabled={!selectedAction}
            className={`flex-1 font-bold rounded-xl px-3 py-2.5 sm:py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs sm:text-base ${
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
          </motion.button>
      </div>
    </div>
  );
};

export default ActionBar;
