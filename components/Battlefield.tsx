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

    const [phase, setPhase] = useState<'idle' | 'action1' | 'action2' | 'result'>('idle');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevTurnInProgress = usePrevious(turnInProgress);

    useEffect(() => {
        if (turnInProgress) {
            setPhase('action1');
            
            const isFireBlock = (playerAction === 'fire' && enemyAction?.type === 'block') || 
                                (enemyAction?.type === 'fire' && playerAction === 'block');
                                
            if (isFireBlock) {
                const timer1 = setTimeout(() => setPhase('action2'), 600);
                const timer2 = setTimeout(() => setPhase('result'), 1200);
                return () => { clearTimeout(timer1); clearTimeout(timer2); };
            } else {
                const timer1 = setTimeout(() => setPhase('result'), 800);
                return () => clearTimeout(timer1);
            }
        } else {
            setPhase('idle');
        }
    }, [turnInProgress, playerAction, enemyAction]);

    useEffect(() => {
        if (phase === 'action1') {
            if (playerAction === 'load' || enemyAction?.type === 'load') AudioController.playLoad();
            
            const isFireBlock = (playerAction === 'fire' && enemyAction?.type === 'block') || 
                                (enemyAction?.type === 'fire' && playerAction === 'block');
            
            if (isFireBlock) {
                AudioController.playFire();
            } else {
                if (playerAction === 'fire' || enemyAction?.type === 'fire') AudioController.playFire();
                if (playerAction === 'block' || enemyAction?.type === 'block') AudioController.playBlock();
            }
        } else if (phase === 'action2') {
            const isFireBlock = (playerAction === 'fire' && enemyAction?.type === 'block') || 
                                (enemyAction?.type === 'fire' && playerAction === 'block');
            if (isFireBlock) {
                AudioController.playBlock();
            }
        } else if (phase === 'result') {
            if (showHitEffect) AudioController.playHit();
        }
    }, [phase, playerAction, enemyAction, showHitEffect]);

    useEffect(() => {
        if (prevTurnInProgress && !turnInProgress) {
            setIsTransitioning(true);
            const timer = setTimeout(() => setIsTransitioning(false), 800);
            return () => clearTimeout(timer);
        }
    }, [turnInProgress, prevTurnInProgress]);

    const playedResultSound = useRef(false);

    useEffect(() => {
        if (!turnInProgress && gameResult && !playedResultSound.current) {
            playedResultSound.current = true;
            if (gameResult.includes('승리')) {
                AudioController.playWin();
            } else if (gameResult.includes('패배')) {
                AudioController.playLose();
            }
        }
        if (!gameResult) {
            playedResultSound.current = false;
        }
    }, [gameResult, turnInProgress]);

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

    let displayPlayerAction: CharacterAction = 'normal';
    let displayEnemyAction: CharacterAction = 'normal';
    let displayShowHitEffect: 'player' | 'enemy' | 'both' | null = null;
    let displayTurnResult = '';
    let displayPlayerDamageTaken: number | null = null;
    let displayEnemyDamageTaken: number | null = null;

    if (phase === 'action1') {
        if (playerAction === 'fire' && enemyAction?.type === 'block') {
            displayPlayerAction = getCharacterAction('fire', state.playerFireCount, false);
            displayEnemyAction = 'normal';
        } else if (playerAction === 'block' && enemyAction?.type === 'fire') {
            displayPlayerAction = 'normal';
            displayEnemyAction = getCharacterAction('fire', enemyAction?.count ?? 0, false);
        } else {
            displayPlayerAction = getCharacterAction(playerAction, state.playerFireCount, false);
            displayEnemyAction = getCharacterAction(enemyAction?.type, enemyAction?.count ?? 0, false);
        }
    } else if (phase === 'action2') {
        if (playerAction === 'fire' && enemyAction?.type === 'block') {
            displayPlayerAction = 'normal';
            displayEnemyAction = getCharacterAction('block', 0, false);
        } else if (playerAction === 'block' && enemyAction?.type === 'fire') {
            displayPlayerAction = getCharacterAction('block', 0, false);
            displayEnemyAction = 'normal';
        }
    } else if (phase === 'result') {
        displayShowHitEffect = showHitEffect;
        displayPlayerAction = getCharacterAction(playerAction, state.playerFireCount, displayShowHitEffect === 'player' || displayShowHitEffect === 'both');
        displayEnemyAction = getCharacterAction(enemyAction?.type, enemyAction?.count ?? 0, displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both');
        displayTurnResult = turnResult;
        displayPlayerDamageTaken = playerDamageTaken;
        displayEnemyDamageTaken = enemyDamageTaken;
    }

  return (
    <div className={`flex-grow flex flex-row items-center justify-around relative bg-zinc-900/30 p-2 sm:p-4 h-full min-h-0 rounded-2xl border border-zinc-800/50 overflow-hidden ${isTransitioning ? 'animate-turn-transition' : ''}`}>
      <div className={`relative flex items-center justify-center h-full w-full ${displayEnemyDamageTaken && displayEnemyDamageTaken >= 3 ? 'animate-heavy-shake' : (displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <EnemyCharacter action={turnInProgress ? displayEnemyAction : 'normal'} />
        {(displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both') && <HitParticles />}
        <AnimatePresence>
          {enemyEmote && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -bottom-12 sm:-top-16 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-sm sm:text-2xl shadow-2xl z-20 whitespace-nowrap"
            >
              {enemyEmote}
              <div className="absolute -top-2 sm:-bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-zinc-100 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {displayEnemyDamageTaken !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-3xl sm:text-5xl font-black z-30 drop-shadow-lg"
            >
              -{displayEnemyDamageTaken}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {turnInProgress && displayTurnResult && (
          <motion.div 
            key={state.turnCount}
            initial={{ opacity: 0, scale: 0.5, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 1.5, y: '-50%', x: '-50%' }}
            className="absolute top-1/2 left-1/2 bg-zinc-950/80 px-4 py-2 sm:px-8 sm:py-4 rounded-2xl text-lg sm:text-3xl font-black text-zinc-100 border border-zinc-800 shadow-2xl z-10 backdrop-blur-sm tracking-widest text-center whitespace-nowrap"
          >
            {displayTurnResult}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative flex items-center justify-center h-full w-full ${displayPlayerDamageTaken && displayPlayerDamageTaken >= 3 ? 'animate-heavy-shake' : (displayShowHitEffect === 'player' || displayShowHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <PlayerCharacter action={turnInProgress ? displayPlayerAction : 'normal'} />
        {(displayShowHitEffect === 'player' || displayShowHitEffect === 'both') && <HitParticles />}
        <AnimatePresence>
          {playerEmote && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-sm sm:text-2xl shadow-2xl z-20 whitespace-nowrap"
            >
              {playerEmote}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-zinc-100 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {displayPlayerDamageTaken !== null && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-3xl sm:text-5xl font-black z-30 drop-shadow-lg"
            >
              -{displayPlayerDamageTaken}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Battlefield;