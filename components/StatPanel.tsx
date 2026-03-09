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
    <div className={`flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-zinc-900/80 backdrop-blur-md border-zinc-800/50 ${reverse ? 'flex-row-reverse border-b' : 'border-t'}`}>
      <div className={`flex flex-col ${reverse ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{title}</span>
        <div className={`flex items-center gap-0.5 sm:gap-1 ${reverse ? 'flex-row-reverse' : ''}`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart 
              key={i} 
              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < health ? 'text-red-500 fill-red-500' : 'text-zinc-800 fill-zinc-900'}`} 
            />
          ))}
        </div>
      </div>
      
      <div className={`flex gap-2 sm:gap-3 ${reverse ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col items-center justify-center bg-zinc-950/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800/50 min-w-[3rem] sm:min-w-[3.5rem]">
          <Crosshair className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mb-0.5" />
          <span className="text-xs sm:text-sm font-bold text-zinc-100 leading-none">{bullets}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-zinc-950/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-zinc-800/50 min-w-[3rem] sm:min-w-[3.5rem]">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mb-0.5" />
          <span className="text-xs sm:text-sm font-bold text-zinc-100 leading-none">{blockLeft}</span>
        </div>
      </div>
    </div>
  );
};

export default StatPanel;
