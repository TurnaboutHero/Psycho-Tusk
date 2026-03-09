

import React from 'react';
import type { CharacterProps } from '../types';

export const PlayerCharacter: React.FC<CharacterProps> = ({ action = 'normal' }) => {
  const baseStyle = { filter: action === 'hit' ? 'drop-shadow(0 0 12px #ff0000)' : 'none' };
  
  return (
    <svg className="w-24 h-48 sm:w-32 sm:h-64 md:w-[150px] md:h-[300px]" viewBox="0 0 150 300" style={baseStyle}>
      <g className={action === 'hit' ? 'animate-shake' : ''}>
        <g 
          transform={action === 'attack' ? 'translate(20, 0)' : action === 'heavy-attack' ? 'translate(25, 0) rotate(-2)' : action === 'block' ? 'translate(0, 5)' : 'translate(0, 0)'} 
          className="transition-all duration-300"
          style={{ transformOrigin: '75px 250px' }}
        >
          <circle cx="75" cy="50" r="30" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
          <path d="M45 50 Q60 10 75 30 Q90 10 105 50" fill="#2a93d5" stroke="#333" strokeWidth="1" />
          <ellipse cx="65" cy="45" rx="3" ry="5" fill="#333" />
          <ellipse cx="85" cy="45" rx="3" ry="5" fill="#333" />
          <path d="M67 65 Q75 67 83 65" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M60 80 L60 200 L70 200 L75 170 L80 200 L90 200 L90 80 Z" fill="#3f88c5" stroke="#333" strokeWidth="1.5" />
          {action === 'attack' || action === 'heavy-attack' ? (
            <>
              <path d="M60 90 L30 130 L35 135 L65 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L130 120 L125 125 L85 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
              <g transform="translate(120, 110) rotate(15)">
                <rect x="0" y="0" width="25" height="10" rx="2" fill="#555" />
                <rect x="0" y="0" width="15" height="15" rx="2" fill="#333" />
                <line x1="25" y1="5" x2="40" y2="5" stroke="#ff6b6b" strokeWidth="1" strokeDasharray="2,2" />
              </g>
              {action === 'heavy-attack' ? (
                  <g className="muzzle-flash-fx" transform="translate(140, 112) rotate(15)" style={{ transformOrigin: '0 0' }}>
                      <path d="M0,0 L30,-12 L18,0 L30,12 Z" fill="#ff4d4d" />
                      <path d="M5,-12 L40,-24 L24,-12 L40,0 Z" fill="#FFA500" opacity="0.8" />
                      <circle cx="12" cy="0" r="12" fill="white" opacity="0.7" />
                  </g>
              ) : (
                  <g className="muzzle-flash-fx" transform="translate(140, 112) rotate(15)" style={{ transformOrigin: '0 0' }}>
                      <path d="M0,0 L15,-5 L8,0 L15,5 Z" fill="#FFD700" />
                      <path d="M5,-5 L20,-10 L12,-5 L20,0 Z" fill="#FFA500" opacity="0.8" />
                  </g>
              )}
            </>
          ) : action === 'block' ? (
            <>
              <path d="M60 90 L40 140 L45 145 L65 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L90 150 L95 145 L90 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
              <g className="shield-up-fx" style={{ transformOrigin: '65px 155px' }}>
                <rect x="40" y="120" width="50" height="70" rx="5" fill="#6c757d" stroke="#333" strokeWidth="2" />
                <path d="M45 130 L85 130 L85 180 L45 180 Z" fill="#007bff" fillOpacity="0.3" stroke="#333" strokeWidth="1" />
              </g>
            </>
          ) : action === 'load' ? (
            <>
               <path d="M60 90 L30 120 L35 125 L65 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
               <path d="M90 90 L110 110 L105 115 L85 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
               <g transform="translate(30, 110) rotate(-10)">
                  <circle cx="0" cy="0" r="12" fill="#444" stroke="#222" strokeWidth="1.5" />
                  <circle cx="0" cy="-8" r="3" fill="#ffcc00" />
               </g>
            </>
          ) : (
            <>
              <path d="M60 90 L40 140 L45 145 L65 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L110 140 L105 145 L85 100" fill="#f8d7c9" stroke="#333" strokeWidth="1.5" />
            </>
          )}
          <path d="M70 200 L65 260 L60 260 L60 270 L80 270 L80 260 L75 260 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
          <path d="M80 200 L85 260 L90 260 L90 270 L70 270 L70 260 L75 260 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
};

export const EnemyCharacter: React.FC<CharacterProps> = ({ action = 'normal' }) => {
  const baseStyle = { filter: action === 'hit' ? 'drop-shadow(0 0 12px #ff0000)' : 'none' };
  
  return (
    <svg className="w-24 h-48 sm:w-32 sm:h-64 md:w-[150px] md:h-[300px]" viewBox="0 0 150 300" style={baseStyle}>
      <g className={action === 'hit' ? 'animate-shake' : ''}>
        <g 
          transform={action === 'attack' ? 'translate(-20, 0)' : action === 'heavy-attack' ? 'translate(-25, 0) rotate(2)' : action === 'block' ? 'translate(0, 5)' : 'translate(0, 0)'} 
          className="transition-all duration-300"
          style={{ transformOrigin: '75px 250px' }}
        >
          <circle cx="75" cy="50" r="30" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
          <path d="M45 50 Q60 10 75 20 Q90 10 105 50" fill="#7d1a0c" stroke="#333" strokeWidth="1" />
          <path d="M60 40 L70 45 L60 50" fill="#333" />
          <path d="M90 40 L80 45 L90 50" fill="#333" />
          <path d="M65 67 Q75 65 85 67" stroke="#333" strokeWidth="2" fill="none" />
          <path d="M60 80 L55 200 L70 200 L75 170 L80 200 L95 200 L90 80 Z" fill="#8b0000" stroke="#333" strokeWidth="1.5" />
          {action === 'attack' || action === 'heavy-attack' ? (
            <>
              <path d="M60 90 L20 120 L25 125 L65 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L120 130 L115 135 L85 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
              <g transform="translate(5, 110) rotate(-15)">
                <rect x="0" y="0" width="25" height="10" rx="2" fill="#555" />
                <rect x="15" y="-5" width="15" height="15" rx="2" fill="#333" />
                <line x1="-15" y1="5" x2="0" y2="5" stroke="#ff6b6b" strokeWidth="1" strokeDasharray="2,2" />
              </g>
              {action === 'heavy-attack' ? (
                <g className="muzzle-flash-fx" transform="translate(10, 112) rotate(-15)" style={{ transformOrigin: '0 0' }}>
                    <path d="M0,0 L-30,-12 L-18,0 L-30,12 Z" fill="#ff4d4d" />
                    <path d="M-5,-12 L-40,-24 L-24,-12 L-40,0 Z" fill="#FFA500" opacity="0.8" />
                    <circle cx="-12" cy="0" r="12" fill="white" opacity="0.7" />
                </g>
              ) : (
                <g className="muzzle-flash-fx" transform="translate(10, 112) rotate(-15)" style={{ transformOrigin: '0 0' }}>
                    <path d="M0,0 L-15,-5 L-8,0 L-15,5 Z" fill="#FFD700" />
                    <path d="M-5,-5 L-20,-10 L-12,-5 L-20,0 Z" fill="#FFA500" opacity="0.8" />
                </g>
              )}
            </>
          ) : action === 'block' ? (
            <>
              <path d="M60 90 L50 140 L55 145 L65 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L100 140 L95 145 L85 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
              <g className="shield-up-fx" style={{ transformOrigin: '85px 155px' }}>
                <rect x="60" y="120" width="50" height="70" rx="5" fill="#6c757d" stroke="#333" strokeWidth="2" />
                <path d="M65 130 L105 130 L105 180 L65 180 Z" fill="#dc3545" fillOpacity="0.3" stroke="#333" strokeWidth="1" />
              </g>
            </>
          ) : action === 'load' ? (
             <>
               <path d="M60 90 L30 120 L35 125 L65 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
               <path d="M90 90 L120 110 L115 115 L85 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
               <g transform="translate(120, 110) rotate(10)">
                   <circle cx="0" cy="0" r="12" fill="#444" stroke="#222" strokeWidth="1.5" />
                   <circle cx="0" cy="-8" r="3" fill="#ffcc00" />
               </g>
             </>
          ) : (
            <>
              <path d="M60 90 L40 140 L45 145 L65 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
              <path d="M90 90 L110 140 L105 145 L85 100" fill="#e3c3b8" stroke="#333" strokeWidth="1.5" />
            </>
          )}
          <path d="M70 200 L60 260 L55 260 L55 270 L75 270 L75 260 L70 260 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
          <path d="M80 200 L90 260 L95 260 L95 270 L75 270 L75 260 L80 260 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1.5" />
        </g>
      </g>
    </svg>
  );
};