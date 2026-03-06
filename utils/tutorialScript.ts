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
                tutorialMessage: "환영합니다! '심리터스크' 튜토리얼을 시작하겠습니다. 먼저, 총알을 장전해야 합니다. '장전' 버튼을 누르세요.",
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

        case 2: // Learn to block
            return {
                tutorialStep: 2,
                playerBullets: 2, // ensure player has bullets
                enemyBullets: 1,  // ensure enemy has a bullet to fire
                tutorialMessage: "명중! 하지만 상대도 반격할 수 있습니다. '방어'를 사용해 공격을 무효화하고 데미지를 반사하세요. 방어는 3번 사용할 수 있습니다.",
                highlightedAction: 'block',
                enemyAction: { type: 'fire', count: 1 },
            };
            
        case 3: // Learn multi-fire
            return {
                tutorialStep: 3,
                playerBullets: 5, // Give player enough for a big shot
                tutorialMessage: "완벽한 방어! 이제 강력한 공격을 보여줄 시간입니다. 총알을 여러 발 발사하면 그만큼 데미지가 들어갑니다. 최대 5발까지 모을 수 있습니다. '발사'를 누르고 5발을 선택하세요.",
                highlightedAction: 'fire',
                enemyAction: { type: 'load', count: 1 },
            };
            
        case 4: // Bluffing
            return {
                tutorialStep: 4,
                playerBullets: 5,
                enemyBullets: 1,
                tutorialMessage: "엄청난 데미지! 총알이 5발 꽉 차있어도 '장전'을 선택할 수 있습니다. 이를 통해 상대가 방어를 낭비하게 만드는 블러핑이 가능합니다. '장전'을 선택해보세요.",
                highlightedAction: 'load',
                enemyAction: { type: 'block', count: 1 },
            };
            
        case 5: // Completion
            return {
                tutorialStep: 5,
                turnInProgress: false, // Ensure game is not stuck
                tutorialMessage: "상대의 방어가 낭비되었습니다! 튜토리얼 완료! 이제 실전에서 당신의 심리전을 증명해 보세요.",
                highlightedAction: null,
            };

        default:
            // Fallback to end the tutorial and go to lobby.
             return {
                gameMode: 'lobby',
             };
    }
};
