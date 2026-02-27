import type { GameState } from '../types';

export const calculateProgressiveDamage = (fireCount: number): number => {
  if (fireCount <= 0) return 0;
  if (fireCount <= 3) return fireCount;
  if (fireCount === 4) return 5;
  if (fireCount >= 5) return 7;
  return 0; // Should not happen with bullet limits
};

const actionNameMap: Record<string, string> = {
    'fire': '발사',
    'defend': '반사',
    'evade': '회피',
    'heal': '회복',
    'load': '장전'
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
    
    const pName = (state.gameMode === 'pvp' || state.gameMode === 'localPvp') ? '플레이어 1' : '플레이어';
    const eName = (state.gameMode === 'pvp' || state.gameMode === 'localPvp') ? '플레이어 2' : '상대';

    const pActionName = actionNameMap[pAction] || pAction;
    const eActionName = actionNameMap[eAction] || eAction;

    battleLog.push(`▶ [${pName}] ${pActionName} 🆚 [${eName}] ${eActionName}`);

    let playerDamage = (pAction === 'fire') ? calculateProgressiveDamage(pFireCount) : 0;
    let enemyDamage = (eAction === 'fire') ? calculateProgressiveDamage(eFireCount) : 0;
    
    // --- Interaction Phase ---
    let playerDefended = false;
    if (pAction === 'defend') {
        playerDefenseLeft--;
        if (eAction === 'fire') {
            playerDamage += enemyDamage;
            enemyDamage = 0;
            battleLog.push(`🛡️ ${pName}이(가) 공격을 반사했습니다!`);
            playerDefended = true;
        } else {
            battleLog.push(`🛡️ ${pName}의 반사가 빗나갔습니다.`);
        }
    }
    
    let enemyDefended = false;
    if (eAction === 'defend') {
        enemyDefenseLeft--;
        if (pAction === 'fire') {
            enemyDamage += playerDamage;
            playerDamage = 0;
            battleLog.push(`🛡️ ${eName}이(가) 공격을 반사했습니다!`);
            enemyDefended = true;
        } else {
            battleLog.push(`🛡️ ${eName}의 반사가 빗나갔습니다.`);
        }
    }

    if (pAction === 'evade') {
        playerEvadeLeft--;
        if (eAction === 'fire') {
            enemyDamage = 0;
            battleLog.push(`💨 ${pName}이(가) 공격을 회피했습니다!`);
        } else {
             battleLog.push(`💨 ${pName}의 회피가 빗나갔습니다.`);
        }
    }

    if (eAction === 'evade') {
        enemyEvadeLeft--;
        if (pAction === 'fire') {
            playerDamage = 0;
            battleLog.push(`💨 ${eName}이(가) 공격을 회피했습니다!`);
        } else {
            battleLog.push(`💨 ${eName}의 회피가 빗나갔습니다.`);
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
        battleLog.push(`✨ ${pName}이(가) 체력을 회복했습니다. (다음 턴 취약)`);
    }
    if (eAction === 'heal') {
        enemyHealth = Math.min(6, enemyHealth + 2);
        nextTurnEnemyVulnerable = true;
        enemyHealLeft--;
        battleLog.push(`✨ ${eName}이(가) 체력을 회복했습니다. (다음 턴 취약)`);
    }

    if (pAction === 'load') {
        playerBullets = Math.min(5, playerBullets + 1);
        battleLog.push(`🔄 ${pName}이(가) 장전했습니다.`);
    }
    if (eAction === 'load') {
        enemyBullets = Math.min(5, enemyBullets + 1);
        battleLog.push(`🔄 ${eName}이(가) 장전했습니다.`);
    }

    // --- Damage Calculation ---
    if (playerDamage > 0) {
        const totalDamage = playerDamage + (state.enemyVulnerable ? 1 : 0);
        enemyHealth -= totalDamage;
        const vulnText = state.enemyVulnerable ? ' (취약 상태 +1)' : '';
        if (playerDefended) {
            battleLog.push(`💥 반사된 공격으로 ${eName}이(가) ${totalDamage}의 데미지를 입었습니다!${vulnText}`);
        } else {
            battleLog.push(`💥 ${pName}이(가) ${eName}에게 ${totalDamage}의 데미지를 입혔습니다!${vulnText}`);
        }
    }
    if (enemyDamage > 0) {
        const totalDamage = enemyDamage + (state.playerVulnerable ? 1 : 0);
        playerHealth -= totalDamage;
        const vulnText = state.playerVulnerable ? ' (취약 상태 +1)' : '';
        if (enemyDefended) {
            battleLog.push(`💥 반사된 공격으로 ${pName}이(가) ${totalDamage}의 데미지를 입었습니다!${vulnText}`);
        } else {
            battleLog.push(`💥 ${eName}이(가) ${pName}에게 ${totalDamage}의 데미지를 입혔습니다!${vulnText}`);
        }
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
        playerDamageTaken: enemyDamage > 0 && !playerDefended ? enemyDamage + (state.playerVulnerable ? 1 : 0) : null,
        enemyDamageTaken: playerDamage > 0 && !enemyDefended ? playerDamage + (state.enemyVulnerable ? 1 : 0) : null,
    };
};
