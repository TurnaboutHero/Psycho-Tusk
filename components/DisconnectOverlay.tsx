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
            <div className="bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-red-500/30 text-center max-w-md mx-4 animate-pulse">
                <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight">상대방 연결 끊김</h2>
                <p className="text-zinc-400 mb-8 text-sm">
                    상대방의 연결이 불안정합니다.<br/>
                    재연결을 기다리고 있습니다.
                </p>
                <div className="text-6xl font-mono font-black text-red-500 mb-3">
                    {timeLeft}
                </div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">초 후 게임이 종료됩니다</p>
            </div>
        </div>
    );
};

export default DisconnectOverlay;
