
import React, { useEffect, useState } from 'react';
import type { GameState, GameAction } from '../types';
import Header from './Header';
import Battlefield from './Battlefield';
import StatPanel from './StatPanel';
import ActionBar from './ActionBar';
import BattleLog from './BattleLog';
import GameResultModal from './GameResultModal';
import FireModal from './FireModal';
import PassDevice from './PassDevice';
import TutorialOverlay from './TutorialOverlay';
import DisconnectOverlay from './DisconnectOverlay';
import { networkService } from '../utils/network';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioController } from '../utils/audio';

interface GameProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const Game: React.FC<GameProps> = ({ state, dispatch }) => {
  const { 
    gameMode, 
    roomCode, 
    timeLeft, 
    turnCount, 
    gameResult, 
    showFireControls, 
    localPvpTurn, 
    tutorialStep, 
    highlightedAction,
    opponentDisconnected,
    disconnectTimer
  } = state;

  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(AudioController.toggleMute());
  };

  useEffect(() => {
    if (gameMode === 'pvp') {
        const unsubscribe = networkService.onStateUpdate((newState) => {
            dispatch({ type: 'SYNC_STATE', payload: newState });
        });
        return () => unsubscribe();
    }
  }, [gameMode, dispatch]);

  const handlePlayAgain = () => {
    if (gameMode === 'pve' || gameMode === 'localPvp') {
        dispatch({ type: 'RESET_GAME' });
    } else {
        // In PVP, play again logic would need network coordination.
        // For now, just go to lobby.
        if (roomCode) {
            networkService.leaveRoom(roomCode);
        }
        dispatch({ type: 'GO_TO_LOBBY' });
    }
  };

  const handleNextRound = () => {
    if (gameMode === 'pvp' && roomCode) {
        networkService.nextRound(roomCode);
    } else {
        // For PVE/LocalPVP, we could implement local round logic here
        // But for now, let's just reset the game if it's local
        dispatch({ type: 'RESET_GAME' });
    }
  };

  const handleLobby = () => {
    if (gameMode === 'pvp' && roomCode) {
        networkService.leaveRoom(roomCode);
    }
    dispatch({ type: 'GO_TO_LOBBY' });
  };

  const isPlayer1Turn = gameMode !== 'localPvp' || localPvpTurn === 'player1';
  const isPlayer2Turn = gameMode === 'localPvp' && localPvpTurn === 'player2';
  
  const showActionBarForPlayers = isPlayer1Turn || isPlayer2Turn;
  const showActionBarForTutorial = gameMode === 'tutorial' && highlightedAction !== null && tutorialStep < 5;
  const showActionBar = (gameMode !== 'tutorial' && showActionBarForPlayers) || showActionBarForTutorial;

  const currentPlayer = isPlayer2Turn ? 'player2' : 'player1';

  const myWins = state.playerId === 'player2' ? state.p2Wins : state.p1Wins;
  const oppWins = state.playerId === 'player2' ? state.p1Wins : state.p2Wins;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="p-3 sm:p-4 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">심리터스크</h1>
          <div className="text-[10px] sm:text-xs text-zinc-500">Round {state.round} / Turn {turnCount}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors"
            title={isMuted ? "소리 켜기" : "소리 끄기"}
          >
            {isMuted ? <VolumeX size={18} className="sm:w-5 sm:h-5" /> : <Volume2 size={18} className="sm:w-5 sm:h-5" />}
          </button>
          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-zinc-500 uppercase">Score</div>
            <div className="font-mono text-base sm:text-lg leading-none">{myWins} - {oppWins}</div>
          </div>
        </div>
      </header>
      <main className="flex-grow flex flex-col min-h-0 relative">
        {/* Enemy Stats (Top) */}
        <div className="w-full z-10">
          <StatPanel
            title={gameMode === 'pve' || gameMode === 'tutorial' ? "AI 상대" : (gameMode === 'localPvp' ? "플레이어 2" : (state.playerId === 'player2' ? "나" : "상대 플레이어"))}
            health={state.enemyHealth}
            bullets={state.enemyBullets}
            blockLeft={state.enemyBlockLeft}
            reverse={true}
          />
        </div>

        {/* Battlefield (Middle) */}
        <div className="flex-grow relative flex flex-col">
            <Battlefield state={state} />
            {gameMode === 'tutorial' && <TutorialOverlay state={state} dispatch={dispatch} />}
            
            {state.roomStatus === 'round_end' && !state.turnInProgress && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 backdrop-blur-sm">
                <div className="text-center space-y-4 sm:space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">라운드 종료</h2>
                  <div className="text-sm sm:text-base text-zinc-400">다음 라운드를 준비하세요.</div>
                  <button 
                    onClick={handleNextRound}
                    className="bg-zinc-100 text-zinc-950 px-6 py-2 sm:px-8 sm:py-3 rounded-full font-bold hover:bg-zinc-300 transition-colors text-sm sm:text-base"
                  >
                    다음 라운드
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Player Stats (Bottom) */}
        <div className="w-full z-10">
          <StatPanel
            title={gameMode === 'localPvp' ? "플레이어 1" : (gameMode === 'pvp' ? (state.playerId === 'player1' ? "나" : "상대 플레이어") : "플레이어")}
            health={state.playerHealth}
            bullets={state.playerBullets}
            blockLeft={state.playerBlockLeft}
            reverse={false}
          />
        </div>
      </main>
      <footer className="border-t border-zinc-800">
        {showActionBar && <ActionBar state={state} dispatch={dispatch} currentPlayer={currentPlayer} />}
        <BattleLog logs={state.battleLog} />
      </footer>
      {state.roomStatus === 'game_end' && gameResult && !state.turnInProgress && (
        <GameResultModal result={gameResult} onPlayAgain={handlePlayAgain} onLobby={handleLobby} gameMode={gameMode} playerId={state.playerId} />
      )}
      {showFireControls && <FireModal state={state} dispatch={dispatch} currentPlayer={currentPlayer} />}
      {gameMode === 'localPvp' && localPvpTurn === 'transition' && <PassDevice dispatch={dispatch} />}
      
      <DisconnectOverlay 
        isVisible={!!opponentDisconnected} 
        initialTimer={disconnectTimer} 
      />
    </div>
  );
};

export default Game;
