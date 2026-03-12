import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, EnemyCharacter } from './Character';
import type { GameState, CharacterAction } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { AudioController } from '../utils/audio';

interface BattlefieldProps {
  state: GameState;
}

function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const DustMotes = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-40">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-amber-500/50 rounded-full dust-mote"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${10 + Math.random() * 15}s`,
        }}
      />
    ))}
  </div>
);

const HitParticles = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
      {[...Array(15)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity - 100;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: Math.random() * 2 + 0.5, opacity: 1 }}
            animate={{ x, y: y + 200, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className={`absolute w-2 h-2 ${color} rotate-45`}
            style={{ filter: `drop-shadow(0 0 10px currentColor)` }}
          />
        );
      })}
    </div>
  );
};

const ReflectedProjectile = ({ direction }: { direction: 'left-to-right' | 'right-to-left' }) => {
  const color = direction === 'left-to-right' ? 'bg-cyan-400' : 'bg-red-500';
  const shadow = direction === 'left-to-right' ? 'shadow-[0_0_20px_#22d3ee]' : 'shadow-[0_0_20px_#ef4444]';
  
  return (
    <motion.div
      initial={{ x: direction === 'right-to-left' ? 100 : -100, opacity: 1, scaleX: 1 }}
      animate={{ x: direction === 'right-to-left' ? -300 : 300, opacity: 0, scaleX: 6 }}
      transition={{ duration: 0.2, ease: "easeIn" }}
      className={`absolute top-1/2 w-24 h-2 ${color} rounded-full ${shadow} z-20`}
      style={{ y: '-50%' }}
    >
      <div className="absolute inset-0 bg-white/80 rounded-full w-1/2 mx-auto" />
    </motion.div>
  );
};

const CinematicCutin = ({ type, player }: { type: 'DRAW' | 'REFLECT', player: 'player1' | 'player2' }) => {
  const isLeft = player === 'player1';
  const bgColor = isLeft ? 'bg-cyan-950' : 'bg-red-950';
  const textColor = isLeft ? 'text-cyan-400' : 'text-red-400';
  const textShadow = isLeft ? '0 0 30px rgba(34,211,238,0.8)' : '0 0 30px rgba(248,113,113,0.8)';

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} className="absolute inset-0 bg-black" />

      <motion.div
        initial={{ x: isLeft ? '-100%' : '100%', skewX: -45 }}
        animate={{ x: '0%', skewX: -45 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`absolute w-[150%] h-64 ${bgColor} border-y-4 border-white/10 flex items-center justify-center`}
      />

      <motion.div
        initial={{ scale: 4, opacity: 0, rotate: isLeft ? -10 : 10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className={`absolute font-cinematic text-8xl sm:text-[150px] font-black italic tracking-tighter ${textColor} mix-blend-screen`}
        style={{ textShadow, WebkitTextStroke: '2px white' }}
      >
        {type}
      </motion.div>
    </div>
  );
};

const RevealCutin = () => {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        className="font-cinematic text-9xl font-black italic tracking-tighter text-white mix-blend-overlay"
        style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}
      >
        VS
      </motion.div>
    </div>
  );
};

const Battlefield: React.FC<BattlefieldProps> = ({ state }) => {
    const { turnInProgress, turnResult, playerAction, enemyAction, showHitEffect, playerEmote, enemyEmote, playerDamageTaken, enemyDamageTaken, gameResult } = state;

    const [phase, setPhase] = useState<'idle' | 'reveal' | 'cinematic1' | 'action1' | 'cinematic2' | 'action2' | 'result'>('idle');
    const [cinematicData, setCinematicData] = useState<{type: 'DRAW' | 'REFLECT', player: 'player1' | 'player2'} | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevTurnInProgress = usePrevious(turnInProgress);

    useEffect(() => {
        if (turnInProgress) {
            let currentTimer = 0;
            const timers: NodeJS.Timeout[] = [];

            const isPlayerHeavy = playerAction === 'fire' && state.playerFireCount >= 4;
            const isEnemyHeavy = enemyAction?.type === 'fire' && (enemyAction?.count ?? 0) >= 4;
            const hasHeavy = isPlayerHeavy || isEnemyHeavy;

            const isFireBlock = (playerAction === 'fire' && enemyAction?.type === 'block') || 
                                (enemyAction?.type === 'fire' && playerAction === 'block');

            // Reveal Phase
            timers.push(setTimeout(() => {
                setPhase('reveal');
                setCinematicData(null);
            }, currentTimer));
            currentTimer += 500;

            // Cinematic 1 (Heavy Attack)
            if (hasHeavy) {
                timers.push(setTimeout(() => {
                    setPhase('cinematic1');
                    setCinematicData({ type: 'DRAW', player: isPlayerHeavy ? 'player1' : 'player2' });
                    AudioController.playLoad(); // Dramatic sound
                }, currentTimer));
                currentTimer += 1200;
            }

            // Action 1
            timers.push(setTimeout(() => {
                setPhase('action1');
                setCinematicData(null);
            }, currentTimer));
            currentTimer += isFireBlock ? 600 : 800;

            // Cinematic 2 (Reflect)
            if (isFireBlock) {
                timers.push(setTimeout(() => {
                    setPhase('cinematic2');
                    setCinematicData({ type: 'REFLECT', player: playerAction === 'block' ? 'player1' : 'player2' });
                    AudioController.playBlock(); // Dramatic sound
                }, currentTimer));
                currentTimer += 1000;

                // Action 2
                timers.push(setTimeout(() => {
                    setPhase('action2');
                    setCinematicData(null);
                }, currentTimer));
                currentTimer += 600;
            }

            // Result
            timers.push(setTimeout(() => {
                setPhase('result');
                setCinematicData(null);
            }, currentTimer));

            return () => timers.forEach(clearTimeout);
        } else {
            setPhase('idle');
            setCinematicData(null);
        }
    }, [turnInProgress, playerAction, enemyAction, state.playerFireCount]);

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
                setTimeout(() => AudioController.playHit(), 100);
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
    let showReflectProjectile: 'left-to-right' | 'right-to-left' | null = null;

    if (phase === 'idle') {
        displayPlayerAction = playerAction ? 'ready' : 'normal';
        displayEnemyAction = enemyAction ? 'ready' : 'normal';
    } else if (phase === 'reveal' || phase === 'cinematic1') {
        displayPlayerAction = 'ready';
        displayEnemyAction = 'ready';
    } else if (phase === 'action1' || phase === 'cinematic2') {
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
            displayEnemyAction = 'reflect';
            showReflectProjectile = 'right-to-left';
        } else if (playerAction === 'block' && enemyAction?.type === 'fire') {
            displayPlayerAction = 'reflect';
            displayEnemyAction = 'normal';
            showReflectProjectile = 'left-to-right';
        }
    } else if (phase === 'result') {
        displayShowHitEffect = showHitEffect;
        displayPlayerAction = getCharacterAction(playerAction, state.playerFireCount, displayShowHitEffect === 'player' || displayShowHitEffect === 'both');
        displayEnemyAction = getCharacterAction(enemyAction?.type, enemyAction?.count ?? 0, displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both');
        displayTurnResult = turnResult;
        displayPlayerDamageTaken = playerDamageTaken;
        displayEnemyDamageTaken = enemyDamageTaken;
    }

    const isHitStop = phase === 'action2' && (showHitEffect || (playerAction === 'fire' && enemyAction?.type === 'block') || (enemyAction?.type === 'fire' && playerAction === 'block'));

  return (
    <div className={`flex-grow flex flex-row items-center justify-around relative bg-gradient-to-b from-indigo-950 via-purple-950 to-orange-950 p-2 sm:p-4 h-full min-h-0 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] ${isTransitioning ? 'animate-turn-transition' : ''} ${isHitStop ? 'hit-stop' : ''}`}>
      <DustMotes />
      
      <AnimatePresence>
        {isHitStop && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-40 mix-blend-overlay pointer-events-none"
          />
        )}
        {phase === 'reveal' && <RevealCutin />}
      </AnimatePresence>

      {cinematicData && <CinematicCutin type={cinematicData.type} player={cinematicData.player} />}
      {showReflectProjectile && <ReflectedProjectile direction={showReflectProjectile} />}
      
      <div className={`relative flex items-center justify-center h-full w-full ${displayPlayerDamageTaken && displayPlayerDamageTaken >= 3 ? 'animate-heavy-shake' : (displayShowHitEffect === 'player' || displayShowHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-orange-500/80 uppercase tracking-widest bg-orange-950/30 border border-orange-900/50 px-2 py-0.5 rounded-full z-10">
          {state.gameMode === 'localPvp' ? '플레이어 1' : '나의 캐릭터'}
        </div>
        <PlayerCharacter action={displayPlayerAction} />
        {(displayShowHitEffect === 'player' || displayShowHitEffect === 'both') && <HitParticles color="bg-red-600" />}
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
              className="absolute top-0 left-1/2 -translate-x-1/2 text-white text-5xl sm:text-7xl font-cinematic z-30 chromatic-aberration"
            >
              -{displayPlayerDamageTaken}
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

      <div className={`relative flex items-center justify-center h-full w-full ${displayEnemyDamageTaken && displayEnemyDamageTaken >= 3 ? 'animate-heavy-shake' : (displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-red-500/80 uppercase tracking-widest bg-red-950/30 border border-red-900/50 px-2 py-0.5 rounded-full z-10">
          {state.gameMode === 'localPvp' ? '플레이어 2' : '상대방'}
        </div>
        <EnemyCharacter action={displayEnemyAction} />
        {(displayShowHitEffect === 'enemy' || displayShowHitEffect === 'both') && <HitParticles color="bg-red-500" />}
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
              className="absolute top-0 left-1/2 -translate-x-1/2 text-white text-5xl sm:text-7xl font-cinematic z-30 chromatic-aberration"
            >
              -{displayEnemyDamageTaken}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Battlefield;
