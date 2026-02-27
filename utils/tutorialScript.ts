import type { GameState } from '../types';
import { initialState } from '../state/initialState';

// This function defines the state for each step of the tutorial.
export const getTutorialStep = (step: number, state: GameState): Partial<GameState> => {
    switch (step) {
        case 0: // Start, learn to load
            return {
                ...initialState,
                gameMode: 'tutorial',
                battleLog: ['튜토리얼이 시작되었습니다.'],
                tutorialStep: 0,
                tutorialMessage: "환영합니다! '심리 Tusk' 튜토리얼을 시작하겠습니다. 먼저, 총알을 장전해야 합니다. '장전' 버튼을 누르세요.",
                highlightedAction: 'load',
                enemyAction: { type: 'load', count: 1 }, // AI will also load for a simple start.
            };

        case 1: // Learn to fire
            return {
                tutorialStep: 1,
                tutorialMessage: "좋습니다! 이제 총알이 생겼습니다. 상대를 공격해 봅시다. '발사' 버튼을 누르세요.",
                highlightedAction: 'fire',
                enemyAction: { type: 'load', count: 1 }, // AI will load again, making it an easy target.
            };

        case 2: // Learn to defend
            return {
                tutorialStep: 2,
                playerBullets: 2, // ensure player has bullets
                enemyBullets: 1,  // ensure enemy has a bullet to fire
                tutorialMessage: "명중! 하지만 상대도 반격할 수 있습니다. '반사'를 사용해 공격을 되돌려주세요. 반사는 3번 사용할 수 있습니다.",
                highlightedAction: 'defend',
                enemyAction: { type: 'fire', count: 1 },
            };
            
        case 3: // Learn multi-fire
            return {
                tutorialStep: 3,
                playerBullets: 4, // Give player enough for a big shot
                tutorialMessage: "완벽한 반사! 이제 강력한 공격을 보여줄 시간입니다. 4발을 발사하면 보너스 데미지를 줍니다. '발사'를 누르고 4발을 선택하세요.",
                highlightedAction: 'fire',
                enemyAction: { type: 'load', count: 1 },
            };
            
        case 4: // Learn to heal
            return {
                tutorialStep: 4,
                playerHealth: 2, // Set player health low to enable heal
                playerHealLeft: 1,
                tutorialMessage: "엄청난 데미지! 하지만 당신도 다쳤습니다. 체력이 3 이하일 때 '회복'을 사용할 수 있습니다. HP를 2 회복하지만 다음 턴에 '취약'해집니다.",
                highlightedAction: 'heal',
                enemyAction: { type: 'load', count: 1 },
            };
            
        case 5: // Experience vulnerability
            return {
                tutorialStep: 5,
                enemyBullets: 1,
                tutorialMessage: "회복 완료. 하지만 이제 '취약' 상태가 되어 추가 데미지를 받습니다. 이번 턴에는 어떤 행동도 할 수 없습니다.",
                highlightedAction: null, // No action for player this turn to demonstrate vulnerability
                playerAction: 'load', // force an action so turn processes automatically
                enemyAction: { type: 'fire', count: 1 },
            };

        case 6: // Learn to evade
            return {
                tutorialStep: 6,
                playerDefenseLeft: 0, // ensure no defenses left
                playerEvadeLeft: 1,
                enemyBullets: 1,
                tutorialMessage: "보셨나요? 추가 데미지를 받았습니다. '반사'가 없을 때 최후의 수단은 '회피'입니다. 단 한 번만 사용할 수 있습니다!",
                highlightedAction: 'evade',
                enemyAction: { type: 'fire', count: 1 },
            };

        case 7: // Wind down
            return {
                tutorialStep: 7,
                tutorialMessage: "훌륭합니다! 공격을 피했습니다. 이제 모든 기본기를 배웠습니다.",
                highlightedAction: null,
                playerAction: 'load', // auto-action to process turn
                enemyAction: { type: 'load', count: 1 },
            };

        case 8: // Completion
            return {
                tutorialStep: 8,
                turnInProgress: false, // Ensure game is not stuck
                tutorialMessage: "튜토리얼 완료! 이제 실전에서 당신의 실력을 증명해 보세요.",
                highlightedAction: null,
            };

        default:
            // Fallback to end the tutorial and go to lobby.
             return {
                gameMode: 'lobby',
             };
    }
};
