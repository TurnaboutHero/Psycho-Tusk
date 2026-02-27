import React from 'react';
import { Heart, Shield, Droplet, Zap, X, ShieldAlert } from 'lucide-react';

interface StatPanelProps {
  title: string;
  health: number;
  bullets: number;
  defenseLeft: number;
  evadeLeft: number;
  healLeft: number;
  isVulnerable: boolean;
}

const StatPanel: React.FC<StatPanelProps> = ({
  title,
  health,
  bullets,
  defenseLeft,
  evadeLeft,
  healLeft,
  isVulnerable,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-full">
      <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
      <div className="space-y-3">
        {/* Health Bar */}
        <div className="flex items-center">
          <Heart className="w-5 h-5 mr-3 text-red-500" />
          <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden">
            <div
              className="bg-red-600 h-5 rounded-full text-center text-xs text-white font-bold leading-5 transition-all duration-500"
              style={{ width: `${(health / 6) * 100}%` }}
            >
              {health}/6
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center bg-gray-700/50 p-2 rounded">
                <Droplet className="w-4 h-4 mr-2 text-blue-400" />
                <span>총알: {bullets}</span>
            </div>
            <div className="flex items-center bg-gray-700/50 p-2 rounded">
                <Shield className="w-4 h-4 mr-2 text-cyan-400" />
                <span>반사: {defenseLeft}</span>
            </div>
            <div className="flex items-center bg-gray-700/50 p-2 rounded">
                <X className="w-4 h-4 mr-2 text-purple-400" />
                <span>회피: {evadeLeft}</span>
            </div>
            <div className="flex items-center bg-gray-700/50 p-2 rounded">
                <Zap className="w-4 h-4 mr-2 text-green-400" />
                <span>회복: {healLeft}</span>
            </div>
        </div>

        {isVulnerable && (
             <div className="flex items-center justify-center bg-yellow-900/50 text-yellow-300 p-2 rounded mt-3 text-sm animate-pulse">
                <ShieldAlert className="w-4 h-4 mr-2" />
                <span>취약 상태!</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default StatPanel;
