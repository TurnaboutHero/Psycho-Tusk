import React from 'react';
import type { GameAction } from '../types';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PassDeviceProps {
    dispatch: React.Dispatch<GameAction>;
}

const PassDevice: React.FC<PassDeviceProps> = ({ dispatch }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-zinc-900 rounded-3xl p-10 text-center max-w-sm border border-zinc-800 shadow-2xl mx-4"
            >
                <div className="bg-zinc-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-zinc-700/50">
                  <ArrowLeftRight className="w-12 h-12 text-zinc-300" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-zinc-100 tracking-tight">플레이어 2의 턴</h2>
                <p className="text-zinc-400 mb-10 text-sm leading-relaxed">
                  기기를 플레이어 2에게 전달하고<br/>준비가 되면 아래 버튼을 누르세요.
                </p>
                <button 
                    onClick={() => dispatch({ type: 'ADVANCE_LOCAL_TURN' })} 
                    className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-4 px-8 rounded-xl w-full transition-colors shadow-lg"
                >
                    준비 완료
                </button>
            </motion.div>
        </div>
    );
};

export default PassDevice;