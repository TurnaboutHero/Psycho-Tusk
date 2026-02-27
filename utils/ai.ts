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
        enemyDefenseLeft,
        enemyEvadeLeft,
        enemyHealth,
        enemyHealLeft,
        playerBullets,
        playerHealth,
        playerVulnerable,
        playerRating
    } = state;

    // Helper to return a valid action
    const action = (type: ActionType, count: number = 1): EnemyDecision => ({ type, count });

    // 1. Master AI (Rating >= 1700)
    if (playerRating >= 1700) {
        // Lethal check: Can I kill the player this turn?
        if (enemyBullets > 0) {
            const maxDmg = enemyBullets >= 5 ? 7 : (enemyBullets === 4 ? 5 : enemyBullets);
            const actualDmg = maxDmg + (playerVulnerable ? 1 : 0);
            if (actualDmg >= playerHealth) {
                return action('fire', enemyBullets);
            }
        }
        
        // Survival check: Can the player kill me this turn?
        if (playerBullets > 0) {
            const pMaxDmg = playerBullets >= 5 ? 7 : (playerBullets === 4 ? 5 : playerBullets);
            if (pMaxDmg >= enemyHealth) {
                if (enemyDefenseLeft > 0) return action('defend');
                if (enemyDefenseLeft === 0 && enemyEvadeLeft > 0) return action('evade');
            }
        }

        // Tactical Heal: Heal if low, but only if player can't punish hard
        if (enemyHealth <= 3 && enemyHealLeft > 0 && playerBullets < 3) {
            return action('heal');
        }

        // Aggressive Fire: Punish vulnerability or fire max damage
        if (playerVulnerable && enemyBullets > 0) return action('fire', enemyBullets);
        if (enemyBullets >= 4) return action('fire', enemyBullets);

        // Smart Defend: Anticipate player firing when they have 3+ bullets
        if (playerBullets >= 3 && enemyDefenseLeft > 0 && Math.random() > 0.3) {
            return action('defend');
        }

        // Default to loading if not maxed, otherwise fire
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 2. Expert AI (Rating >= 1400)
    if (playerRating >= 1400) {
        if (playerVulnerable && enemyBullets > 0) return action('fire', enemyBullets);
        if (enemyHealth <= 3 && enemyHealLeft > 0 && playerBullets <= 1) return action('heal');
        if (playerBullets >= 4 && enemyDefenseLeft > 0) return action('defend');
        if (enemyBullets >= 3) return action('fire', enemyBullets);
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 3. Normal AI (Rating >= 1100)
    if (playerRating >= 1100) {
        if (enemyHealth <= 3 && enemyHealLeft > 0 && Math.random() > 0.5) return action('heal');
        if (playerBullets >= 2 && enemyDefenseLeft > 0 && Math.random() > 0.5) return action('defend');
        if (enemyBullets > 0 && Math.random() > 0.4) return action('fire', enemyBullets);
        if (enemyBullets < 5) return action('load');
        return action('fire', enemyBullets);
    }

    // 4. Beginner AI (Rating < 1100)
    const possibleActions: ActionType[] = ['load'];
    if (enemyBullets > 0) possibleActions.push('fire');
    if (enemyDefenseLeft > 0) possibleActions.push('defend');
    if (enemyDefenseLeft === 0 && enemyEvadeLeft > 0) possibleActions.push('evade');
    if (enemyHealth <= 3 && enemyHealLeft > 0) possibleActions.push('heal');

    const randomAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
    return action(randomAction, randomAction === 'fire' ? enemyBullets : 1);
};