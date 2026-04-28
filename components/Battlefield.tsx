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

const CyberGrid = () => (
  <div className="absolute inset-0 pointer-events-none perspective-[1000px] flex justify-center items-end overflow-hidden opacity-30">
    <div className="w-[300%] h-[150%] bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:3rem_3rem] [transform:rotateX(75deg)_translateY(10%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
  </div>
);

const HexagonGrid = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
          <path d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons)" className="text-zinc-400" />
    </svg>
  </div>
);

const HitParticles = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40">
      {[...Array(15)].map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 100;
        const x = Math.cos(angle) * velocity;
        const y = Math.sin(angle) * velocity - 100;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: Math.random() * 2 + 0.5, opacity: 1 }}
            animate={{ x, y: y + 100, scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute w-1 h-8 ${color} rounded-full`}
            style={{ filter: `drop-shadow(0 0 10px currentColor)`, transform: `rotate(${angle}rad)` }}
          />
        );
      })}
    </div>
  );
};

const LaserProjectile = ({ direction, isHeavy }: { direction: 'left-to-right' | 'right-to-left', isHeavy?: boolean }) => {
  const isLeft = direction === 'left-to-right';
  const colorClass = isLeft ? 'bg-cyan-400' : 'bg-red-500';
  const shadowColor = isLeft ? '#22d3ee' : '#ef4444';
  
  return (
    <motion.div
      initial={{ x: isLeft ? -150 : 150, opacity: 1, scaleX: 1 }}
      animate={{ x: isLeft ? 150 : -150, opacity: 0, scaleX: isHeavy ? 10 : 5 }}
      transition={{ duration: 0.1, ease: "linear" }}
      className={`absolute top-[45%] w-16 ${isHeavy ? 'h-6' : 'h-3'} ${colorClass} rounded-full z-20`}
      style={{ y: '-50%', filter: `drop-shadow(0 0 ${isHeavy ? '40px' : '20px'} ${shadowColor})`, boxShadow: `0 0 ${isHeavy ? '50px' : '30px'} ${shadowColor}` }}
    >
      <div className={`absolute inset-0 ${isHeavy ? 'bg-white' : 'bg-white/90'} rounded-full w-2/3 mx-auto`} />
    </motion.div>
  );
};

const ReflectedProjectile = ({ direction }: { direction: 'left-to-right' | 'right-to-left' }) => {
  const isLeft = direction === 'left-to-right';
  const colorClass = isLeft ? 'bg-cyan-400' : 'bg-red-500';
  const shadowColor = isLeft ? '#22d3ee' : '#ef4444';
  
  return (
    <motion.div
      initial={{ x: isLeft ? -100 : 100, opacity: 1, scaleX: 1 }}
      animate={{ x: isLeft ? 300 : -300, opacity: 0, scaleX: 8 }}
      transition={{ duration: 0.15, ease: "linear" }}
      className={`absolute top-1/2 w-12 h-3 ${colorClass} rounded-full z-20`}
      style={{ y: '-50%', filter: `drop-shadow(0 0 20px ${shadowColor})`, boxShadow: `0 0 30px ${shadowColor}` }}
    >
      <div className="absolute inset-0 bg-white/90 rounded-full w-2/3 mx-auto" />
    </motion.div>
  );
};

const CinematicCutin = ({ type, player }: { type: 'DRAW' | 'REFLECT', player: 'player1' | 'player2' }) => {
  const isLeft = player === 'player1';
  const bgColor = isLeft ? 'bg-blue-900' : 'bg-red-900';
  const textColor = isLeft ? 'text-blue-200' : 'text-red-200';
  const textShadow = isLeft ? '0 0 40px rgba(59,130,246,0.8)' : '0 0 40px rgba(239,68,68,0.8)';
  const label = type === 'DRAW' ? 'SYSTEM OVERRIDE' : 'DEFLECTION MATRIX';

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center pointer-events-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} className="absolute inset-0 bg-zinc-950 backdrop-blur-md" />

      <motion.div
        initial={{ x: isLeft ? '-100%' : '100%', skewX: -30 }}
        animate={{ x: '0%', skewX: -30 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        className={`absolute w-[150%] h-48 sm:h-64 ${bgColor} border-y-8 border-white/20 flex flex-col items-center justify-center`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] w-[200%] animate-scan" style={{ animationDuration: '1s', animationIterationCount: 'infinite' }} />
      </motion.div>

      <motion.div
        initial={{ scale: 3, opacity: 0, x: isLeft ? -50 : 50 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className={`absolute font-mono text-5xl sm:text-7xl font-black italic tracking-widest ${textColor} mix-blend-screen whitespace-nowrap`}
        style={{ textShadow, WebkitTextStroke: '1px rgba(255,255,255,0.5)' }}
      >
        {label}
      </motion.div>
    </div>
  );
};

const RevealCutin = () => {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.5, opacity: 0, letterSpacing: '0px' }}
        animate={{ scale: 1, opacity: 1, letterSpacing: '20px' }}
        exit={{ scale: 1.5, opacity: 0, letterSpacing: '40px' }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="font-mono text-7xl sm:text-9xl font-black tracking-[20px] text-zinc-100"
        style={{ textShadow: '0 0 40px rgba(255,255,255,0.8), 0 0 80px rgba(255,255,255,0.4)', WebkitTextStroke: '2px black' }}
      >
        ENGAGE
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
                    AudioController.playHeavyCharge(); // Dramatic sound
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
    let showFireProjectile: 'left-to-right' | 'right-to-left' | 'both' | null = null;

    if (phase === 'idle') {
        displayPlayerAction = playerAction ? 'ready' : 'normal';
        displayEnemyAction = enemyAction ? 'ready' : 'normal';
    } else if (phase === 'reveal' || phase === 'cinematic1') {
        displayPlayerAction = 'ready';
        displayEnemyAction = 'ready';
    } else if (phase === 'action1' || phase === 'cinematic2') {
        if (playerAction === 'fire' && enemyAction?.type === 'fire') {
            showFireProjectile = 'both';
        } else if (playerAction === 'fire') {
            showFireProjectile = 'left-to-right';
        } else if (enemyAction?.type === 'fire') {
            showFireProjectile = 'right-to-left';
        }

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

    const isPlayerHeavy = playerAction === 'fire' && state.playerFireCount >= 4;
    const isEnemyHeavy = enemyAction?.type === 'fire' && (enemyAction?.count ?? 0) >= 4;
    const hasHeavy = isPlayerHeavy || isEnemyHeavy;
    const isHeavyFiring = hasHeavy && (phase === 'action1' || phase === 'action2' || phase === 'result');

    const isHitStop = phase === 'action2' && (showHitEffect || (playerAction === 'fire' && enemyAction?.type === 'block') || (enemyAction?.type === 'fire' && playerAction === 'block'));

  return (
    <div className={`flex-grow flex flex-row items-center justify-around relative bg-zinc-950 p-2 sm:p-4 h-full min-h-0 rounded-2xl border ${isHeavyFiring ? 'border-red-500 shadow-[inset_0_0_150px_rgba(239,68,68,0.3)]' : 'border-zinc-800 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]'} overflow-hidden transition-colors duration-300 ${isTransitioning ? 'animate-turn-transition' : ''} ${isHitStop ? 'hit-stop' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-black/80 z-0 pointer-events-none" />
      <HexagonGrid />
      <CyberGrid />
      
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
      {(showFireProjectile === 'left-to-right' || showFireProjectile === 'both') && <LaserProjectile direction="left-to-right" isHeavy={state.playerFireCount >= 4} />}
      {(showFireProjectile === 'right-to-left' || showFireProjectile === 'both') && <LaserProjectile direction="right-to-left" isHeavy={(enemyAction?.count ?? 0) >= 4} />}
      
      <div className={`relative flex items-center justify-center h-full w-full ${displayPlayerDamageTaken && displayPlayerDamageTaken >= 3 ? 'animate-heavy-shake' : (displayShowHitEffect === 'player' || displayShowHitEffect === 'both') ? 'animate-shake' : ''}`}>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-widest bg-zinc-900/80 border border-cyan-900/50 px-4 py-1 rounded shadow-[0_0_10px_rgba(34,211,238,0.2)] z-10 font-mono flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {state.gameMode === 'localPvp' ? 'PLAYER 1' : 'YOU'}
        </div>
        <PlayerCharacter action={displayPlayerAction} themeType={state.playerAppearance} />
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
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: -20, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 text-white text-5xl sm:text-7xl font-cinematic z-30 chromatic-aberration"
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest bg-zinc-900/80 border border-red-900/50 px-4 py-1 rounded shadow-[0_0_10px_rgba(239,68,68,0.2)] z-10 font-mono flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {state.gameMode === 'localPvp' ? 'PLAYER 2' : 'ENEMY'}
        </div>
        <EnemyCharacter action={displayEnemyAction} themeType={state.enemyAppearance} />
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
              initial={{ opacity: 0, y: 50, scale: 0.5 }}
              animate={{ opacity: 1, y: -20, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 text-white text-5xl sm:text-7xl font-cinematic z-30 chromatic-aberration"
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
