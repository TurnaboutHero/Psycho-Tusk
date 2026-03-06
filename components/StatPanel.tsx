import React from 'react';
import { Heart, Shield, Crosshair } from 'lucide-react';

interface StatPanelProps {
  title: string;
  health: number;
  bullets: number;
  blockLeft: number;
}

const StatPanel: React.FC<StatPanelProps> = ({
  title,
  health,
  bullets,
  blockLeft,
}) => {
  return (
    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 h-full flex flex-col">
      <h2 className="text-sm font-medium text-zinc-500 mb-6 uppercase tracking-wider">{title}</h2>
      
      <div className="space-y-6 flex-grow">
        {/* Health */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-zinc-600 uppercase tracking-wider mb-1">HP</span>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-4xl font-bold text-red-500">{health}</span>
            <span className="text-zinc-600 text-sm">/ 5</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex flex-col items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <span className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Bullets</span>
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-red-500" />
                  <span className="text-2xl font-bold text-zinc-100">{bullets}</span>
                  <span className="text-zinc-600 text-sm">/ 5</span>
                </div>
            </div>
            <div className="flex flex-col items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <span className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Blocks</span>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-2xl font-bold text-zinc-100">{blockLeft}</span>
                  <span className="text-zinc-600 text-sm">/ 3</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatPanel;
