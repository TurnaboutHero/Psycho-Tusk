
import React, { useEffect, useReducer } from 'react';
import { gameReducer } from './state/gameReducer';
import { initialState } from './state/initialState';
import { determineEnemyAction } from './utils/ai';
import { networkService } from './utils/network';
import Lobby from './components/Lobby';
import Game from './components/Game';
import PvpLobby from './components/PvpLobby';
import StatsScreen from './components/StatsScreen';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Custom event listener to handle dispatches from outside React components
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (!rootElement) return;

    const handleDispatch = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        dispatch(customEvent.detail);
      }
    };

    rootElement.addEventListener('dispatch', handleDispatch);
    return () => {
      rootElement.removeEventListener('dispatch', handleDispatch);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // PVE Game Timer Effect
  useEffect(() => {
    if (state.gameMode !== 'pve') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (state.timeLeft > 0 && !state.playerAction && !state.gameResult && !state.turnInProgress) {
      timer = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
    } else if (state.timeLeft === 0 && !state.playerAction && !state.gameResult && !state.turnInProgress) {
      dispatch({ type: 'SET_PLAYER_ACTION', payload: { action: 'load', fireCount: 0 } });
    }
    return () => clearTimeout(timer);
  }, [state.gameMode, state.timeLeft, state.playerAction, state.gameResult, state.turnInProgress, dispatch]);
  
  // PVE Async AI Action Effect
  useEffect(() => {
    if (state.gameMode !== 'pve') return;
    if (state.playerAction && state.isWaitingForAI) {
      const getAIAction = async () => {
        const aiDecision = await determineEnemyAction(state);
        dispatch({ type: 'SET_ENEMY_ACTION', payload: aiDecision });
      };
      getAIAction();
    }
  }, [state.gameMode, state.playerAction, state.isWaitingForAI, state, dispatch]);


  // Turn Processing Effect (PVE, Local PVP, Tutorial)
  useEffect(() => {
    if (state.gameMode !== 'pve' && state.gameMode !== 'localPvp' && state.gameMode !== 'tutorial') return;
    if (state.playerAction && state.enemyAction && !state.turnInProgress) {
      dispatch({ type: 'PROCESS_TURN' });
    }
  }, [state.gameMode, state.playerAction, state.enemyAction, state.turnInProgress, dispatch]);

  // Turn Cleanup Effect (PVE, Local PVP, Tutorial)
  useEffect(() => {
    if ((state.gameMode !== 'pve' && state.gameMode !== 'localPvp' && state.gameMode !== 'tutorial') || !state.turnInProgress || state.gameResult) {
      return;
    }

    const timer = setTimeout(() => {
      if (state.gameMode === 'tutorial') {
          dispatch({ type: 'ADVANCE_TUTORIAL' });
      } else {
        dispatch({ type: 'NEXT_TURN' });
      }
    }, 2500); // Delay for animations to play

    return () => clearTimeout(timer);
  }, [state.gameMode, state.turnInProgress, state.gameResult, dispatch]);

  // PVP Network Effect
  useEffect(() => {
    if (state.gameMode !== 'pvp') {
      networkService.disconnect();
      return;
    }
    
    const unsubscribe = networkService.onStateUpdate(update => {
        if (update.type === 'PUBLIC_ROOMS_UPDATE') {
            dispatch({ type: 'SET_PUBLIC_ROOMS', payload: update.payload });
        } else if (update.type === 'ROOM_STATE_UPDATE' && update.payload.roomCode === state.roomCode) {
            // If the game has started, sync the full state.
            if (update.payload.opponentJoined && !state.opponentJoined) {
                dispatch({ type: 'OPPONENT_JOINED' });
            }
            dispatch({ type: 'SYNC_STATE', payload: update.payload });
        }
    });
    
    // When component unmounts or mode changes, disconnect.
    return () => unsubscribe();
  }, [state.gameMode, state.roomCode, state.opponentJoined]);


  const renderContent = () => {
      switch (state.gameMode) {
          case 'lobby':
              return <Lobby dispatch={dispatch} />;
          case 'stats':
              return <StatsScreen dispatch={dispatch} />;
          case 'pve':
          case 'localPvp':
          case 'tutorial':
              return <Game state={state} dispatch={dispatch} />;
          case 'pvp':
              // If we are in pvp mode but haven't joined a room yet, show the PvpLobby
              if (!state.roomCode || !state.opponentJoined) {
                  return <PvpLobby state={state} dispatch={dispatch} />;
              }
              // Once opponent has joined, show the game board
              return <Game state={state} dispatch={dispatch} />;
          default:
              return <Lobby dispatch={dispatch} />;
      }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      {renderContent()}
    </div>
  );
};

export default App;
