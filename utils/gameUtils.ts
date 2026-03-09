import type { GameState } from '../types';

const actionNameMap: Record<string, string> = {
    'fire': '발사',
    'block': '반사',
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
    let playerBlockLeft = state.playerBlockLeft;
    
    let enemyHealth = state.enemyHealth;
    let enemyBullets = state.enemyBullets;
    let enemyBlockLeft = state.enemyBlockLeft;

    const battleLog: string[] = [...state.battleLog];
    let turnResult = '';
    
    const pName = (state.gameMode === 'pvp' || state.gameMode === 'localPvp') ? '플레이어 1' : '플레이어';
    const eName = (state.gameMode === 'pvp' || state.gameMode === 'localPvp') ? '플레이어 2' : '상대';

    const pActionName = actionNameMap[pAction] || pAction;
    const eActionName = actionNameMap[eAction] || eAction;

    battleLog.push(`▶ [${pName}] ${pActionName} 🆚 [${eName}] ${eActionName}`);

    let playerDamageToEnemy = 0;
    let enemyDamageToPlayer = 0;

    if (pAction === 'fire') {
        playerBullets -= pFireCount;
        playerDamageToEnemy = pFireCount;
    }
    if (eAction === 'fire') {
        enemyBullets -= eFireCount;
        enemyDamageToPlayer = eFireCount;
    }

    if (pAction === 'load') {
        playerBullets = Math.min(5, playerBullets + 1);
    }
    if (eAction === 'load') {
        enemyBullets = Math.min(5, enemyBullets + 1);
    }

    let playerDefended = false;
    let enemyDefended = false;

    if (pAction === 'block' && eAction === 'block') {
        battleLog.push(`🛡️ 양측 모두 반사를 시도했습니다. (반사 횟수 차감 없음)`);
    } else {
        if (pAction === 'block') {
            playerBlockLeft--;
            if (eAction === 'fire') {
                playerDamageToEnemy += enemyDamageToPlayer;
                enemyDamageToPlayer = 0;
                playerDefended = true;
                battleLog.push(`🛡️ ${pName}이(가) 공격을 반사했습니다!`);
            } else {
                battleLog.push(`🛡️ ${pName}의 반사가 낭비되었습니다.`);
            }
        }
        if (eAction === 'block') {
            enemyBlockLeft--;
            if (pAction === 'fire') {
                enemyDamageToPlayer += playerDamageToEnemy;
                playerDamageToEnemy = 0;
                enemyDefended = true;
                battleLog.push(`🛡️ ${eName}이(가) 공격을 반사했습니다!`);
            } else {
                battleLog.push(`🛡️ ${eName}의 반사가 낭비되었습니다.`);
            }
        }
    }

    if (playerDamageToEnemy > 0) {
        enemyHealth -= playerDamageToEnemy;
        if (playerDefended) {
            battleLog.push(`💥 반사된 공격으로 ${eName}이(가) ${playerDamageToEnemy}의 데미지를 입었습니다!`);
        } else {
            battleLog.push(`💥 ${pName}이(가) ${eName}에게 ${playerDamageToEnemy}의 데미지를 입혔습니다!`);
        }
    }
    
    if (enemyDamageToPlayer > 0) {
        playerHealth -= enemyDamageToPlayer;
        if (enemyDefended) {
            battleLog.push(`💥 반사된 공격으로 ${pName}이(가) ${enemyDamageToPlayer}의 데미지를 입었습니다!`);
        } else {
            battleLog.push(`💥 ${eName}이(가) ${pName}에게 ${enemyDamageToPlayer}의 데미지를 입혔습니다!`);
        }
    }

    if (playerDamageToEnemy > 0 && enemyDamageToPlayer > 0 && !playerDefended && !enemyDefended) {
        turnResult = '총격전!';
    } else if (playerDamageToEnemy > 0) {
        turnResult = '공격 성공!';
    } else if (enemyDamageToPlayer > 0) {
        turnResult = '공격 당함!';
    } else {
        turnResult = '교착 상태';
    }

    // Game Over Check
    let gameResult = '';
    let p1Wins = state.p1Wins;
    let p2Wins = state.p2Wins;
    let roomStatus = state.roomStatus;
    let round = state.round;

    let roundEnded = false;
    let p1WonRound = false;
    let p2WonRound = false;

    if (state.gameMode !== 'tutorial') {
        if (playerHealth <= 0 && enemyHealth <= 0) {
            roundEnded = true;
            playerHealth = 0;
            enemyHealth = 0;
        } else if (enemyHealth <= 0) {
            roundEnded = true;
            p1WonRound = true;
            enemyHealth = 0;
        } else if (playerHealth <= 0) {
            roundEnded = true;
            p2WonRound = true;
            playerHealth = 0;
        } else if (state.turnCount >= 20) {
            roundEnded = true;
            if (playerHealth > enemyHealth) {
                p1WonRound = true;
            } else if (enemyHealth > playerHealth) {
                p2WonRound = true;
            }
        }

        if (roundEnded) {
            if (p1WonRound) p1Wins += 1;
            if (p2WonRound) p2Wins += 1;

            if (p1Wins >= 2 || p2Wins >= 2 || round >= 3) {
                roomStatus = 'game_end';
                if (p1Wins > p2Wins) gameResult = '승리!';
                else if (p2Wins > p1Wins) gameResult = '패배!';
                else gameResult = '무승부!';
            } else {
                roomStatus = 'round_end';
            }
        }
    } else {
        // In tutorial mode, prevent health from dropping below 1 to avoid death
        if (playerHealth <= 0) playerHealth = 1;
        if (enemyHealth <= 0) enemyHealth = 1;
    }

    let hitEffect: 'player' | 'enemy' | 'both' | null = null;
    if (playerDamageToEnemy > 0 && enemyDamageToPlayer > 0) {
        hitEffect = 'both';
    } else if (playerDamageToEnemy > 0) {
        hitEffect = 'enemy';
    } else if (enemyDamageToPlayer > 0) {
        hitEffect = 'player';
    }

    return {
        playerHealth,
        playerBullets,
        playerBlockLeft,
        enemyHealth,
        enemyBullets,
        enemyBlockLeft,
        battleLog,
        turnResult,
        gameResult,
        p1Wins,
        p2Wins,
        roomStatus,
        showHitEffect: hitEffect,
        playerDamageTaken: enemyDamageToPlayer > 0 ? enemyDamageToPlayer : null,
        enemyDamageTaken: playerDamageToEnemy > 0 ? playerDamageToEnemy : null,
    };
};
