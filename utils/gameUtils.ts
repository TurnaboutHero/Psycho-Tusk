import type { GameState } from '../types';

export const calculateProgressiveDamage = (fireCount: number): number => {
  if (fireCount <= 0) return 0;
  if (fireCount <= 3) return fireCount;
  if (fireCount === 4) return 5;
  if (fireCount >= 5) return 7;
  return 0; // Should not happen with bullet limits
};

export const calculateTurn = (state: GameState): Partial<GameState> => {
    const pAction = state.playerAction;
    const pFireCount = state.playerFireCount;
    const eAction = state.enemyAction?.type;
    const eFireCount = state.enemyAction?.count ?? 0;

    if (!pAction || !eAction) return {};

    let playerHealth = state.playerHealth;
    let playerBullets = state.playerBullets;
    let playerDefenseLeft = state.playerDefenseLeft;
    let playerEvadeLeft = state.playerEvadeLeft;
    let playerHealLeft = state.playerHealLeft;
    let nextTurnPlayerVulnerable = false;
    
    let enemyHealth = state.enemyHealth;
    let enemyBullets = state.enemyBullets;
    let enemyDefenseLeft = state.enemyDefenseLeft;
    let enemyEvadeLeft = state.enemyEvadeLeft;
    let enemyHealLeft = state.enemyHealLeft;
    let nextTurnEnemyVulnerable = false;

    const battleLog: string[] = [...state.battleLog];
    let turnResult = '';
    
    battleLog.push(`플레이어는 '${pAction}'을(를) 선택했습니다.`);
    battleLog.push(`상대는 '${eAction}'을(를) 선택했습니다.`);

    let playerDamage = (pAction === 'fire') ? calculateProgressiveDamage(pFireCount) : 0;
    let enemyDamage = (eAction === 'fire') ? calculateProgressiveDamage(eFireCount) : 0;
    
    // --- Interaction Phase ---
    let playerDefended = false;
    if (pAction === 'defend') {
        playerDefenseLeft--;
        if (eAction === 'fire') {
            playerDamage += enemyDamage;
            enemyDamage = 0;
            battleLog.push("💥 플레이어가 상대의 공격을 반사했습니다!");
            playerDefended = true;
        } else {
            battleLog.push("플레이어의 반사가 빗나갔습니다.");
        }
    }
    
    let enemyDefended = false;
    if (eAction === 'defend') {
        enemyDefenseLeft--;
        if (pAction === 'fire') {
            enemyDamage += playerDamage;
            playerDamage = 0;
            battleLog.push("💥 상대가 플레이어의 공격을 반사했습니다!");
            enemyDefended = true;
        } else {
            battleLog.push("상대의 반사가 빗나갔습니다.");
        }
    }

    if (pAction === 'evade') {
        playerEvadeLeft--;
        if (eAction === 'fire') {
            enemyDamage = 0;
            battleLog.push("플레이어가 공격을 회피했습니다!");
        } else {
             battleLog.push("플레이어의 회피가 빗나갔습니다.");
        }
    }

    if (eAction === 'evade') {
        enemyEvadeLeft--;
        if (pAction === 'fire') {
            playerDamage = 0;
            battleLog.push("상대가 공격을 회피했습니다!");
        } else {
            battleLog.push("상대의 회피가 빗나갔습니다.");
        }
    }

    // --- Action Resolution Phase ---
    if (pAction === 'fire') {
        playerBullets -= pFireCount;
    }
    if (eAction === 'fire') {
        enemyBullets -= eFireCount;
    }

    if (pAction === 'heal') {
        playerHealth = Math.min(6, playerHealth + 2);
        nextTurnPlayerVulnerable = true;
        playerHealLeft--;
        battleLog.push("플레이어가 HP를 2 회복했습니다.");
    }
    if (eAction === 'heal') {
        enemyHealth = Math.min(6, enemyHealth + 2);
        nextTurnEnemyVulnerable = true;
        enemyHealLeft--;
        battleLog.push("상대가 HP를 2 회복했습니다.");
    }

    if (pAction === 'load') {
        playerBullets = Math.min(5, playerBullets + 1);
        battleLog.push("플레이어가 총알을 1개 장전했습니다.");
    }
    if (eAction === 'load') {
        enemyBullets = Math.min(5, enemyBullets + 1);
        battleLog.push("상대가 총알을 1개 장전했습니다.");
    }

    // --- Damage Calculation ---
    if (playerDamage > 0) {
        const totalDamage = playerDamage + (state.enemyVulnerable ? 1 : 0);
        enemyHealth -= totalDamage;
        battleLog.push(`💥 플레이어가 상대에게 ${totalDamage}의 데미지를 입혔습니다!`);
    }
    if (enemyDamage > 0) {
        const totalDamage = enemyDamage + (state.playerVulnerable ? 1 : 0);
        playerHealth -= totalDamage;
        battleLog.push(`💥 상대가 플레이어에게 ${totalDamage}의 데미지를 입혔습니다!`);
    }

    if (playerDamage > 0 && enemyDamage > 0 && !playerDefended && !enemyDefended) {
        turnResult = '총격전!';
    } else if (playerDamage > 0) {
        turnResult = '공격 성공!';
    } else if (enemyDamage > 0) {
        turnResult = '공격 당함!';
    } else {
        turnResult = '교착 상태';
    }

    // --- Game Over Check ---
    let gameResult = '';
    if (playerHealth <= 0 && enemyHealth <= 0) {
        gameResult = '무승부!';
        playerHealth = 0;
        enemyHealth = 0;
    } else if (enemyHealth <= 0) {
        gameResult = '승리!';
        enemyHealth = 0;
    } else if (playerHealth <= 0) {
        gameResult = '패배!';
        playerHealth = 0;
    }

    return {
        playerHealth,
        playerBullets,
        playerDefenseLeft,
        playerEvadeLeft,
        playerHealLeft,
        playerVulnerable: nextTurnPlayerVulnerable,
        enemyHealth,
        enemyBullets,
        enemyDefenseLeft,
        enemyEvadeLeft,
        enemyHealLeft,
        enemyVulnerable: nextTurnEnemyVulnerable,
        battleLog,
        turnResult,
        gameResult,
        showHitEffect: playerDamage > 0 && !enemyDefended ? 'enemy' : (enemyDamage > 0 && !playerDefended ? 'player' : null),
    };
};
