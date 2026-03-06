import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

interface DisconnectOverlayProps {
    isVisible: boolean;
    initialTimer: number | null;
}

const DisconnectOverlay: React.FC<DisconnectOverlayProps> = ({ isVisible, initialTimer }) => {
    const [timeLeft, setTimeLeft] = useState(initialTimer || 10);

    useEffect(() => {
        if (isVisible) {
            setTimeLeft(initialTimer || 10);
            const interval = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isVisible, initialTimer]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-red-500/50 text-center max-w-md mx-4 animate-pulse">
                <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">상대방 연결 끊김</h2>
                <p className="text-gray-400 mb-6">
                    상대방의 연결이 불안정합니다.<br/>
                    재연결을 기다리고 있습니다.
                </p>
                <div className="text-5xl font-mono font-bold text-red-400 mb-2">
                    {timeLeft}
                </div>
                <p className="text-sm text-gray-500">초 후 게임이 종료됩니다.</p>
            </div>
        </div>
    );
};

export default DisconnectOverlay;
