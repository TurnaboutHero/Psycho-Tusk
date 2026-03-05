import React, { useState, useEffect } from 'react';
import { networkService } from '../utils/network';
import type { GameState, GameAction } from '../types';
import { Gamepad2, Lock, Users } from 'lucide-react';

interface PvpLobbyProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const PvpLobby: React.FC<PvpLobbyProps> = ({ state, dispatch }) => {
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const hasAttemptedReconnect = React.useRef(false);

  useEffect(() => {
    // Fetch initial list of public rooms when component mounts
    const rooms = networkService.getPublicRooms();
    dispatch({ type: 'SET_PUBLIC_ROOMS', payload: rooms });
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <div className="text-2xl font-bold text-blue-400 animate-pulse">이전 게임에 재접속 중...</div>
      </div>
    );
  }

  if (state.roomCode && !state.opponentJoined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">방 코드</h2>
            <div className="bg-gray-900 p-4 rounded-lg text-3xl font-mono tracking-widest mb-6 select-all">
                {state.roomCode}
            </div>
            <p className="text-yellow-400 animate-pulse">상대방을 기다리는 중...</p>
            {/* FIX: Changed action to GO_TO_LOBBY for consistency */}
            <button onClick={() => {
                networkService.leaveRoom(state.roomCode);
                dispatch({type: 'GO_TO_LOBBY'});
            }} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                로비로 돌아가기
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400 flex items-center justify-center">
            <Gamepad2 className="mr-2"/>PVP 모드
        </h1>
        <div className={`text-center mb-4 text-sm ${state.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {state.isConnected ? '● 서버 연결됨' : '● 서버 연결 끊김 (재연결 중...)'}
        </div>
        
        {/* Public Rooms List */}
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-300 mb-2">공개 방</h2>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 h-48 overflow-y-auto">
                {state.publicRooms.length > 0 ? (
                    state.publicRooms.map(roomCode => (
                        <div key={roomCode} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded">
                            <span className="font-mono text-gray-300">{roomCode}</span>
                            <button onClick={() => handleJoinRoom(roomCode)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm">참가</button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center pt-16">입장 가능한 공개 방이 없습니다.</p>
                )}
            </div>
        </div>

        {/* Create Room Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button onClick={() => handleCreateRoom(true)} className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
            <Users className="mr-2" size={20} /> 공개 방 만들기
          </button>
           <button onClick={() => handleCreateRoom(false)} className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg">
            <Lock className="mr-2" size={20} /> 비공개 방 만들기
          </button>
        </div>
        
        <hr className="border-gray-600 my-4" />
        
        {/* Join with Code */}
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-yellow-300 mb-2">코드로 참가</h2>
            <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="방 코드 입력"
                  className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button onClick={() => handleJoinRoom(joinCode)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg">
                  참가
                </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
        </div>

        {/* FIX: Changed action to GO_TO_LOBBY for consistency */}
        <button onClick={() => {
            if (state.roomCode) {
                networkService.leaveRoom(state.roomCode);
            }
            dispatch({type: 'GO_TO_LOBBY'});
        }} className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">
            뒤로가기
        </button>
      </div>
    </div>
  );
};

export default PvpLobby;
