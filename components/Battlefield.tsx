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
    const { turnInProgress, turnResult, playerAction, enemyAction, showHitEffect } = state;

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
      <PlayerCharacter action={turnInProgress ? playerCharAction : 'normal'} />
      {turnInProgress && turnResult && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-3 rounded-lg text-2xl font-bold text-yellow-300 animate-pulse z-10">
          {turnResult}
        </div>
      )}
      <EnemyCharacter action={turnInProgress ? enemyCharAction : 'normal'} />
    </div>
  );
};

export default Battlefield;