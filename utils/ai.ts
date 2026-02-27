import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, EnemyDecision, ActionType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The required JSON schema for the AI's response.
const schema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: ['load', 'fire', 'defend', 'evade', 'heal'],
      description: '수행할 전략적 행동입니다.'
    },
    count: {
      type: Type.INTEGER,
      description: '"fire" 행동에 사용할 총알의 수입니다. 다른 모든 행동 유형의 경우 1이어야 합니다.'
    }
  },
  required: ['type', 'count']
};

/**
 * Returns a string with difficulty instructions based on the player's rating.
 * @param rating The player's current rating.
 * @returns A string of instructions for the AI persona.
 */
function getDifficultyInstructions(rating: number): string {
    if (rating >= 1700) {
        return `**난이도: 마스터.** 당신은 상대의 마음을 읽는 심리전의 대가입니다. 블러핑, 함정 설치, 상대의 과거 행동 패턴을 깊이 분석하여 예측 불가능한 플레이로 상대를 압도하세요. 매우 공격적이고 과감한 결정을 내리세요.`;
    } else if (rating >= 1400) {
        return `**난이도: 전문가.** 당신은 공격적인 전술가입니다. 상대의 약점을 파고들어 강력한 연속 공격으로 몰아붙이세요. 상대가 '회복' 후 취약해졌을 때를 놓치지 말고 최대한의 피해를 입히는 데 집중하세요.`;
    } else if (rating >= 1100) {
        return `**난이도: 보통.** 당신은 균형 잡힌 전략가입니다. 기본적인 전술을 구사하며, 위험과 보상을 계산하여 안정적인 플레이를 지향하세요. 상대의 행동에 적절히 대응하는 데 집중하세요.`;
    } else {
        return `**난이도: 초보.** 당신은 신중한 학습자입니다. 공격보다는 방어와 자원(총알) 축적을 우선시하세요. 때로는 명백한 실수를 저지르기도 합니다. 안전한 '장전'이나 '반사'를 더 자주 선택하는 경향이 있습니다.`;
    }
}


/**
 * Constructs the prompt string to be sent to the Gemini API.
 * @param state The current game state.
 * @returns A detailed prompt for the AI to make its decision.
 */
function createAIPrompt(state: GameState): string {
  const difficultyInstructions = getDifficultyInstructions(state.playerRating);
  return `
당신은 "심리 Tusk"라는 턴제 심리 결투 게임의 마스터 전략가 AI 상대입니다.
당신의 목표는 인간 플레이어의 체력을 0으로 만들어 패배시키는 것입니다. 당신의 결정은 단순한 반응이 아니라, 상대방의 심리를 읽고, 위험을 계산하며, 장기적인 계획을 세우는 것에 기반해야 합니다.

**게임 규칙:**
- 각 플레이어는 6 HP, 1 총알로 시작합니다. 최대 HP는 6, 최대 총알은 5입니다.
- 행동은 동시에 선택된 후 해결됩니다.
- **시간 제한/무승부:** 게임이 50턴을 초과하면, 두 플레이어 모두 생존해 있을 경우 무승부로 간주됩니다. 장기전을 피하고 결정적인 행동을 취하도록 계획하세요.

**행동 설명:**
- **장전 (load)**: 총알 1개를 얻습니다. (최대 5개까지 보유)
- **발사 (fire)**: 총알을 사용하여 상대에게 피해를 줍니다. 발사하는 총알 수에 따라 피해량이 비선형적으로 증가합니다:
  - 1발 발사: 1 데미지
  - 2발 발사: 2 데미지
  - 3발 발사: 3 데미지
  - 4발 발사: 5 데미지 (효율적인 보너스 공격)
  - 5발 발사: 7 데미지 (가장 강력한 공격)
- **반사 (defend)**: (3회 사용) 상대방이 발사하면 데미지를 받지 않고 반사합니다. 상대가 발사하지 않으면 충전 횟수만 낭비됩니다.
- **회피 (evade)**: (1회 사용) 반사 충전 횟수가 0일 때만 사용 가능합니다. 상대의 발사 공격을 무효화합니다.
- **회복 (heal)**: (2회 사용) HP가 3 이하일 때만 사용 가능합니다. HP를 2 회복합니다. **중요한 대가:** 이 행동을 사용하면, 바로 다음 턴에 '취약' 상태가 됩니다. 취약 상태에서는 상대방의 모든 공격으로부터 1의 추가 데미지를 받습니다. 이 효과는 한 턴 동안만 지속됩니다.

**현재 게임 상태:**
- 턴 번호: ${state.turnCount}
- 당신 (AI)의 HP: ${state.enemyHealth}
- 당신 (AI)의 총알: ${state.enemyBullets}
- 당신 (AI)의 반사 남은 횟수: ${state.enemyDefenseLeft}
- 당신 (AI)의 회피 남은 횟수: ${state.enemyEvadeLeft}
- 당신 (AI)의 회복 남은 횟수: ${state.enemyHealLeft}
- 당신은 취약 상태인가?: ${state.enemyVulnerable}

- 상대 (플레이어)의 HP: ${state.playerHealth}
- 상대 (플레이어)의 총알: ${state.playerBullets}
- 상대 (플레이어)의 반사 남은 횟수: ${state.playerDefenseLeft}
- 상대 (플레이어)의 회피 남은 횟수: ${state.playerEvadeLeft}
- 상대 (플레이어)의 회복 남은 횟수: ${state.playerHealLeft}
- 상대는 취약 상태인가?: ${state.playerVulnerable}
- 플레이어의 현재 레이팅: ${state.playerRating}

**최근 행동 (참고용):**
${state.battleLog.slice(-6).join('\n')}

**당신의 현재 성격 및 난이도:**
${difficultyInstructions}

**전략적 지침:**
위의 지침을 사용하여 깊이 생각하고 최선의 행동을 결정하세요.

1.  **상대방 심층 분석 (전투 기록 기반):**
    *   단순한 경향을 넘어 순차적인 패턴을 찾으세요. 상대는 'heal' 이후에 항상 'defend'를 하나요? 'load'를 두 번 한 후에 항상 'fire'를 하나요?
    *   상대의 자원 사용 방식을 분석하세요. 'defend' 횟수를 아끼는 편인가요, 아니면 무모하게 사용하나요? 상대의 남은 자원은 그의 다음 행동을 예측하는 중요한 단서입니다.
    *   상대의 현재 총알 수와 체력을 바탕으로 가장 가능성 있는 행동을 예측하세요. 예를 들어, 상대의 총알이 많고 당신의 체력이 낮다면, 상대는 'fire'를 할 가능성이 매우 높습니다. 이에 대비해야 합니다.

2.  **전술적 위험 및 보상 계산:**
    *   **발사 vs. 장전:** 적은 총알로 즉각적인 압박을 가하는 것이 강력한 공격을 위해 총알을 모으는 것보다 나은가요? 상대가 큰 공격을 버틸 수 있는지 고려하세요. 4발(5 데미지) 공격은 상대의 체력이 6이고 'heal' 할 수 있다면 효과가 떨어집니다. 때로는 1발로 상대를 끝내거나, 상대의 'defend'를 유도하는 것이 더 나은 전략일 수 있습니다.
    *   **회복:** 'heal'은 잘못 사용하면 함정이 될 수 있습니다. 다음 '취약' 턴에서 살아남을 확신이 있을 때만 사용하세요. 상대의 총알 수를 확인하세요. 상대가 2개 이상의 총알을 가지고 있다면 'heal'은 극도로 위험한 선택입니다.
    *   **반사/회피:** 성공적인 'defend'는 게임의 흐름을 완전히 바꿀 수 있습니다. 하지만 낭비된 'defend'는 재앙입니다. 상대가 'fire'할 것이라는 강한 확신이 있을 때만 사용하세요. 미끼에 걸리지 마세요. 'defend'가 없다면, 'evade'는 당신의 마지막 방어 수단이므로 소중히 다루세요.

3.  **심리전 및 속임수:**
    *   **예측 불가능성:** 스스로 패턴에 빠지지 마세요. 방금 'fire'했다면, 상대는 또 다른 'fire'를 예상하지 못할 수 있습니다. 상대를 놀라게 하세요. 때로는 상대가 'fire'를 예상할 때 'load'하는 것과 같은 예상 밖의 행동이 상대의 계획을 망칠 수 있습니다.
    *   **블러핑:** 행동의 '위협'이 실제 행동보다 더 강력할 수 있습니다. 당신이 5개의 총알을 가지고 있다면, 상대는 'fire'를 극도로 경계할 것입니다. 이때 'load'를 한 번 더 하여 상대의 'defend'를 유도하고 자원을 낭비하게 만들면서, 당신은 더욱 강력해질 수 있습니다.
    *   **취약 상태 활용:** 상대가 '취약' 상태일 때는 절호의 기회입니다. 당신이 즉각적인 위험에 처해 있지 않다면, 데미지를 극대화하기 위해 'fire'를 최우선으로 고려하세요.

**최종 지시:**
위의 전략적 분석을 바탕으로, 이번 턴에 당신이 취할 가장 최적의 행동을 결정하세요. 당신의 응답은 반드시 당신의 결정을 나타내는 JSON 객체여야 합니다. 설명이나 추가 텍스트 없이 JSON 객체만 반환하세요.
`;
}

/**
 * Validates the AI's decision against the current game rules and state.
 * If the decision is invalid, it corrects it to a legal move, providing console
 * warnings for easier debugging.
 * @param decision The decision made by the AI.
 * @param state The current game state.
 * @returns A valid EnemyDecision.
 */
function validateAIDecision(decision: EnemyDecision, state: GameState): EnemyDecision {
    const {
        enemyBullets,
        enemyDefenseLeft,
        enemyEvadeLeft,
        enemyHealth,
        enemyHealLeft
    } = state;

    // 1. Validate 'fire' action
    if (decision.type === 'fire') {
        // Cannot fire with no bullets. Fallback to a safe action like 'load'.
        if (enemyBullets <= 0) {
            console.warn(`AI Validation: Attempted to fire with 0 bullets. Falling back to 'load'.`);
            return { type: 'load', count: 1 };
        }
        // If fire count is invalid (less than 1 or more than available), correct it to max possible.
        if (decision.count <= 0 || decision.count > enemyBullets) {
            console.warn(`AI Validation: Corrected invalid fire count (${decision.count}) to max available (${enemyBullets}).`);
            return { type: 'fire', count: enemyBullets };
        }
    }

    // 2. Validate 'defend' action
    if (decision.type === 'defend' && enemyDefenseLeft <= 0) {
        console.warn(`AI Validation: Attempted to defend with 0 charges. Falling back to 'load'.`);
        return { type: 'load', count: 1 };
    }

    // 3. Stricter validation for 'heal' action
    if (decision.type === 'heal') {
        if (enemyHealLeft <= 0) {
            console.warn(`AI Validation: Attempted to heal with 0 charges left. Falling back to 'load'.`);
            return { type: 'load', count: 1 };
        }
        if (enemyHealth > 3) {
            console.warn(`AI Validation: Attempted to heal with HP > 3 (Current HP: ${enemyHealth}). Falling back to 'load'.`);
            return { type: 'load', count: 1 };
        }
    }

    // 4. Stricter validation for 'evade' action
    if (decision.type === 'evade') {
        if (enemyEvadeLeft <= 0) {
            console.warn(`AI Validation: Attempted to evade with 0 charges left. Falling back to 'load'.`);
            return { type: 'load', count: 1 };
        }
        if (enemyDefenseLeft > 0) {
            console.warn(`AI Validation: Attempted to evade while defend charges are available (Defends left: ${enemyDefenseLeft}). Falling back to 'load'.`);
            return { type: 'load', count: 1 };
        }
    }

    // 5. Ensure count is 1 for any non-fire actions as per game rules.
    if (decision.type !== 'fire' && decision.count !== 1) {
        console.warn(`AI Validation: Corrected count for non-fire action '${decision.type}' to 1.`);
        return { ...decision, count: 1 };
    }

    // If all checks pass, the decision from the AI is valid.
    return decision;
}


/**
 * Determines the enemy AI's action by calling the Gemini API.
 * Includes robust error handling for API failures, invalid JSON, and schema mismatches.
 * @param state The current game state.
 * @returns A promise that resolves to the AI's decided action.
 */
export const determineEnemyAction = async (state: GameState): Promise<EnemyDecision> => {
  const prompt = createAIPrompt(state);
  
  const fallbackAction = (): EnemyDecision => {
    // A simple, safe fallback: fire if possible, otherwise load.
    if (state.enemyBullets > 0) {
        return { type: 'fire', count: 1 };
    }
    return { type: 'load', count: 1 };
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    
    // For debugging, it's useful to see the raw response.
    console.log("Gemini Raw Response Text:", response.text);

    let aiDecision: any;
    try {
      // The Gemini API with responseSchema should return valid JSON, but we parse defensively.
      aiDecision = JSON.parse(response.text);
    } catch (parseError) {
      console.error("Gemini response was not valid JSON. Falling back to default action.", {
        responseText: response.text,
        error: parseError,
      });
      return fallbackAction();
    }

    // After parsing, validate if the object structure matches our expected schema.
    const validActionTypes: ActionType[] = ['load', 'fire', 'defend', 'evade', 'heal'];
    if (
      typeof aiDecision !== 'object' ||
      aiDecision === null ||
      typeof aiDecision.type !== 'string' ||
      !validActionTypes.includes(aiDecision.type) ||
// FIX: A typo was causing a validation error. The check was on `ai.decision.count` instead of `aiDecision.count`.
      typeof aiDecision.count !== 'number'
    ) {
      console.error("Gemini JSON response does not match the required schema. Falling back to default action.", {
        responseObject: aiDecision,
      });
      return fallbackAction();
    }
    
    // Finally, validate the AI's decision to ensure it's a legal move within the game rules.
    return validateAIDecision(aiDecision as EnemyDecision, state);

  } catch (apiError) {
    console.error("Gemini API call failed, falling back to default action.", apiError);
    return fallbackAction();
  }
};