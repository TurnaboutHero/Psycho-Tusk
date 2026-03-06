"use client";

import React, { useEffect, useReducer } from 'react';
import { gameReducer } from '../state/gameReducer';
import { initialState } from '../state/initialState';
import { determineEnemyAction } from '../utils/ai';
import { networkService } from '../utils/network';
import Lobby from '../components/Lobby';
import Game from '../components/Game';
import PvpLobby from '../components/PvpLobby';
import StatsScreen from '../components/StatsScreen';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Custom event listener to handle dispatches from outside React components
  useEffect(() => {
    const handleDispatch = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        dispatch(customEvent.detail);
      }
    };

    window.addEventListener('dispatch', handleDispatch);
    return () => {
      window.removeEventListener('dispatch', handleDispatch);
    };
  }, []);

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
      return;
    }
    
    // Ensure we are connected when entering PVP mode
    networkService.getPublicRooms();

    const unsubscribe = networkService.onStateUpdate(update => {
        if (update.type === 'PUBLIC_ROOMS_UPDATE') {
            dispatch({ type: 'SET_PUBLIC_ROOMS', payload: update.payload });
        } else if (update.type === 'ROOM_STATE_UPDATE') {
            if (state.roomCode && update.payload.roomCode !== state.roomCode) return;
            
            if (update.payload.opponentJoined && !state.opponentJoined) {
                dispatch({ type: 'OPPONENT_JOINED' });
            }
            dispatch({ type: 'SYNC_STATE', payload: update.payload });
        } else if (update.type === 'EMOTE_RECEIVED') {
            dispatch({ type: 'SET_EMOTE', payload: { player: update.payload.playerId, emote: update.payload.emote } });
            setTimeout(() => {
                dispatch({ type: 'CLEAR_EMOTE', payload: { player: update.payload.playerId } });
            }, 3000);
        } else if (update.type === 'CONNECTION_STATUS') {
            console.log('Connection status changed:', update.payload);
            dispatch({ type: 'SET_CONNECTION_STATUS', payload: update.payload });
        } else if (update.type === 'MATCH_FOUND') {
            const { roomCode, playerId, state: roomState } = update.payload;
            dispatch({ type: 'SET_ROOM', payload: { roomCode, playerId } });
            dispatch({ type: 'SYNC_STATE', payload: roomState });
            if (roomState.opponentJoined) {
                dispatch({ type: 'OPPONENT_JOINED' });
            }
        }
    });
    
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
              if (!state.roomCode || !state.opponentJoined) {
                  return <PvpLobby state={state} dispatch={dispatch} />;
              }
              return <Game state={state} dispatch={dispatch} />;
          default:
              return <Lobby dispatch={dispatch} />;
      }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-950 text-zinc-100">
      {renderContent()}
    </div>
  );
}
