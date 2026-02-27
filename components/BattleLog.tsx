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
    <div className="bg-gray-900 p-4 border-t border-gray-700 max-h-32 overflow-y-auto" ref={logRef}>
      {logs.map((log, index) => (
        <div key={index} className={`text-xs py-1 border-b border-gray-800/50 ${log.startsWith('💥') ? 'text-yellow-300 font-bold' : ''}`}>
          {log}
        </div>
      ))}
    </div>
  );
};

export default BattleLog;
