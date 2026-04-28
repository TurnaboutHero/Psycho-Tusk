

export type GameMode = 'lobby' | 'pve' | 'pvp' | 'localPvp' | 'tutorial' | 'stats';
export type ActionType = 'load' | 'fire' | 'block';

export type CharacterAction = 'normal' | 'ready' | 'hit' | 'attack' | 'heavy-attack' | 'block' | 'load' | 'reflect';
export type CharacterTheme = 'blue' | 'red' | 'cyber' | 'desert' | 'shadow';

export interface CharacterProps {
  action?: CharacterAction;
  themeType?: CharacterTheme;
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
  playerBlockLeft: number;
  playerAction: ActionType | null;
  playerFireCount: number;
  playerRating: number;

  // Enemy/Opponent state
  enemyHealth: number;
  enemyBullets: number;
  enemyBlockLeft: number;
  enemyAction: EnemyDecision | null;

  // AI-specific state
  isWaitingForAI: boolean;

  // UI state
  showFireControls: boolean;
  animation: string | null;
  showHitEffect: 'player' | 'enemy' | 'both' | null;
  playerEmote: string | null;
  enemyEmote: string | null;
  playerDamageTaken: number | null;
  enemyDamageTaken: number | null;
  
  // Tutorial State
  tutorialStep: number;
  tutorialMessage: string;
  highlightedAction: ActionType | null;

  // PVP state
  roomCode: string;
  playerId: 'player1' | 'player2' | null;
  player1Id?: string; // Database User ID
  player2Id?: string; // Database User ID
  opponentJoined: boolean;
  publicRooms: string[];
  
  // Round state
  round: number;
  p1Wins: number;
  p2Wins: number;
  roomStatus: 'waiting' | 'playing' | 'round_end' | 'game_end';
  
  // Connection state
  opponentDisconnected: boolean;
  disconnectTimer: number | null; // Seconds remaining until forfeit
  
  // Local PVP state
  localPvpTurn: 'player1' | 'transition' | 'player2' | 'results';
  
  // Network state
  isConnected: boolean;

  // Appearance
  playerAppearance: CharacterTheme;
  enemyAppearance: CharacterTheme;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { mode: 'pve' | 'localPvp' } }
  | { type: 'START_TUTORIAL' }
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_APPEARANCE'; payload: { player: 'player1' | 'player2', appearance: CharacterTheme } }
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
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'SET_EMOTE'; payload: { player: 'player1' | 'player2'; emote: string } }
  | { type: 'CLEAR_EMOTE'; payload: { player: 'player1' | 'player2' } }
  | { type: 'CLEAR_DAMAGE_TEXT' }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_OPPONENT_DISCONNECTED'; payload: { disconnected: boolean; timer: number | null } };