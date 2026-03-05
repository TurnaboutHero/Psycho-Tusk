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
  playerHealth: 6,
  playerBullets: 1,
  playerDefenseLeft: 3,
  playerEvadeLeft: 1,
  playerHealLeft: 2,
  playerVulnerable: false,
  playerAction: null,
  playerFireCount: 1,
  playerRating: 1200,

  // Enemy/Opponent state
  enemyHealth: 6,
  enemyBullets: 1,
  enemyDefenseLeft: 3,
  enemyEvadeLeft: 1,
  enemyHealLeft: 2,
  enemyVulnerable: false,
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
  opponentJoined: false,
  publicRooms: [],
  
  // Local PVP state
  localPvpTurn: 'player1',
  
  // Network state
  isConnected: false,
};