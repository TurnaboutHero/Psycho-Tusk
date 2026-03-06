
import React, { useEffect } from 'react';
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

  const handleLobby = () => {
    if (gameMode === 'pvp' && roomCode) {
        networkService.leaveRoom(roomCode);
    }
    dispatch({ type: 'GO_TO_LOBBY' });
  };

  const isPlayer1Turn = gameMode !== 'localPvp' || localPvpTurn === 'player1';
  const isPlayer2Turn = gameMode === 'localPvp' && localPvpTurn === 'player2';
  
  const showActionBarForPlayers = isPlayer1Turn || isPlayer2Turn;
  const showActionBarForTutorial = gameMode === 'tutorial' && highlightedAction !== null && tutorialStep < 8;
  const showActionBar = (gameMode !== 'tutorial' && showActionBarForPlayers) || showActionBarForTutorial;

  const currentPlayer = isPlayer2Turn ? 'player2' : 'player1';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-screen">
      <header className="p-4 border-b border-gray-700">
        <Header 
            gameMode={gameMode} 
            roomCode={roomCode || (gameMode === 'localPvp' ? 'Local' : (gameMode === 'tutorial' ? 'Tutorial' : 'PVE'))} 
            timeLeft={timeLeft} 
            turnCount={turnCount} 
            isConnected={state.isConnected}
        />
      </header>
      <main className="flex-grow flex flex-col md:flex-row min-h-0">
        <div className="w-full md:w-1/4 p-4 border-b md:border-b-0 md:border-r border-gray-700">
          <StatPanel
            title={gameMode === 'localPvp' ? "플레이어 1" : (gameMode === 'pvp' ? (state.playerId === 'player1' ? "나" : "상대 플레이어") : "플레이어")}
            health={state.playerHealth}
            bullets={state.playerBullets}
            defenseLeft={state.playerDefenseLeft}
            evadeLeft={state.playerEvadeLeft}
            healLeft={state.playerHealLeft}
            isVulnerable={state.playerVulnerable}
          />
        </div>
        <div className="w-full md:w-1/2 flex-grow relative">
            <Battlefield state={state} />
            {gameMode === 'tutorial' && <TutorialOverlay state={state} dispatch={dispatch} />}
        </div>
        <div className="w-full md:w-1/4 p-4 border-t md:border-t-0 md:border-l border-gray-700">
          <StatPanel
            title={gameMode === 'pve' || gameMode === 'tutorial' ? "AI 상대" : (gameMode === 'localPvp' ? "플레이어 2" : (state.playerId === 'player2' ? "나" : "상대 플레이어"))}
            health={state.enemyHealth}
            bullets={state.enemyBullets}
            defenseLeft={state.enemyDefenseLeft}
            evadeLeft={state.enemyEvadeLeft}
            healLeft={state.enemyHealLeft}
            isVulnerable={state.enemyVulnerable}
          />
        </div>
      </main>
      <footer className="border-t border-gray-700">
        {showActionBar && <ActionBar state={state} dispatch={dispatch} currentPlayer={currentPlayer} />}
        <BattleLog logs={state.battleLog} />
      </footer>
      {gameResult && (
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
