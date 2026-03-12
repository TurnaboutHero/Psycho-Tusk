import React from 'react';
import type { CharacterAction } from '../types';

interface CharacterProps {
  action?: CharacterAction;
}

interface ThemeColors {
  coat: string;
  coatDark: string;
  hat: string;
  pants: string;
  skin: string;
  energy: string;
  metal: string;
}

const SpaceWesternCharacter = ({ action, theme }: { action: CharacterAction, theme: ThemeColors }) => {
  return (
    <svg viewBox="0 0 200 300" className="w-24 h-48 sm:w-32 sm:h-64 md:w-[200px] md:h-[300px] max-h-full w-auto drop-shadow-2xl overflow-visible">
      <g className={action === 'hit' ? 'animate-shake' : ''}>
        <g className="transition-transform duration-200 ease-out" style={{ transformOrigin: '100px 250px', transform: action === 'attack' ? 'translate(20px, 0)' : action === 'heavy-attack' ? 'translate(30px, 0) rotate(-5deg)' : action === 'block' ? 'translate(-10px, 10px)' : action === 'reflect' ? 'translate(10px, 0) rotate(5deg)' : 'translate(0, 0)' }}>

          {/* Back Leg */}
          <path d="M 110 200 L 130 300 L 100 300 L 90 200 Z" fill={theme.pants} stroke="#18181b" strokeWidth="2" />
          {/* Front Leg (Cybernetic/Armored hint) */}
          <path d="M 70 200 L 60 300 L 90 300 L 100 200 Z" fill={theme.metal} stroke="#09090b" strokeWidth="2" />
          <path d="M 65 250 L 95 250" stroke={theme.energy} strokeWidth="2" opacity="0.3" />

          {/* Coat Back Flap */}
          <path d="M 100 150 L 160 250 L 110 220 L 80 260 Z" fill={theme.coatDark} stroke="#18181b" strokeWidth="2" />

          {/* Torso & Main Coat */}
          <path d="M 60 60 L 120 70 L 140 150 L 100 200 L 60 180 L 40 100 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />

          {/* Scarf / Bandana */}
          <path d="M 50 60 L 110 50 L 120 80 L 90 90 Z" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />

          {/* Face (Shadowed) */}
          <path d="M 70 30 L 110 20 L 120 60 L 60 60 Z" fill={theme.skin} stroke="#18181b" strokeWidth="2" />
          {/* Deep shadow over eyes from hat */}
          <path d="M 65 30 L 115 20 L 118 45 L 62 45 Z" fill="#09090b" opacity="0.8" />
          {/* Glowing Cyber-Eye under hat */}
          <circle cx="95" cy="40" r="3" fill={theme.energy} style={{ filter: `drop-shadow(0 0 4px ${theme.energy})` }} />

          {/* Head/Hat (Classic Stetson) */}
          <path d="M 20 40 L 100 20 L 160 40 L 100 50 Z" fill={theme.hat} stroke="#18181b" strokeWidth="2" />
          <path d="M 60 25 L 120 15 L 110 -10 L 70 -5 Z" fill={theme.hat} stroke="#18181b" strokeWidth="2" />
          <path d="M 62 20 L 118 10 L 115 15 L 65 25 Z" fill="#18181b" />

          {/* Arm & Weapon */}
          {action === 'attack' || action === 'heavy-attack' ? (
            <g transform="translate(100, 100)">
              {/* Straight Arm */}
              <path d="M -20 -10 L 50 -20 L 50 0 L -20 10 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              {/* Hand/Glove */}
              <circle cx="50" cy="-10" r="12" fill={theme.metal} stroke="#18181b" strokeWidth="2" />
              {/* Sci-Fi Handcannon */}
              <path d="M 40 -30 L 100 -30 L 100 -15 L 60 -15 L 60 10 L 40 10 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" />
              {/* Glowing Cylinder */}
              <circle cx="65" cy="-22" r="6" fill="#18181b" stroke={theme.energy} strokeWidth="1" />
              <circle cx="65" cy="-22" r="3" fill={theme.energy} style={{ filter: `drop-shadow(0 0 4px ${theme.energy})` }} />
              {/* Glowing Barrel Accent */}
              <rect x="75" y="-28" width="20" height="2" fill={theme.energy} />

              {/* Plasma Muzzle Flash */}
              <path d="M 100 -22 L 150 -35 L 130 -22 L 160 -10 L 130 -10 L 140 5 Z" fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${theme.energy})` }} className="muzzle-flash-fx" />
              <path d="M 100 -22 L 120 -28 L 115 -22 L 125 -15 L 115 -15 L 120 -5 Z" fill={theme.energy} className="muzzle-flash-fx" />
            </g>
          ) : action === 'block' || action === 'reflect' ? (
            <g transform="translate(80, 100)">
              {/* Shielding Arm */}
              <path d="M -10 0 L 30 -50 L 50 -40 L 10 20 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              {/* Metal Bracer / Gauntlet */}
              <path d="M 20 -40 L 40 -60 L 55 -45 L 35 -25 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" />
              {/* Bracer Energy Core */}
              <circle cx="38" cy="-42" r="4" fill={theme.energy} style={{ filter: `drop-shadow(0 0 5px ${theme.energy})` }} />
              
              {/* Hard-Light Energy Shield */}
              {action === 'reflect' && (
                <g className="animate-pulse" style={{ transformOrigin: '40px -40px' }}>
                  {/* Curved Shield Arc */}
                  <path d="M 20 -90 Q 70 -40 20 10" fill="none" stroke={theme.energy} strokeWidth="6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${theme.energy})` }} />
                  <path d="M 20 -90 Q 70 -40 20 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  {/* Hexagonal Grid Hint */}
                  <path d="M 35 -65 L 45 -55 L 45 -40" fill="none" stroke={theme.energy} strokeWidth="1" opacity="0.6" />
                  <path d="M 35 -15 L 45 -25 L 45 -40" fill="none" stroke={theme.energy} strokeWidth="1" opacity="0.6" />
                </g>
              )}
            </g>
          ) : action === 'load' ? (
            <g transform="translate(90, 100)">
              {/* Loading Arm bent upwards */}
              <path d="M -10 0 L 20 -40 L 40 -30 L 10 10 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              {/* Hand/Glove */}
              <circle cx="30" cy="-35" r="10" fill={theme.metal} stroke="#18181b" strokeWidth="2" />
              {/* Broken open gun */}
              <path d="M 20 -40 L 50 -70 L 60 -60 L 30 -30 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" />
              {/* Glowing Plasma Cell being loaded */}
              <rect x="42" y="-48" width="6" height="10" rx="2" fill="#fff" stroke={theme.energy} strokeWidth="2" style={{ filter: `drop-shadow(0 0 8px ${theme.energy})` }} className="animate-pulse" />
            </g>
          ) : action === 'ready' ? (
            <g transform="translate(90, 100)">
              {/* Ready Arm bent slightly */}
              <path d="M -10 0 L 10 30 L 30 20 L -10 10 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              {/* Hand/Glove */}
              <circle cx="20" cy="25" r="10" fill={theme.metal} stroke="#18181b" strokeWidth="2" />
              {/* Gun pointing forward but down */}
              <path d="M 20 20 L 50 40 L 40 50 L 10 30 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" />
              {/* Glowing Cylinder Accent */}
              <circle cx="30" cy="35" r="3" fill={theme.energy} opacity="0.6" />
            </g>
          ) : (
            <g transform="translate(90, 100)">
              {/* Idle Arm hanging down */}
              <path d="M -10 0 L 10 60 L -10 70 L -30 10 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              {/* Hand/Glove */}
              <circle cx="0" cy="65" r="10" fill={theme.metal} stroke="#18181b" strokeWidth="2" />
              {/* Gun pointing down */}
              <path d="M 0 60 L 20 110 L 10 120 L -10 70 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" />
              {/* Glowing Cylinder Accent */}
              <circle cx="10" cy="85" r="3" fill={theme.energy} opacity="0.6" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
};

export const PlayerCharacter: React.FC<CharacterProps> = ({ action = 'normal' }) => {
  const playerTheme: ThemeColors = {
    coat: '#1e3a8a', // blue-900
    coatDark: '#172554', // blue-950
    hat: '#451a03', // amber-950
    pants: '#0f172a', // slate-900
    skin: '#b45309', // amber-700
    energy: '#06b6d4', // cyan-500
    metal: '#334155', // slate-700
  };
  return <SpaceWesternCharacter action={action} theme={playerTheme} />;
};

export const EnemyCharacter: React.FC<CharacterProps> = ({ action = 'normal' }) => {
  const enemyTheme: ThemeColors = {
    coat: '#7f1d1d', // red-900
    coatDark: '#450a0a', // red-950
    hat: '#1c1917', // stone-900
    pants: '#1c1917', // stone-900
    skin: '#b45309',
    energy: '#ef4444', // red-500
    metal: '#3f3f46', // zinc-700
  };
  return (
    <div className="scale-x-[-1]">
      <SpaceWesternCharacter action={action} theme={enemyTheme} />
    </div>
  );
};
