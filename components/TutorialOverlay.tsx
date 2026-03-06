import React from 'react';
import type { GameAction, GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';

interface TutorialOverlayProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ state, dispatch }) => {
  const { tutorialMessage, tutorialStep } = state;
  const isFinalStep = tutorialStep === 5; 

  return (
    <AnimatePresence>
      {tutorialMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute inset-x-0 bottom-full mb-6 z-30 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-2xl p-6 max-w-lg text-center shadow-2xl pointer-events-auto backdrop-blur-md flex flex-col items-center">
            <div className="bg-blue-500/10 p-2 rounded-full mb-3">
              <Info className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-zinc-100 text-lg font-medium leading-relaxed">{tutorialMessage}</p>
            {isFinalStep && (
              <button
                onClick={() => dispatch({ type: 'GO_TO_LOBBY' })}
                className="mt-6 bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-colors w-full"
              >
                로비로 돌아가기
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
