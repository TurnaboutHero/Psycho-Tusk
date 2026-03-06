import React, { useState, useEffect } from 'react';
import { networkService } from '../utils/network';
import type { GameState, GameAction } from '../types';
import { Gamepad2, Lock, Users, Search, X } from 'lucide-react';
import { motion } from 'motion/react';

interface PvpLobbyProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const PvpLobby: React.FC<PvpLobbyProps> = ({ state, dispatch }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const hasAttemptedReconnect = React.useRef(false);

  useEffect(() => {
    // Fetch initial list of public rooms when component mounts
    const rooms = networkService.getPublicRooms();
    dispatch({ type: 'SET_PUBLIC_ROOMS', payload: rooms });

    const unsubscribe = networkService.onStateUpdate((update) => {
        if (update.type === 'MATCHMAKING_STARTED') {
            setIsSearching(true);
        } else if (update.type === 'MATCHMAKING_CANCELLED') {
            setIsSearching(false);
        }
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    // Attempt auto-reconnect only once when entering the lobby
    const attemptReconnect = async () => {
      if (hasAttemptedReconnect.current) return;
      hasAttemptedReconnect.current = true;
      
      setIsReconnecting(true);
      const { success, state: roomState, playerId } = await networkService.reconnect();
      if (success && roomState && playerId) {
        dispatch({ type: 'SET_ROOM', payload: { roomCode: roomState.roomCode, playerId } });
        dispatch({ type: 'SYNC_STATE', payload: roomState });
        if (roomState.opponentJoined) {
          dispatch({ type: 'OPPONENT_JOINED' });
        }
      }
      setIsReconnecting(false);
    };
    
    // Only attempt reconnect if we don't currently have a room
    if (!state.roomCode) {
      attemptReconnect();
    }
  }, [dispatch, state.roomCode]);

  const handleCreateRoom = async (isPublic: boolean) => {
    const { roomCode, state } = await networkService.createRoom(isPublic);
    dispatch({ type: 'SET_ROOM', payload: { roomCode, playerId: 'player1' } });
    dispatch({ type: 'SYNC_STATE', payload: state });
  };

  const handleJoinRoom = async (code: string) => {
    setError('');
    if (!code) {
        setError('방 코드를 입력해주세요.');
        return;
    }
    const { success, state } = await networkService.joinRoom(code);
    if (success && state) {
      dispatch({ type: 'SET_ROOM', payload: { roomCode: code, playerId: 'player2' } });
      dispatch({ type: 'SYNC_STATE', payload: state });
      if (state.opponentJoined) {
        dispatch({ type: 'OPPONENT_JOINED' });
      }
    } else {
      setError('방을 찾을 수 없거나 가득 찼습니다.');
    }
  };

  if (isReconnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-100 font-sans">
        <div className="text-xl font-medium text-zinc-400 animate-pulse">이전 게임에 재접속 중...</div>
      </div>
    );
  }

  if (state.roomCode && !state.opponentJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-100 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 rounded-2xl shadow-2xl p-10 w-full max-w-md border border-zinc-800 text-center"
        >
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-6">방 코드</h2>
            <div className="bg-zinc-950 p-6 rounded-xl text-5xl font-mono font-bold tracking-[0.2em] mb-8 select-all border border-zinc-800/50">
                {state.roomCode}
            </div>
            <div className="flex items-center justify-center gap-3 text-zinc-400 mb-10">
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 font-medium">상대방을 기다리는 중...</span>
            </div>
            <button onClick={() => {
                networkService.leaveRoom(state.roomCode);
                dispatch({type: 'GO_TO_LOBBY'});
            }} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-3 px-4 rounded-xl transition-colors">
                취소하고 돌아가기
            </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-zinc-950 text-zinc-100 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-zinc-800"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-zinc-400"/>
              PVP 모드
          </h1>
          <div className={`text-xs font-medium px-3 py-1 rounded-full border ${state.isConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              {state.isConnected ? '서버 연결됨' : '연결 끊김'}
          </div>
        </div>
        
        {/* Ranked Matchmaking */}
        <div className="mb-10">
            {isSearching ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-800/20 animate-pulse" />
                    <div className="relative z-10">
                      <Search className="w-8 h-8 text-zinc-400 mx-auto mb-4 animate-spin-slow" />
                      <h2 className="text-lg font-bold text-zinc-100 mb-2">상대방을 찾는 중...</h2>
                      <p className="text-zinc-500 text-sm mb-6">비슷한 실력의 상대를 찾고 있습니다</p>
                      <button 
                          onClick={() => networkService.cancelMatch()}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2 px-6 rounded-full transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                          <X className="w-4 h-4" /> 취소
                      </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => networkService.findMatch()}
                    className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-5 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-3 group"
                >
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-lg">랭크 매치 찾기</span>
                </button>
            )}
        </div>

        <div className="h-px bg-zinc-800 my-8" />

        {/* Create Room Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          <button onClick={() => handleCreateRoom(true)} className="flex items-center justify-center w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-4 px-4 rounded-xl transition-colors border border-zinc-700/50">
            <Users className="w-5 h-5 mr-2 text-zinc-400" /> 공개 방 만들기
          </button>
           <button onClick={() => handleCreateRoom(false)} className="flex items-center justify-center w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-4 px-4 rounded-xl transition-colors border border-zinc-700/50">
            <Lock className="w-5 h-5 mr-2 text-zinc-400" /> 비공개 방 만들기
          </button>
        </div>
        
        {/* Public Rooms List */}
        <div className="mb-8">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">공개 방 목록</h2>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 h-40 overflow-y-auto">
                {state.publicRooms.length > 0 ? (
                    state.publicRooms.map(roomCode => (
                        <div key={roomCode} className="flex justify-between items-center p-3 hover:bg-zinc-900 rounded-lg transition-colors group">
                            <span className="font-mono text-zinc-300 tracking-wider">{roomCode}</span>
                            <button onClick={() => handleJoinRoom(roomCode)} className="bg-zinc-800 group-hover:bg-zinc-100 group-hover:text-zinc-950 text-zinc-300 font-medium py-1.5 px-4 rounded-md text-sm transition-colors">참가</button>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                      입장 가능한 공개 방이 없습니다
                    </div>
                )}
            </div>
        </div>
        
        {/* Join with Code */}
        <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">코드로 참가</h2>
            <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="방 코드 입력"
                  className="w-full bg-zinc-950 text-zinc-100 px-4 py-3 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-600 font-mono tracking-widest transition-colors"
                />
                <button onClick={() => handleJoinRoom(joinCode)} className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-bold py-3 px-6 rounded-xl transition-colors whitespace-nowrap">
                  참가
                </button>
            </div>
            {error && <p className="text-red-500 text-sm pl-1">{error}</p>}
        </div>

        <button onClick={() => {
            if (state.roomCode) {
                networkService.leaveRoom(state.roomCode);
            }
            dispatch({type: 'GO_TO_LOBBY'});
        }} className="mt-8 w-full bg-transparent hover:bg-zinc-800 text-zinc-400 font-medium py-3 px-4 rounded-xl transition-colors border border-zinc-800">
            로비로 돌아가기
        </button>
      </motion.div>
    </div>
  );
};

export default PvpLobby;
