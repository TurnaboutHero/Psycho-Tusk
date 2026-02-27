import React from 'react';
import type { GameAction, GameState } from '../types';

interface TutorialOverlayProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ state, dispatch }) => {
  const { tutorialMessage, tutorialStep } = state;
  const isFinalStep = tutorialStep === 8; 

  if (!tutorialMessage) return null;

  return (
    <div className="absolute inset-x-0 bottom-full mb-2 z-30 flex justify-center p-4 pointer-events-none">
      <div className="bg-blue-900/90 border-2 border-blue-400 rounded-lg p-4 max-w-lg text-center shadow-lg pointer-events-auto">
        <p className="text-white text-lg">{tutorialMessage}</p>
        {isFinalStep && (
          <button
            onClick={() => dispatch({ type: 'GO_TO_LOBBY' })}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            로비로 돌아가기
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
