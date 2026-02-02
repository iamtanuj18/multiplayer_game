import React, { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { useParams, useLocation, RouteComponentProps } from "react-router-dom";
import App from "../game-components/App";
import { VideoCall } from "../Video-Screen/VideoCall";

import { Button, Modal } from "react-bootstrap";
import { Chat } from "../Chat-Screen/Chat";
import "./board.css";
import { useDestroyRoomAndLobbyMutation } from "../generated/graphql";

interface GameScreenRoomIdProps {
  roomId: string;
}

interface ChessGameScreenProps extends RouteComponentProps {}

export const ChessGameScreen: React.FC<ChessGameScreenProps> = ({
  history,
}) => {
  const { roomId } = useParams<GameScreenRoomIdProps>();
  const location =
    useLocation<{ username: string; playerVal: string; users: any }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Check if we have valid state - if not (refresh/direct URL), redirect home
  useEffect(() => {
    if (!location.state || !location.state.username || !location.state.playerVal) {
      console.log("No valid state found - redirecting to home");
      history.push("/");
      return;
    }
  }, [location.state, history]);

  const parsedUsers = Array.isArray(location.state?.users)
    ? location.state.users
    : location.state?.users ? JSON.parse(location.state.users) : [];

  const opponentUser = parsedUsers.find(
    (user: { username: string }) => user.username !== location.state?.username
  );

  const playerColor = location.state?.playerVal === "1" ? "White" : "Black";
  const opponentColor = playerColor === "White" ? "Black" : "White";

  const [destroyRoomAndLobby] = useDestroyRoomAndLobbyMutation();
  
  useEffect(() => {
    // Handle browser refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Mark in sessionStorage that user is leaving
      sessionStorage.setItem('leftGame', 'true');
      
      // Notify opponent
      socket.emit("playerDisconnecting", { roomId });
      socket.emit("leaveRoom", { roomId, userId: socket.id });
    };

    // Check if this is a page reload after leaving
    const leftGame = sessionStorage.getItem('leftGame');
    if (leftGame === 'true') {
      sessionStorage.removeItem('leftGame');
      // User refreshed or returned after leaving - redirect home
      history.push("/");
      return;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, history]);

  useEffect(() => {
    socket.on("opponent-left", () => {
      setErrorMessage("Your opponent has left the game. Please return to the main screen.");

      setShowModal(true);
    });
    return () => {
      socket.off("opponent-left");
    };
  });

  const sendToHomePage = () => {
    setShowModal(false);
    
    // Mark that we're leaving intentionally
    sessionStorage.setItem('leftGame', 'true');
    
    // Notify opponent before leaving
    socket.emit("playerDisconnecting", { roomId });
    
    const values = {
      roomCode: roomId,
    };
    destroyRoomAndLobby({ variables: values });
    
    // Disconnect socket
    socket.emit("leaveRoom", { roomId, userId: socket.id });
    socket.disconnect();
    
    history.push("/");
  };

  // Don't render if no valid state
  if (!location.state || !location.state.username || !location.state.playerVal) {
    return null;
  }

  return (
    <>
      <Modal show={showModal}>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Error</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>{errorMessage}</p>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" onClick={sendToHomePage}>
              Go To Home Page
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>

      <div className="game-page">
        <div className="game-layout">
          <aside className="game-left">
            <div className="panel-card">
              <div className="panel-header">
                <h3>Players</h3>
                <p>Camera views</p>
              </div>
              <p className="connection-note">
                After enabling camera & mic, please wait up to 30 seconds for the connection.
              </p>
              <VideoCall
                roomId={roomId}
                allUsers={parsedUsers}
                username={location.state.username}
              />
            </div>

            <div className="panel-card game-info-card">
              <div className="panel-header">
                <h3>Game Info</h3>
                <p>Room and player details</p>
              </div>
              <div className="game-info-row">
                <span>Room Code</span>
                <code>{roomId}</code>
              </div>
              <div className="game-info-row">
                <span>Your Color</span>
                <span className="game-info-value">{playerColor}</span>
              </div>
              <div className="game-info-row">
                <span>Opponent</span>
                <span className="game-info-value">
                  {opponentUser?.username || "Waiting"}
                </span>
              </div>
            </div>
          </aside>

          <main className="game-center">
            <div className="board-wrap">
              <App
                playerVal={location.state.playerVal}
                username={location.state.username}
                roomId={roomId}
                users={parsedUsers}
              />
            </div>
          </main>

          <aside className="game-right">
            <div className="chat-card">
              <div className="chat-header">
                <div>
                  <h3>Game Chat</h3>
                  <p>Talk with your opponent</p>
                </div>
                <Button variant="outline-dark" onClick={sendToHomePage}>
                  Leave Game
                </Button>
              </div>
              <div className="chat-body">
                <Chat username={location.state.username} roomId={roomId} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};
