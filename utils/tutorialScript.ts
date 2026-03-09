import type { GameState } from '../types';
import { initialState } from '../state/initialState';

// This function defines the state for each step of the tutorial.
export const getTutorialStep = (step: number, state: GameState): Partial<GameState> => {
    const baseStats = { playerHealth: 5, enemyHealth: 5 }; // Reset health to prevent death

    switch (step) {
        case 0: // Start, learn to load
            return {
                ...initialState,
                ...baseStats,
                gameMode: 'tutorial',
                battleLog: ['튜토리얼이 시작되었습니다.'],
                tutorialStep: 0,
                tutorialMessage: "환영합니다! 공격하려면 총알이 필요합니다. '장전'을 눌러보세요.",
                highlightedAction: 'load',
                enemyAction: { type: 'load', count: 1 }, // AI will also load for a simple start.
            };

        case 1: // Learn to fire
            return {
                ...baseStats,
                tutorialStep: 1,
                tutorialMessage: "좋습니다! 총알이 장전되었습니다. '발사'를 눌러 공격하세요.",
                highlightedAction: 'fire',
                enemyAction: { type: 'load', count: 1 }, // AI will load again, making it an easy target.
            };

        case 2: // Learn to block
            return {
                ...baseStats,
                tutorialStep: 2,
                playerBullets: 2, // ensure player has bullets
                enemyBullets: 1,  // ensure enemy has a bullet to fire
                tutorialMessage: "명중! 상대의 공격은 '반사'로 막고 데미지를 돌려줄 수 있습니다. (게임당 3번)",
                highlightedAction: 'block',
                enemyAction: { type: 'fire', count: 1 },
            };
            
        case 3: // Learn multi-fire
            return {
                ...baseStats,
                tutorialStep: 3,
                playerBullets: 5, // Give player enough for a big shot
                tutorialMessage: "완벽한 반사! 총알을 모아 한 번에 쏘면 엄청난 데미지를 줍니다. '발사'를 누르고 5발을 쏘세요.",
                highlightedAction: 'fire',
                enemyAction: { type: 'load', count: 1 },
            };
            
        case 4: // Bluffing
            return {
                ...baseStats,
                tutorialStep: 4,
                playerBullets: 5,
                enemyBullets: 1,
                tutorialMessage: "엄청난 파괴력! 총알이 꽉 차도 '장전'을 눌러 상대가 '반사'를 낭비하게 속일 수 있습니다. '장전'을 해보세요.",
                highlightedAction: 'load',
                enemyAction: { type: 'block', count: 1 },
            };
            
        case 5: // Completion
            return {
                ...baseStats,
                tutorialStep: 5,
                turnInProgress: false, // Ensure game is not stuck
                tutorialMessage: "상대가 속아 '반사'를 낭비했습니다! 튜토리얼 완료! 이제 실전에서 증명해 보세요.",
                highlightedAction: null,
            };

        default:
            // Fallback to end the tutorial and go to lobby.
             return {
                gameMode: 'lobby',
             };
    }
};
