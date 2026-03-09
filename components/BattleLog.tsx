import React, { useRef, useEffect } from 'react';

interface BattleLogProps {
  logs: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-950 px-3 py-1.5 sm:px-4 sm:py-2 h-12 sm:h-20 overflow-y-auto border-t border-zinc-900" ref={logRef}>
      {logs.length === 0 && <div className="text-xs text-zinc-600 text-center mt-4">전투 로그가 여기에 표시됩니다.</div>}
      {logs.map((log, index) => (
        <div key={index} className={`text-[11px] py-0.5 ${log.startsWith('💥') ? 'text-yellow-500 font-bold' : 'text-zinc-400'}`}>
          {log}
        </div>
      ))}
    </div>
  );
};

export default BattleLog;
