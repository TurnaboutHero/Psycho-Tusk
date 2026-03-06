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
    <div className="bg-zinc-950 p-4 max-h-32 overflow-y-auto" ref={logRef}>
      {logs.map((log, index) => (
        <div key={index} className={`text-xs py-1 border-b border-zinc-800/50 ${log.startsWith('💥') ? 'text-yellow-500 font-bold' : 'text-zinc-400'}`}>
          {log}
        </div>
      ))}
    </div>
  );
};

export default BattleLog;
