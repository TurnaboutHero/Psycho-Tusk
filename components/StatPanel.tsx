import React from 'react';
import { Heart, Shield, Crosshair } from 'lucide-react';

interface StatPanelProps {
  title: string;
  health: number;
  bullets: number;
  blockLeft: number;
  reverse?: boolean;
}

const StatPanel: React.FC<StatPanelProps> = ({
  title,
  health,
  bullets,
  blockLeft,
  reverse = false,
}) => {
  return (
    <div className={`flex items-center justify-between px-2.5 py-1.5 sm:px-4 sm:py-3 bg-zinc-900/80 backdrop-blur-md border-zinc-800/50 ${reverse ? 'flex-row-reverse border-b' : 'border-t'}`}>
      <div className={`flex flex-col ${reverse ? 'items-end' : 'items-start'}`}>
        <span className="text-[9px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5 sm:mb-1">{title}</span>
        <div className={`flex items-center gap-0.5 sm:gap-1 ${reverse ? 'flex-row-reverse' : ''}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart 
              key={i} 
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < health ? 'text-red-500 fill-red-500' : 'text-zinc-800 fill-zinc-900'}`} 
            />
          ))}
        </div>
      </div>
      
      <div className={`flex gap-1.5 sm:gap-3 ${reverse ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center justify-center bg-zinc-950/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg border border-zinc-700/50 min-w-[3rem] sm:min-w-[4rem] shadow-inner">
          <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 mb-0.5" />
          <div className="flex items-baseline gap-px">
            <span className="text-xs sm:text-sm font-bold text-zinc-100 leading-none">{bullets}</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium leading-none">/5</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-zinc-950/80 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg border border-zinc-700/50 min-w-[3rem] sm:min-w-[4rem] shadow-inner">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 mb-0.5" />
          <div className="flex items-baseline gap-px">
            <span className="text-xs sm:text-sm font-bold text-zinc-100 leading-none">{blockLeft}</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-medium leading-none">/3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatPanel;
