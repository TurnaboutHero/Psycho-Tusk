import React from 'react';

interface HowToPlayModalProps {
  show: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">게임 방법</h2>
        
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">게임 목표</h3>
            <p>상대방의 체력(HP)을 0으로 만들어 승리하세요.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">기본 규칙</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>각 플레이어는 6 HP, 1 총알로 시작합니다.</li>
              <li>최대 HP는 6, 최대 총알은 5개입니다.</li>
              <li>각 턴마다 플레이어는 하나의 행동을 선택합니다. 행동은 동시에 처리됩니다.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">행동 설명</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-lg text-white">장전 (Load)</h4>
                <p>총알 1개를 얻습니다. (최대 5개까지 보유 가능)</p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">발사 (Fire)</h4>
                <p>보유한 총알을 사용하여 상대방에게 데미지를 줍니다. 데미지는 발사하는 총알 수에 따라 증가합니다.</p>
                <ul className="list-disc list-inside pl-4 mt-1 text-red-400">
                  <li><span className="font-bold">1-3발 발사 시:</span> 1발당 1 데미지</li>
                  <li><span className="font-bold">4발 발사 시:</span> 총 5 데미지</li>
                  <li><span className="font-bold">5발 발사 시:</span> 총 7 데미지</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">반사 (Defend)</h4>
                 <p>총 3회 사용할 수 있습니다. 상대방이 '발사'를 사용하면, 데미지를 받지 않고 그 데미지를 그대로 상대방에게 되돌려줍니다. 상대방이 '발사'를 사용하지 않으면, 사용 횟수만 1회 차감됩니다.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">회피 (Evade)</h4>
                <p>단 1회만 사용할 수 있습니다. '반사' 사용 횟수가 0일 때만 사용할 수 있으며, 상대방의 '발사' 공격을 완전히 무효화합니다.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">회복 (Heal)</h4>
                <p>총 2회 사용할 수 있습니다. 자신의 HP가 3 이하일 때만 사용할 수 있으며, HP를 2 회복합니다. <span className="text-red-400">대가로 다음 턴에 '취약' 상태가 됩니다.</span></p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">특별 조건</h3>
            <div>
                <h4 className="font-bold text-lg text-white">취약 (Vulnerable)</h4>
                <p>'회복' 행동을 사용한 다음 턴에 이 상태가 됩니다. 취약 상태에서는 받는 모든 데미지가 1 증가합니다. 이 효과는 한 턴 동안 지속됩니다.</p>
              </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
