import React from 'react';
import type { GameAction } from '../types';
// FIX: The 'UserSwitch' icon does not exist in 'lucide-react'. Replaced it with 'ArrowLeftRight' to fix the import error.
import { ArrowLeftRight } from 'lucide-react';

interface PassDeviceProps {
    dispatch: React.Dispatch<GameAction>;
}

const PassDevice: React.FC<PassDeviceProps> = ({ dispatch }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 text-center max-w-sm border-2 border-yellow-500 shadow-lg">
                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                <h2 className="text-3xl font-bold mb-4 text-white">플레이어 2의 턴</h2>
                <p className="text-gray-400 mb-6">기기를 플레이어 2에게 전달하고 준비가 되면 아래 버튼을 누르세요.</p>
                <button 
                    onClick={() => dispatch({ type: 'ADVANCE_LOCAL_TURN' })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg w-full"
                >
                    준비 완료
                </button>
            </div>
        </div>
    );
};

export default PassDevice;