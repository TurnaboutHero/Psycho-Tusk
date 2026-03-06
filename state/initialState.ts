import type { GameState } from '../types';

export const initialState: GameState = {
  // Game flow
  gameMode: 'lobby',
  gameResult: '',
  turnCount: 1,
  timeLeft: 15,
  turnInProgress: false,
  battleLog: ['게임이 시작되었습니다.'],
  turnResult: '',

  // Player state
  playerHealth: 5,
  playerBullets: 0,
  playerBlockLeft: 3,
  playerAction: null,
  playerFireCount: 1,
  playerRating: 1200,

  // Enemy/Opponent state
  enemyHealth: 5,
  enemyBullets: 0,
  enemyBlockLeft: 3,
  enemyAction: null,

  // AI-specific state
  isWaitingForAI: false,

  // UI state
  showFireControls: false,
  animation: null,
  showHitEffect: null,
  playerEmote: null,
  enemyEmote: null,
  playerDamageTaken: null,
  enemyDamageTaken: null,

  // Tutorial State
  tutorialStep: 0,
  tutorialMessage: '',
  highlightedAction: null,

  // PVP state
  roomCode: '',
  playerId: null,
  player1Id: undefined,
  player2Id: undefined,
  opponentJoined: false,
  publicRooms: [],
  
  // Round state
  round: 1,
  p1Wins: 0,
  p2Wins: 0,
  roomStatus: 'waiting',

  opponentDisconnected: false,
  disconnectTimer: null,
  
  // Local PVP state
  localPvpTurn: 'player1',
  
  // Network state
  isConnected: false,
};