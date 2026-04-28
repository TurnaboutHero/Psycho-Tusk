import React from 'react';
import { motion } from 'motion/react';
import type { CharacterAction, CharacterTheme } from '../types';

interface CharacterProps {
  action?: CharacterAction;
  themeType?: CharacterTheme;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  armor: string;
  armorDark: string;
  energy: string;
  energyGlow: string;
  metal: string;
}

export const themes: Record<CharacterTheme, ThemeColors> = {
  blue: {
    primary: '#2563eb', // blue-600
    secondary: '#1e3a8a', // blue-900
    armor: '#e2e8f0', // slate-200
    armorDark: '#94a3b8', // slate-400
    energy: '#06b6d4', // cyan-500
    energyGlow: 'rgba(6, 182, 212, 0.6)',
    metal: '#334155', // slate-700
  },
  red: {
    primary: '#dc2626', // red-600
    secondary: '#7f1d1d', // red-900
    armor: '#27272a', // zinc-800
    armorDark: '#18181b', // zinc-900
    energy: '#ef4444', // red-500
    energyGlow: 'rgba(239, 68, 68, 0.6)',
    metal: '#71717a', // zinc-500
  },
  cyber: {
    primary: '#c026d3', // fuchsia-600
    secondary: '#4a044e', // fuchsia-950
    armor: '#171717', // neutral-900
    armorDark: '#0a0a0a', // neutral-950
    energy: '#2dd4bf', // teal-400
    energyGlow: 'rgba(45, 212, 191, 0.6)',
    metal: '#a8a29e', // stone-400
  },
  desert: {
    primary: '#d97706', // amber-500
    secondary: '#78350f', // amber-900
    armor: '#fde68a', // amber-200
    armorDark: '#d97706', // amber-500
    energy: '#fbbf24', // amber-400
    energyGlow: 'rgba(251, 191, 36, 0.6)',
    metal: '#78716c', // stone-500
  },
  shadow: {
    primary: '#09090b', // zinc-950
    secondary: '#000000', // black
    armor: '#27272a', // zinc-800
    armorDark: '#09090b', // zinc-950
    energy: '#22c55e', // green-500
    energyGlow: 'rgba(34, 197, 94, 0.6)',
    metal: '#52525b', // zinc-600
  }
};

const TuskMech = ({ action, theme }: { action: CharacterAction, theme: ThemeColors }) => {
  return (
    <svg viewBox="0 0 200 300" className="w-24 h-48 sm:w-32 sm:h-64 md:w-[200px] md:h-[300px] max-h-full w-auto drop-shadow-2xl overflow-visible">
      <defs>
        <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.armor} />
          <stop offset="100%" stopColor={theme.armorDark} />
        </linearGradient>
        <filter id="energyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g className={action === 'hit' ? 'animate-shake' : ''}>
        <motion.g 
          initial={false}
          style={{ transformOrigin: '100px 250px', transformBox: 'view-box' }}
          animate={{
            x: action === 'attack' ? 20 : action === 'heavy-attack' ? 40 : action === 'block' ? -10 : action === 'reflect' ? 10 : action === 'load' ? -5 : 0,
            y: action === 'block' ? 10 : action === 'load' ? -15 : 0,
            rotate: action === 'heavy-attack' ? 5 : action === 'reflect' ? -5 : action === 'load' ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          
          {/* Base Shadow */}
          <ellipse cx="100" cy="285" rx="55" ry="12" fill="black" opacity="0.4" />

          {/* BACK ARM (Static) */}
          <g transform="translate(120, 110)">
            <path d="M 0 0 L 25 50 L 15 55 L -10 5 Z" fill={theme.metal} />
            <circle cx="20" cy="52" r="12" fill={theme.secondary} />
            <circle cx="20" cy="52" r="6" fill={theme.armor} />
          </g>

          {/* BACK LEG */}
          <g transform="translate(125, 185)">
             {/* Thigh */}
             <path d="M -10 -15 L 15 -15 L 20 45 L -15 40 Z" fill={theme.secondary} />
             {/* Calf */}
             <path d="M -10 35 L 20 40 L 25 90 L -5 95 Z" fill={theme.metal} />
             {/* Foot */}
             <path d="M -15 90 L 35 90 L 40 100 L -25 100 Z" fill={theme.primary} />
             {/* Joint */}
             <circle cx="5" cy="40" r="10" fill={theme.secondary} />
          </g>

          {/* FRONT LEG */}
          <g transform="translate(75, 185)">
             {/* Thigh */}
             <path d="M -20 -10 L 20 -15 L 15 50 L -20 45 Z" fill={theme.primary} />
             <path d="M -15 -10 L 15 -15 L 10 50 L -15 45 Z" fill="url(#armorGradient)" opacity="0.6"/>
             {/* Calf */}
             <path d="M -20 40 L 15 45 L 20 95 L -25 95 Z" fill={theme.armor} />
             {/* Foot */}
             <path d="M -40 90 L 30 90 L 35 100 L -50 100 Z" fill={theme.secondary} />
             {/* Joint */}
             <circle cx="-2" cy="45" r="14" fill={theme.primary} />
             <circle cx="-2" cy="45" r="6" fill={theme.metal} />
          </g>
          
          {/* CORE TORSO */}
          <g transform="translate(100, 135)">
            <path d="M -35 -45 L 35 -45 L 45 10 L 25 55 L -25 55 L -45 10 Z" fill="url(#armorGradient)" />
            <path d="M -25 -45 L 25 -45 L 35 10 L 15 55 L -15 55 L -35 10 Z" fill="white" opacity="0.1" />
            
            {/* Core Reactor */}
            <circle cx="0" cy="5" r="22" fill={theme.metal} />
            <motion.circle 
              cx="0" cy="5" r="14" 
              fill={theme.energy} 
              filter="url(#energyGlow)" 
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: action === 'load' ? 1.2 : 1, opacity: action === 'load' ? 1 : 0.8 }}
              transition={{ repeat: action === 'load' ? Infinity : 0, duration: 0.5, repeatType: 'reverse' }}
            />
            {/* Chest Plates */}
            <path d="M -40 -20 L 0 -5 L 40 -20" fill="none" stroke={theme.metal} strokeWidth="6" opacity="0.5" />
            <path d="M -45 10 L 0 5 L 45 10" fill="none" stroke={theme.metal} strokeWidth="6" opacity="0.5" />
          </g>

          {/* HEAD & TUSKS */}
          <g transform="translate(100, 75)">
             {/* Neck */}
             <rect x="-15" y="10" width="30" height="25" fill={theme.metal} />
             
             {/* Head Base */}
             <path d="M -28 -25 L 28 -25 L 35 12 L 0 32 L -35 12 Z" fill={theme.primary} />
             <path d="M -22 -20 L 22 -20 L 28 10 L 0 25 L -28 10 Z" fill={theme.secondary} />
             
             {/* Glowing Eye Visor */}
             <motion.path 
               d="M -20 -5 L 20 -5 L 25 10 L 0 18 L -25 10 Z" 
               fill={theme.energy} 
               filter="url(#energyGlow)"
               animate={{ opacity: action === 'hit' ? 0.3 : 1 }}
             />
             <path d="M -10 8 L 10 2" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
             
             {/* TUSKS */}
             {/* Left Tusk */}
             <path d="M -30 15 Q -50 -10 -65 -40" fill="none" stroke="url(#armorGradient)" strokeWidth="12" strokeLinecap="round" />
             <path d="M -30 15 Q -50 -10 -65 -40" fill="none" stroke={theme.metal} strokeWidth="6" strokeLinecap="round" />
             {/* Right Tusk */}
             <path d="M 30 15 Q 50 -10 65 -40" fill="none" stroke="url(#armorGradient)" strokeWidth="12" strokeLinecap="round" />
             <path d="M 30 15 Q 50 -10 65 -40" fill="none" stroke={theme.metal} strokeWidth="6" strokeLinecap="round" />
          </g>

          {/* FRONT ARM (Tank Cannon) */}
          <g transform="translate(80, 110)">
            <motion.g
              initial={false}
              animate={action}
              style={{ transformOrigin: '50% 50%' }}
              variants={{
                normal: { rotate: 0 },
                ready: { rotate: -45 },
                attack: { rotate: -90 },
                'heavy-attack': { rotate: -90 },
                block: { rotate: -20 },
                reflect: { rotate: -80 },
                load: { rotate: -110 },
                hit: { rotate: 40 },
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            >
              {/* Invisible bounding box normalizer to make 50% 50% equal (0,0) */}
              <circle cx="0" cy="0" r="200" fill="transparent" pointerEvents="none" />
              
              {/* Cannon Base (Shoulder) */}
              <circle cx="0" cy="0" r="30" fill={theme.primary} />
              <circle cx="0" cy="0" r="18" fill="url(#armorGradient)" />
              <circle cx="0" cy="0" r="8" fill={theme.metal} />
              
              {/* Cannon Barrel */}
              <path d="M -20 20 L 20 20 L 15 80 L -15 80 Z" fill={theme.secondary} />
              <path d="M -15 80 L 15 80 L 10 100 L -10 100 Z" fill={theme.metal} />
              <rect x="-10" y="25" width="20" height="40" fill="url(#armorGradient)" />
              
              {/* Blaster Core */}
              <rect x="-4" y="60" width="8" height="30" fill={theme.energy} opacity="0.8" />
              
              {/* Energy Muzzle Flash */}
              {(action === 'attack' || action === 'heavy-attack') && (
                <motion.g 
                  initial={{ scale: 0.5, opacity: 1 }} 
                  animate={{ scale: action === 'heavy-attack' ? [2.5, 0] : [1.5, 0], opacity: [1, 0] }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <circle cx="0" cy="110" r={action === 'heavy-attack' ? 35 : 25} fill={theme.energy} filter="url(#energyGlow)" opacity="0.6"/>
                  <path d={action === 'heavy-attack' ? "M -25 100 L 25 100 L 0 200 Z" : "M -15 100 L 15 100 L 0 160 Z"} fill="#fff" filter="url(#energyGlow)" />
                </motion.g>
              )}

              {/* Energy Shield */}
              {(action === 'block' || action === 'reflect') && (
                <motion.g 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: action === 'reflect' ? 1.6 : 1.2 }} 
                  className={action === 'block' ? "animate-pulse" : ""}
                >
                  <path d="M -60 110 Q 0 150 60 110 Q 0 120 -60 110 Z" fill={theme.energy} opacity="0.2" filter="url(#energyGlow)" />
                  <path d="M -60 110 Q 0 150 60 110" fill="none" stroke={theme.energy} strokeWidth="8" strokeLinecap="round" filter="url(#energyGlow)" />
                  <path d="M -60 110 Q 0 150 60 110" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                  <path d="M -40 100 Q 0 130 40 100" fill="none" stroke={theme.energy} strokeWidth="4" strokeLinecap="round" opacity="0.6" />
                  {/* Reflection Spike */}
                  {action === 'reflect' && (
                    <path d="M -15 135 L 0 160 L 15 135 Z" fill="#fff" filter="url(#energyGlow)" opacity="0.9" />
                  )}
                </motion.g>
              )}

              {/* Loading State */}
              {action === 'load' && (
                <motion.g style={{ transformOrigin: '0px 110px' }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  {/* Gathering Particles */}
                  <motion.circle 
                     cx="0" cy="110" r="25" 
                     fill="none" stroke={theme.energy} strokeWidth="4" strokeDasharray="10 20"
                     initial={{ rotate: 0, scale: 2, opacity: 0 }}
                     animate={{ rotate: -360, scale: 1, opacity: 1 }}
                     transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                     filter="url(#energyGlow)" 
                  />
                  <motion.circle 
                     cx="0" cy="110" r="10" 
                     fill={theme.energy} 
                     initial={{ scale: 0.5, opacity: 0.5 }}
                     animate={{ scale: 1.5, opacity: 1 }}
                     transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                     filter="url(#energyGlow)" 
                  />
                </motion.g>
              )}
            </motion.g>
          </g>

        </motion.g>
      </g>
    </svg>
  );
};

export const PlayerCharacter: React.FC<CharacterProps> = ({ action = 'normal', themeType = 'blue' }) => {
  const playerTheme = themes[themeType] || themes.blue;
  return <TuskMech action={action} theme={playerTheme} />;
};

export const EnemyCharacter: React.FC<CharacterProps> = ({ action = 'normal', themeType = 'red' }) => {
  const enemyTheme = themes[themeType] || themes.red;
  return (
    <div className="scale-x-[-1]">
      <TuskMech action={action} theme={enemyTheme} />
    </div>
  );
};

