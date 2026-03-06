import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, EnemyCharacter } from './Character';
import type { GameState, CharacterAction } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { AudioController } from '../utils/audio';

interface BattlefieldProps {
  state: GameState;
}

// Custom hook to get the previous value of a prop or state.
function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const HitParticles = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: 0, 
            scale: Math.random() * 1.5 + 0.5,
            x: (Math.random() - 0.5) * 150,
            y: (Math.random() - 0.5) * 150
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute w-3 h-3 bg-red-500 rounded-full"
        />
      ))}
    </div>
  );
};

const Battlefield: React.FC<BattlefieldProps> = ({ state }) => {
    const { turnInProgress, turnResult, playerAction, enemyAction, showHitEffect, playerEmote, enemyEmote, playerDamageTaken, enemyDamageTaken, gameResult } = state;

    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevTurnInProgress = usePrevious(turnInProgress);
    const prevGameResult = usePrevious(gameResult);

    useEffect(() => {
        if (prevTurnInProgress === false && turnInProgress === true) {
            // Play sounds based on actions
            if (playerAction === 'load' || enemyAction?.type === 'load') {
                AudioController.playLoad();
            }
            if (playerAction === 'fire' || enemyAction?.type === 'fire') {
                AudioController.playFire();
            }
            if (playerAction === 'block' || enemyAction?.type === 'block') {
                AudioController.playBlock();
            }
        }
        
        if (prevTurnInProgress && !turnInProgress) {
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 800);
            return () => clearTimeout(timer);
        }
    }, [turnInProgress, prevTurnInProgress, playerAction, enemyAction]);

    useEffect(() => {
        if (showHitEffect) {
            AudioController.playHit();
        }
    }, [showHitEffect]);

    useEffect(() => {
        if (!prevGameResult && gameResult) {
            if (gameResult.includes('승리')) {
                AudioController.playWin();
            } else if (gameResult.includes('패배')) {
                AudioController.playLose();
            }
        }
    }, [gameResult, prevGameResult]);

    const getCharacterAction = (
        action: string | null | undefined,
        fireCount: number,
        isHit: boolean
      ): CharacterAction => {
        if (isHit) return 'hit';
        switch (action) {
          case 'fire': return fireCount >= 4 ? 'heavy-attack' : 'attack';
          case 'block': return 'block';
          case 'load': return 'load';
          default: return 'normal';
        }
      };

    const playerCharAction = getCharacterAction(playerAction, state.playerFireCount, showHitEffect === 'player' || showHitEffect === 'both');
    const enemyCharAction = getCharacterAction(enemyAction?.type, enemyAction?.count ?? 0, showHitEffect === 'enemy' || showHitEffect === 'both');

  return (
    <div className={`flex-grow flex items-center justify-around relative bg-zinc-900/30 p-4 h-full rounded-2xl border border-zinc-800/50 overflow-hidden ${isTransitioning ? 'animate-turn-transition' : ''}`}>
      <div className={`relative ${playerDamageTaken && playerDamageTaken >= 3 ? 'animate-heavy-shake' : (showHitEffect === 'player' || showHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <PlayerCharacter action={turnInProgress ? playerCharAction : 'normal'} />
        {(showHitEffect === 'player' || showHitEffect === 'both') && <HitParticles />}
        <AnimatePresence>
          {playerEmote && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-4 py-2 rounded-2xl text-2xl shadow-2xl z-20 whitespace-nowrap"
            >
              {playerEmote}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-100 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {playerDamageTaken !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-5xl font-black z-30 drop-shadow-lg"
            >
              -{playerDamageTaken}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence mode="wait">
        {turnInProgress && turnResult && (
          <motion.div 
            key={state.turnCount}
            initial={{ opacity: 0, scale: 0.5, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 1.5, y: '-50%', x: '-50%' }}
            className="absolute top-1/2 left-1/2 bg-zinc-950/80 px-8 py-4 rounded-2xl text-3xl font-black text-zinc-100 border border-zinc-800 shadow-2xl z-10 backdrop-blur-sm tracking-widest"
          >
            {turnResult}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className={`relative ${enemyDamageTaken && enemyDamageTaken >= 3 ? 'animate-heavy-shake' : (showHitEffect === 'enemy' || showHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <EnemyCharacter action={turnInProgress ? enemyCharAction : 'normal'} />
        {(showHitEffect === 'enemy' || showHitEffect === 'both') && <HitParticles />}
        <AnimatePresence>
          {enemyEmote && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-4 py-2 rounded-2xl text-2xl shadow-2xl z-20 whitespace-nowrap"
            >
              {enemyEmote}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-100 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {enemyDamageTaken !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-5xl font-black z-30 drop-shadow-lg"
            >
              -{enemyDamageTaken}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Battlefield;