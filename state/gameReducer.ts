
import type { GameState, GameAction } from '../types';
import { initialState } from './initialState';
import { calculateTurn } from '../utils/gameUtils';
import { getTutorialStep } from '../utils/tutorialScript';
import { loadStats } from '../utils/statsManager';

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_TUTORIAL':
      // FIX: `getTutorialStep` returns a `Partial<GameState>`. To satisfy the reducer's
      // `GameState` return type, we spread its result over `initialState`.
      return { ...initialState, ...getTutorialStep(0, initialState) };
    
    case 'ADVANCE_TUTORIAL': {
      const nextStep = state.tutorialStep + 1;
      const nextStepState = getTutorialStep(nextStep, state);
      return {
          ...state,
          playerAction: null, // Clear actions for next step
          enemyAction: nextStepState.enemyAction || null, // Pre-set AI action for next step
          turnInProgress: false,
          turnResult: '',
          animation: null,
          showHitEffect: null,
          ...nextStepState, // Apply new message, highlights etc.
      };
    }
    case 'START_GAME': {
      const baseState = {
        ...initialState,
        gameMode: action.payload.mode,
        localPvpTurn: action.payload.mode === 'localPvp' ? 'player1' : initialState.localPvpTurn,
      };
      if (action.payload.mode === 'pve') {
        const { playerStats } = loadStats();
        return {
          ...baseState,
          playerRating: playerStats.rating,
        };
      }
      return baseState;
    }
    case 'RESET_GAME':
      return {
        ...initialState,
        gameMode: state.gameMode,
        playerRating: state.gameMode === 'pve' ? state.playerRating : initialState.playerRating,
        localPvpTurn: state.gameMode === 'localPvp' ? 'player1' : state.localPvpTurn,
        roomCode: state.roomCode,
        playerId: state.playerId,
        opponentJoined: state.opponentJoined,
        publicRooms: state.publicRooms
      };
    case 'GO_TO_LOBBY':
        return {
            ...initialState,
        };
    case 'SHOW_STATS':
        return {
            ...state,
            gameMode: 'stats',
        };
    case 'SET_MODE':
      return {
        ...state,
        gameMode: action.payload,
      };
    case 'TICK':
      if (state.gameMode === 'localPvp' || state.gameMode === 'tutorial') return state;
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - 1),
      };
    case 'SET_PLAYER_ACTION':
      return {
        ...state,
        playerAction: action.payload.action,
        playerFireCount: action.payload.fireCount,
        isWaitingForAI: state.gameMode === 'pve',
        showFireControls: false,
        // For tutorial, enemy action is already set, so turn can process immediately
        enemyAction: state.gameMode === 'tutorial' ? state.enemyAction : state.enemyAction,
        localPvpTurn: state.gameMode === 'localPvp' ? 'transition' : state.localPvpTurn,
      };
    case 'SET_LOCAL_OPPONENT_ACTION':
      return {
        ...state,
        enemyAction: { type: action.payload.action, count: action.payload.fireCount },
        showFireControls: false,
      };
    case 'ADVANCE_LOCAL_TURN':
      return {
        ...state,
        localPvpTurn: 'player2',
      };
    case 'SET_ENEMY_ACTION':
      return {
        ...state,
        enemyAction: action.payload,
        isWaitingForAI: false,
      };
    case 'PROCESS_TURN': {
        if (!state.playerAction || !state.enemyAction) return state;

        const turnOutcome = calculateTurn(state);

        return {
            ...state,
            ...turnOutcome,
            turnInProgress: true,
            localPvpTurn: state.gameMode === 'localPvp' ? 'results' : state.localPvpTurn,
        };
    }
    case 'NEXT_TURN': {
      if (state.gameResult) return state;
      return {
        ...state,
        playerAction: null,
        enemyAction: null,
        turnInProgress: false,
        turnResult: '',
        animation: null,
        showHitEffect: null,
        timeLeft: 15,
        turnCount: state.turnCount + 1,
        localPvpTurn: state.gameMode === 'localPvp' ? 'player1' : state.localPvpTurn,
      }
    }
    case 'SHOW_FIRE_CONTROLS':
      return {
        ...state,
        showFireControls: action.payload,
        playerFireCount: 1, // Reset on show
      };
    case 'SET_PLAYER_FIRE_COUNT':
      return {
        ...state,
        playerFireCount: action.payload,
      };
    case 'SET_ROOM':
        return {
            ...state,
            roomCode: action.payload.roomCode,
            playerId: action.payload.playerId,
        };
    case 'OPPONENT_JOINED':
        return {
            ...state,
            opponentJoined: true,
        };
    case 'SYNC_STATE':
        return {
            ...state, // keep local state like playerId
            ...action.payload,
            playerId: state.playerId,
        };
    case 'SET_PUBLIC_ROOMS':
        return {
            ...state,
            publicRooms: action.payload,
        };
    default:
      return state;
  }
};