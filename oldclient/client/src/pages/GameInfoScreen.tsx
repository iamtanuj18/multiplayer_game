import React, { useState, useEffect, useRef } from "react";
import { RouteComponentProps, useLocation, useParams } from "react-router-dom";
import {
  useDestroyRoomAndLobbyMutation,
  useGetLobbyDetailsQuery,
  useLeaveRoomMutation,
  useRoomDetailsQuery,
} from "../generated/graphql";
import { socket } from "../services/socket.js";
import "./GameInfoScreen.css";
interface GameInfoScreenRoomIdProps {
  roomId: string;
}

interface GameInfoScreenRoomProps extends RouteComponentProps {}

interface Player {
  id: string;
  username: string;
  isHost: boolean;
}

export const GameInfoScreen: React.FC<GameInfoScreenRoomProps> = ({
  history,
}) => {
  const { roomId } = useParams<GameInfoScreenRoomIdProps>();
  const location = useLocation<{ username: string; socketId: string }>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [leaveNotice, setLeaveNotice] = useState("");
  const [showLeaveNotice, setShowLeaveNotice] = useState(false);
  const [currentUserId] = useState(location.state?.socketId);
  const hasJoinedRef = useRef(false);
  const playersRef = useRef<Player[]>([]);
  const prevPlayersRef = useRef<Player[] | null>(null);
  const hadRoomRef = useRef(false);
  
  const [leaveRoom] = useLeaveRoomMutation();
  const [destroyRoomAndLobby] = useDestroyRoomAndLobbyMutation();

  const { data, error, loading } = useRoomDetailsQuery({
    variables: {
      roomCode: roomId,
    },
    fetchPolicy: "network-only",
    pollInterval: 5000,
  });

  const {
    data: lobbyData,
    error: lobbyError,
    loading: lobbyLoading,
    refetch: refetchLobby,
  } = useGetLobbyDetailsQuery({
    variables: {
      roomCode: roomId,
    },
    fetchPolicy: "network-only",
    pollInterval: 5000,
  });

  const isHost = data?.getRoomDetails?.adminSocketId === location.state.socketId;
  const maxPlayers = 2;
  const isLobbyFull = players.length === maxPlayers;
  useEffect(() => {
    if (!location.state?.socketId || !location.state?.username) {
      history.push("/");
    }
  }, [history, location.state]);


  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    if (!isHost) {
      prevPlayersRef.current = players;
      return;
    }

    if (prevPlayersRef.current) {
      const prevPlayers = prevPlayersRef.current;
      const removedPlayers = prevPlayers.filter(
        (prevPlayer) => !players.some((p) => p.id === prevPlayer.id)
      );

      if (removedPlayers.length > 0) {
        const leavingName = removedPlayers[0].username || "A player";
        setLeaveNotice(`${leavingName} left the room. Waiting for another player to join.`);
        setShowLeaveNotice(true);
        setTimeout(() => {
          setShowLeaveNotice(false);
          setLeaveNotice("");
        }, 3000);
      }
    }

    prevPlayersRef.current = players;
  }, [players, isHost]);

  // Initialize socket once and join room when connected
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      socket.emit("init", {
        username: location.state.username,
        roomCode: roomId,
        userId: location.state.socketId,
      });

      if (!hasJoinedRef.current) {
        socket.emit("joinRoom", {
          roomId: roomId,
          users: 0,
        });
        hasJoinedRef.current = true;
      }
    };

    socket.on("connect", handleConnect);

    // If already connected, run immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [location.state.username, roomId]);

  // Copy room code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Initialize players from lobby data
  const initializePlayers = () => {
    if (!lobbyLoading && lobbyData && data) {
      const newPlayers: Player[] = lobbyData.getLobbyDetails.map((lobbyUser) => ({
        id: lobbyUser.userId,
        username: lobbyUser.username,
        isHost: lobbyUser.userId === data.getRoomDetails?.adminSocketId,
      }));
      
      setPlayers(newPlayers);
    }
  };
  useEffect(() => {
    if (!lobbyLoading && lobbyData && currentUserId) {
      const isMember = lobbyData.getLobbyDetails.some(
        (lobbyUser) => lobbyUser.userId === currentUserId
      );

      if (!isMember) {
        setErrorMessage("You have left the lobby.");
        setShowError(true);
        setTimeout(() => {
          history.push("/");
        }, 1500);
      }
    }
  }, [lobbyLoading, lobbyData, currentUserId, history]);

  // Initial load
  useEffect(() => {
    initializePlayers();
    
    // Cleanup all socket listeners when component unmounts
    return () => {
      socket.off("someone-joined");
      socket.off("someone-leaved");
      socket.off("throw-room-recieved");
      socket.off("gameStarted");
    };
  }, [lobbyLoading, lobbyData, data]);

  // Check for room existence
  useEffect(() => {
    if (!loading && (!data || data.getRoomDetails === null)) {
      if (hadRoomRef.current) {
        setErrorMessage("Host has disconnected.");
      } else {
        setErrorMessage("Room does not exist.");
      }
      setShowError(true);
    }
  }, [loading, data]);

  useEffect(() => {
    if (data?.getRoomDetails) {
      hadRoomRef.current = true;
    }
  }, [data]);

  // Socket event: Someone joined
  useEffect(() => {
    socket.on("someone-joined", (data) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.id === data.id)) {
          return prev;
        }
        const newPlayer: Player = {
          id: data.id,
          username: data.username,
          isHost: false,
        };
        return [...prev, newPlayer];
      });
      refetchLobby();
    });

    return () => {
      socket.off("someone-joined");
    };
  }, []);

  // Socket event: Someone left
  useEffect(() => {
    socket.on("someone-leaved", (data) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.id));
      
      // Show notification when player leaves (host only)
      if (isHost) {
        const leavingName =
          data.username ||
          playersRef.current.find((p) => p.id === data.id)?.username ||
          "A player";
        setLeaveNotice(`${leavingName} left the room. Waiting for another player to join.`);
        setShowLeaveNotice(true);
        setTimeout(() => {
          setShowLeaveNotice(false);
          setLeaveNotice("");
        }, 3000);
      }
      refetchLobby();
    });

    return () => {
      socket.off("someone-leaved");
    };
  }, [isHost]);

  // Handle browser refresh/close/disconnect
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isHost) {
        socket.emit("leaveRoom", {
          roomId: roomId,
          userId: location.state.socketId,
        });
      } else {
        socket.emit("leaveRoom", {
          roomId: roomId,
          userId: location.state.socketId,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isHost, roomId, location.state.socketId]);

  // Socket event: Host kicked everyone
  useEffect(() => {
    socket.on("throw-room-recieved", () => {
      setErrorMessage("Host has left the lobby. Returning to home page...");
      setShowError(true);
      setTimeout(() => {
        history.push("/");
      }, 2000);
    });

    return () => {
      socket.off("throw-room-recieved");
    };
  }, [history]);

  // Socket event: Game started
  useEffect(() => {
    socket.on("gameStarted", () => {
      const playerVal = isHost ? "1" : "2";
      history.push({
        pathname: "/game/" + roomId,
        state: {
          username: location.state.username,
          playerVal: playerVal,
          users: players,
        },
      });
    });

    return () => {
      socket.off("gameStarted");
    };
  }, [players, isHost, history, roomId, location.state.username]);


  // Start game (host only)
  const handleStartGame = () => {
    if (!isLobbyFull) return;

    socket.emit("startGame", {
      roomId: roomId,
    });

    const playerVal = "1";
    history.push({
      pathname: "/game/" + roomId,
      state: {
        username: location.state.username,
        playerVal: playerVal,
        users: players,
      },
    });
  };

  // Leave lobby
  const handleLeaveLobby = async () => {
    if (isHost) {
      // Host leaves: notify server to delete room + kick everyone
      if (socket.connected) {
        socket.emit("leaveRoom", {
          roomId: roomId,
          userId: location.state.socketId,
        });
      } else {
        try {
          await destroyRoomAndLobby({ variables: { roomCode: roomId } });
        } catch (error) {
          console.error("Error destroying room:", error);
        }
      }

      history.push("/");
    } else {
      // Player leaves: ensure proper cleanup order
      try {
        // 1. First emit leave event to notify others
        socket.emit("leaveRoom", {
          roomId: roomId,
          userId: location.state.socketId,
        });
        
        // 2. Then update database - wait for completion
        await leaveRoom({
          variables: {
            id: location.state.socketId,
            roomCode: roomId,
          },
        });

        // 3. Ensure socket event is processed
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error("Error leaving room:", error);
      } finally {
        // Always navigate away
        history.push("/");
      }
    }
  };

  // Go to home page from error modal
  const handleGoHome = async () => {
    if (isHost) {
      if (!socket.connected) {
        try {
          await destroyRoomAndLobby({ variables: { roomCode: roomId } });
        } catch (error) {
          console.error("Error destroying room:", error);
        }
      }
    }
    history.push("/");
  };

  if (loading || lobbyLoading) {
    return (
      <div className="lobby-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      {/* Error Modal */}
      {showError && (
        <div className="modal-overlay" onClick={handleGoHome}>
          <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleGoHome}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="modal-header">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="error-icon">
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h2 className="modal-title">Error</h2>
            </div>
            
            <div className="modal-body">
              <p>{errorMessage}</p>
            </div>
            
            <div className="modal-footer">
              <button className="primary-button" onClick={handleGoHome}>
                Go To Home Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lobby Page */}
      <div className="lobby-container">
        <div className="lobby-content">
          {showLeaveNotice && (
            <div className="modal-overlay">
              <div className="modal-wrapper">
                <div className="modal-header">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="error-icon">
                    <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2"/>
                    <path d="M12 8v4m0 4h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <h2 className="modal-title">Player Left</h2>
                </div>
                <div className="modal-body">
                  <p>{leaveNotice}</p>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="lobby-header">
            <div className="chess-icon-container">
              <svg viewBox="0 0 24 24" className="chess-icon" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11.5 9H13v2h1.5V9H16V7h-1.5V5.5H13V7h-1.5zm0 4.5v1.25c0 .41.34.75.75.75h3c.41 0 .75-.34.75-.75V13.5H15v1h-2v-1z"/>
              </svg>
            </div>
            <h1 className="lobby-title">Game Lobby</h1>
            <p className="lobby-subtitle">
              {isLobbyFull ? 'Ready to start!' : 'Waiting for players to join...'}
            </p>
          </div>

          {/* Room Code Card */}
          <div className="room-code-card">
            <p className="room-code-label">Room Code</p>
            <div className="room-code-container">
              <code className="room-code">{roomId}</code>
              <button className="copy-button" onClick={handleCopyCode}>
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="check-icon">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            <p className="room-code-help">Share this code with your friend to join the game</p>
          </div>

          {/* Players Card */}
          <div className="players-card">
            <div className="players-header">
              <div className="players-title-container">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="users-icon">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="players-title">Players in Lobby</h2>
              </div>
              <span className={`player-count ${isLobbyFull ? 'full' : 'waiting'}`}>
                {players.length}/{maxPlayers}
              </span>
            </div>

            <div className="players-list">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`player-item ${player.id === currentUserId ? 'current-player' : ''}`}
                >
                  <div className={`player-avatar ${player.isHost ? 'host-avatar' : ''}`}>
                    {player.isHost ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="crown-icon">
                        <path d="M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-2.5-5-2.5 5-5.31-1.42c-.8-.21-1.62.3-1.84 1.06-.21.8.22 1.63 1.01 1.91l8.22 2.93V19h2v-5.52l8.22-2.93c.79-.28 1.22-1.11 1.01-1.91z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="user-icon">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="player-info">
                    <div className="player-name-row">
                      <span className="player-name">{player.username}</span>
                      {player.id === currentUserId && (
                        <span className="you-badge">You</span>
                      )}
                    </div>
                    <p className="player-role">
                      {player.isHost ? 'Host' : `Player ${index + 1}`}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
                <div key={`empty-${index}`} className="player-item empty-slot">
                  <div className="player-avatar empty-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="user-icon-empty">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="player-info">
                    <span className="waiting-text">Waiting for player...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!isLobbyFull}
                className="primary-button"
              >
                {isLobbyFull
                  ? 'Start Game'
                  : `Waiting for ${maxPlayers - players.length} more player${maxPlayers - players.length > 1 ? 's' : ''}...`}
              </button>
            )}
            <button onClick={handleLeaveLobby} className="outline-button">
              Leave Lobby
            </button>
          </div>

          {/* Info Note */}
          {isHost && !isLobbyFull && (
            <div className="info-note">
              The game will start once all players have joined
            </div>
          )}
        </div>
      </div>
    </>
  );
};
