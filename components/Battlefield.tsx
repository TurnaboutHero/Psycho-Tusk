import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, EnemyCharacter } from './Character';
import type { GameState, CharacterAction } from '../types';

interface BattlefieldProps {
  state: GameState;
}

// Custom hook to get the previous value of a prop or state.
function usePrevious<T>(value: T): T | undefined {
    // FIX: The `useRef<T>()` call was missing an initial value. Corrected to `useRef<T | undefined>(undefined)` to properly initialize the ref.
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}


const Battlefield: React.FC<BattlefieldProps> = ({ state }) => {
    const { turnInProgress, turnResult, playerAction, enemyAction, showHitEffect, playerEmote, enemyEmote, playerDamageTaken, enemyDamageTaken } = state;

    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevTurnInProgress = usePrevious(turnInProgress);

    useEffect(() => {
        // When a turn ends (i.e., turnInProgress goes from true to false),
        // trigger the transition animation.
        if (prevTurnInProgress && !turnInProgress) {
            setIsTransitioning(true);
            // Reset the transitioning state after the animation duration (800ms)
            const timer = setTimeout(() => setIsTransitioning(false), 800);
            return () => clearTimeout(timer);
        }
    }, [turnInProgress, prevTurnInProgress]);

    const getCharacterAction = (
        action: string | null | undefined,
        fireCount: number,
        isHit: boolean
      ): CharacterAction => {
        if (isHit) return 'hit';
        switch (action) {
          case 'fire': return fireCount >= 4 ? 'heavy-attack' : 'attack';
          case 'defend': return 'defend';
          case 'evade': return 'evade';
          case 'heal': return 'heal';
          case 'load': return 'load';
          default: return 'normal';
        }
      };

    const playerCharAction = getCharacterAction(playerAction, state.playerFireCount, showHitEffect === 'player');
    const enemyCharAction = getCharacterAction(enemyAction?.type, enemyAction?.count ?? 0, showHitEffect === 'enemy');


  return (
    <div className={`flex-grow flex items-center justify-around relative bg-gray-900/50 p-4 h-full ${isTransitioning ? 'animate-turn-transition' : ''}`}>
      <div className={`relative ${playerDamageTaken && playerDamageTaken >= 3 ? 'animate-heavy-shake' : showHitEffect === 'player' ? 'animate-shake' : ''}`}>
        <PlayerCharacter action={turnInProgress ? playerCharAction : 'normal'} />
        {playerEmote && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xl font-bold animate-pop-in shadow-lg z-20 whitespace-nowrap">
            {playerEmote}
          </div>
        )}
        {playerDamageTaken !== null && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-4xl font-black animate-float-up z-30 drop-shadow-md">
            -{playerDamageTaken}
          </div>
        )}
      </div>
      
      {turnInProgress && turnResult && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-3 rounded-lg text-2xl font-bold text-yellow-300 animate-pulse z-10">
          {turnResult}
        </div>
      )}
      
      <div className={`relative ${enemyDamageTaken && enemyDamageTaken >= 3 ? 'animate-heavy-shake' : showHitEffect === 'enemy' ? 'animate-shake' : ''}`}>
        <EnemyCharacter action={turnInProgress ? enemyCharAction : 'normal'} />
        {enemyEmote && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-xl font-bold animate-pop-in shadow-lg z-20 whitespace-nowrap">
            {enemyEmote}
          </div>
        )}
        {enemyDamageTaken !== null && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-red-500 text-4xl font-black animate-float-up z-30 drop-shadow-md">
            -{enemyDamageTaken}
          </div>
        )}
      </div>
    </div>
  );
};

export default Battlefield;