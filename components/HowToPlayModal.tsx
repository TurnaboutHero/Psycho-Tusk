import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface HowToPlayModalProps {
  show: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold mb-8 text-zinc-50 tracking-tight">게임 방법</h2>
            
            <div className="space-y-8 text-zinc-300">
              <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-3 flex items-center gap-2">
                  <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  게임 목표
                </h3>
                <p className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                  상대방의 체력(HP)을 0으로 만들어 승리하세요.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-3 flex items-center gap-2">
                  <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  기본 규칙
                </h3>
                <ul className="list-disc list-inside space-y-2 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                  <li>각 플레이어는 <strong className="text-emerald-400">5 HP</strong>, <strong className="text-amber-400">0 총알</strong>, <strong className="text-blue-400">3 방어</strong>로 시작합니다.</li>
                  <li>최대 보유 가능한 총알은 5개입니다.</li>
                  <li>각 턴마다 플레이어는 하나의 행동을 선택하며, 행동은 동시에 처리됩니다.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                  <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                  행동 설명
                </h3>
                <div className="space-y-4">
                  <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-lg text-zinc-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      장전 (Load)
                    </h4>
                    <p className="text-zinc-400">총알 1개를 얻습니다. (최대 5개)</p>
                    <p className="text-sm text-zinc-500 mt-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                      💡 <strong className="text-zinc-300">블러핑:</strong> 총알이 5개일 때도 장전을 선택할 수 있습니다. 총알은 늘어나지 않지만 상대방을 속일 수 있습니다.
                    </p>
                  </div>

                  <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-lg text-zinc-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      발사 (Fire)
                    </h4>
                    <p className="text-zinc-400">보유한 총알을 원하는 만큼 사용하여 상대방에게 데미지를 줍니다.</p>
                    <p className="text-sm text-zinc-300 mt-2 font-medium">
                      데미지 = 발사한 총알 개수 (1발당 1데미지)
                    </p>
                  </div>

                  <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50">
                    <h4 className="font-bold text-lg text-zinc-100 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      방어 (Block)
                    </h4>
                    <p className="text-zinc-400">게임 중 총 <strong className="text-blue-400">3회</strong> 사용할 수 있습니다.</p>
                    <p className="text-zinc-400 mt-1">상대방의 '발사' 공격을 완벽히 막아내어 데미지를 0으로 만듭니다.</p>
                    <p className="text-sm text-zinc-500 mt-2 bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                      ⚠️ 상대방이 공격하지 않아도 방어 횟수는 1회 차감됩니다.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-zinc-800">
              <button 
                onClick={onClose} 
                className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HowToPlayModal;
