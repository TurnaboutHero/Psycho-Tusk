import type { GameState, EnemyDecision, ActionType } from '../types';

/**
 * Determines the enemy AI's action using a local, rule-based algorithm.
 * This completely removes the dependency on external APIs, ensuring zero cost and no rate limits.
 * @param state The current game state.
 * @returns A promise that resolves to the AI's decided action.
 */
export const determineEnemyAction = async (state: GameState): Promise<EnemyDecision> => {
    // Simulate a slight delay for realism (thinking time)
    await new Promise(resolve => setTimeout(resolve, 800));

    const {
        enemyBullets,
        enemyBlockLeft,
        enemyHealth,
        playerBullets,
        playerHealth,
        playerRating
    } = state;

    // Helper to return a valid action
    const action = (type: ActionType, count: number = 1): EnemyDecision => ({ type, count });

    // 1. Master AI (Rating >= 1700)
    if (playerRating >= 1700) {
        // Lethal check: Can I kill the player this turn?
        if (enemyBullets > 0) {
            if (enemyBullets >= playerHealth) {
                return action('fire', enemyBullets);
            }
        }
        
        // Survival check: Can the player kill me this turn?
        if (playerBullets > 0) {
            if (playerBullets >= enemyHealth) {
                if (enemyBlockLeft > 0) return action('block');
            }
        }

        // Aggressive Fire: fire max damage
        if (enemyBullets >= 4) return action('fire', enemyBullets);

        // Smart Defend: Anticipate player firing when they have 3+ bullets
        if (playerBullets >= 3 && enemyBlockLeft > 0 && Math.random() > 0.3) {
            return action('block');
        }

        // Bluff load
        if (enemyBullets === 5 && Math.random() > 0.5) return action('load');

        // Default to loading if not maxed, otherwise fire
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 2. Expert AI (Rating >= 1400)
    if (playerRating >= 1400) {
        if (playerBullets >= 4 && enemyBlockLeft > 0) return action('block');
        if (enemyBullets >= 3) return action('fire', enemyBullets);
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 3. Normal AI (Rating >= 1100)
    if (playerRating >= 1100) {
        if (playerBullets >= 2 && enemyBlockLeft > 0 && Math.random() > 0.5) return action('block');
        if (enemyBullets > 0 && Math.random() > 0.4) return action('fire', enemyBullets);
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 4. Beginner AI (Rating < 1100)
    const possibleActions: ActionType[] = ['load'];
    if (enemyBullets > 0) possibleActions.push('fire');
    if (enemyBlockLeft > 0) possibleActions.push('block');

    const randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    return action(randomAction, randomAction === 'fire' ? enemyBullets : 1);
};