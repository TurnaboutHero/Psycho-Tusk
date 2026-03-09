import React from 'react';
import type { GameAction, GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';

interface TutorialOverlayProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ state, dispatch }) => {
  const { tutorialMessage, tutorialStep } = state;
  const isFinalStep = tutorialStep === 5; 
  const totalSteps = 5;

  return (
    <AnimatePresence>
      {tutorialMessage && !state.turnInProgress && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-16 sm:top-20 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-xl p-3 sm:p-4 max-w-lg w-full shadow-2xl pointer-events-auto backdrop-blur-md flex flex-col relative">
            {!isFinalStep && (
              <button 
                onClick={() => dispatch({ type: 'GO_TO_LOBBY' })}
                className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
                title="튜토리얼 건너뛰기"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-500/10 p-1 sm:p-1.5 rounded-full">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-blue-400 tracking-wider">
                튜토리얼 {tutorialStep < totalSteps ? `${tutorialStep + 1} / ${totalSteps}` : '완료'}
              </div>
            </div>
            
            <p className="text-zinc-100 text-sm sm:text-base font-medium leading-snug break-keep pr-6">
              {tutorialMessage}
            </p>
            
            {isFinalStep && (
              <button
                onClick={() => dispatch({ type: 'GO_TO_LOBBY' })}
                className="mt-3 sm:mt-4 bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-2 px-6 rounded-lg transition-colors w-full text-xs sm:text-sm"
              >
                로비로 돌아가기
              </button>
            )}
            
            {!isFinalStep && (
              <div className="flex gap-1 mt-3">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === tutorialStep 
                        ? 'w-6 bg-blue-500' 
                        : i < tutorialStep 
                          ? 'w-2 bg-blue-500/50' 
                          : 'w-2 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;
