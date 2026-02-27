

export type GameMode = 'lobby' | 'pve' | 'pvp' | 'localPvp' | 'tutorial' | 'stats';
export type ActionType = 'load' | 'fire' | 'defend' | 'evade' | 'heal';

export type CharacterAction = 'normal' | 'hit' | 'attack' | 'heavy-attack' | 'defend' | 'evade' | 'heal' | 'load';

export interface CharacterProps {
  action?: CharacterAction;
}

export interface EnemyDecision {
  type: ActionType;
  count: number;
}

export interface GameState {
  // Game flow
  gameMode: GameMode;
  gameResult: string;
  turnCount: number;
  timeLeft: number;
  turnInProgress: boolean;
  battleLog: string[];
  turnResult: string;

  // Player state
  playerHealth: number;
  playerBullets: number;
  playerDefenseLeft: number;
  playerEvadeLeft: number;
  playerHealLeft: number;
  playerVulnerable: boolean;
  playerAction: ActionType | null;
  playerFireCount: number;
  playerRating: number;

  // Enemy/Opponent state
  enemyHealth: number;
  enemyBullets: number;
  enemyDefenseLeft: number;
  enemyEvadeLeft: number;
  enemyHealLeft: number;
  enemyVulnerable: boolean;
  enemyAction: EnemyDecision | null;

  // AI-specific state
  isWaitingForAI: boolean;

  // UI state
  showFireControls: boolean;
  animation: string | null;
  showHitEffect: 'player' | 'enemy' | null;
  
  // Tutorial State
  tutorialStep: number;
  tutorialMessage: string;
  highlightedAction: ActionType | null;

  // PVP state
  roomCode: string;
  playerId: 'player1' | 'player2' | null;
  opponentJoined: boolean;
  publicRooms: string[];
  
  // Local PVP state
  localPvpTurn: 'player1' | 'transition' | 'player2' | 'results';
}

export type GameAction =
  | { type: 'START_GAME'; payload: { mode: 'pve' | 'localPvp' } }
  | { type: 'START_TUTORIAL' }
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_LOBBY' }
  | { type: 'SHOW_STATS' }
  | { type: 'TICK' }
  | { type: 'SET_PLAYER_ACTION'; payload: { action: ActionType; fireCount: number } }
  | { type: 'SET_LOCAL_OPPONENT_ACTION'; payload: { action: ActionType; fireCount: number } }
  | { type: 'SET_ENEMY_ACTION'; payload: EnemyDecision }
  | { type: 'PROCESS_TURN' }
  | { type: 'NEXT_TURN' }
  | { type: 'SHOW_FIRE_CONTROLS'; payload: boolean }
  | { type: 'SET_PLAYER_FIRE_COUNT'; payload: number }
  | { type: 'SET_ROOM'; payload: { roomCode: string; playerId: 'player1' | 'player2' } }
  | { type: 'OPPONENT_JOINED' }
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'SET_PUBLIC_ROOMS'; payload: string[] }
  | { type: 'ADVANCE_LOCAL_TURN' }
  | { type: 'ADVANCE_TUTORIAL' };