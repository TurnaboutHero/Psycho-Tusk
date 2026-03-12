import React from 'react';
import { motion } from 'motion/react';
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

          {/* Arm & Weapon (Skeletal Animation) */}
          <g transform="translate(90, 100)">
            <motion.g
              initial={false}
              animate={action}
              variants={{
                normal: { rotate: 10 },
                ready: { rotate: 20 },
                attack: { rotate: -90 },
                'heavy-attack': { rotate: -90 },
                block: { rotate: -30 },
                reflect: { rotate: -30 },
                load: { rotate: 10 },
                hit: { rotate: 30 },
              }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              transformTemplate={(_, g) => `rotate(${(g || '').match(/rotate[Z]?\(([-.\d]+)/)?.[1] || 0} 0 0)`}
            >
              {/* Upper Arm */}
              <path d="M -12 -5 L 12 -5 L 8 40 L -8 40 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
              
              {/* Lower Arm Container */}
              <g transform="translate(0, 35)">
                <motion.g
                  initial={false}
                  animate={action}
                  variants={{
                    normal: { rotate: 0 },
                    ready: { rotate: -70 },
                    attack: { rotate: 0 },
                    'heavy-attack': { rotate: 0 },
                    block: { rotate: -100 },
                    reflect: { rotate: -100 },
                    load: { rotate: -120 },
                    hit: { rotate: -20 },
                  }}
                  transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                  transformTemplate={(_, g) => `rotate(${(g || '').match(/rotate[Z]?\(([-.\d]+)/)?.[1] || 0} 0 0)`}
                >
                  <path d="M -8 -5 L 8 -5 L 6 40 L -6 40 Z" fill={theme.coat} stroke="#18181b" strokeWidth="2" />
                  
                  {/* Hand & Weapon Container */}
                  <g transform="translate(0, 35)">
                    <motion.g
                      initial={false}
                      animate={action}
                      variants={{
                        normal: { rotate: 0 },
                        ready: { rotate: -20 },
                        attack: { rotate: 0 },
                        'heavy-attack': { rotate: 0 },
                        block: { rotate: -30 },
                        reflect: { rotate: -30 },
                        load: { rotate: -40 },
                        hit: { rotate: 0 },
                      }}
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                      transformTemplate={(_, g) => `rotate(${(g || '').match(/rotate[Z]?\(([-.\d]+)/)?.[1] || 0} 0 0)`}
                    >
                      {/* Hand/Glove */}
                      <circle cx="0" cy="0" r="10" fill={theme.metal} stroke="#18181b" strokeWidth="2" />
                      
                      {/* Gun */}
                      <path d="M -12 -5 L 5 -5 L 5 10 L -12 10 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" /> {/* Handle */}
                      <path d="M -6 -5 L 10 -5 L 10 45 L -6 45 Z" fill={theme.metal} stroke="#27272a" strokeWidth="2" /> {/* Barrel */}
                      <circle cx="2" cy="15" r="5" fill="#18181b" stroke={theme.energy} strokeWidth="1" />
                      <circle cx="2" cy="15" r="2" fill={theme.energy} style={{ filter: `drop-shadow(0 0 4px ${theme.energy})` }} />
                      <rect x="-1" y="25" width="6" height="15" fill={theme.energy} />

                      {/* Muzzle Flash */}
                      {(action === 'attack' || action === 'heavy-attack') && (
                        <g>
                          <path d="M 2 45 L -10 95 L 2 75 L 15 105 L 15 75 L 25 85 Z" fill="#fff" style={{ filter: `drop-shadow(0 0 12px ${theme.energy})` }} className="muzzle-flash-fx" />
                          <path d="M 2 45 L -4 65 L 2 60 L 8 70 L 8 60 L 12 65 Z" fill={theme.energy} className="muzzle-flash-fx" />
                        </g>
                      )}

                      {/* Shield */}
                      {(action === 'block' || action === 'reflect') && (
                        <g className="animate-pulse">
                          <path d="M 20 -40 Q 60 0 20 40" fill="none" stroke={theme.energy} strokeWidth="6" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${theme.energy})` }} />
                          <path d="M 20 -40 Q 60 0 20 40" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 30 -20 L 40 -10 L 40 10" fill="none" stroke={theme.energy} strokeWidth="1" opacity="0.6" />
                        </g>
                      )}

                      {/* Loading Plasma Cell */}
                      {action === 'load' && (
                        <rect x="-2" y="20" width="8" height="12" rx="2" fill="#fff" stroke={theme.energy} strokeWidth="2" style={{ filter: `drop-shadow(0 0 8px ${theme.energy})` }} className="animate-pulse" />
                      )}
                    </motion.g>
                  </g>
                </motion.g>
              </g>
            </motion.g>
          </g>
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
