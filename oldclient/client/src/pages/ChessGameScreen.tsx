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
    useLocation<{ username: "value"; playerVal: "value"; users: "value" }>();
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [destroyRoomAndLobby] = useDestroyRoomAndLobbyMutation();
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
    const values = {
      roomCode: roomId,
    };
    destroyRoomAndLobby({ variables: values });
    history.push("/");
  };

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

      <div className="game-screen">
        <div className="chessBoard">
          <App
            playerVal={location.state.playerVal}
            username={location.state.username}
            roomId={roomId}
            users={Array.isArray(location.state.users) ? location.state.users : JSON.parse(location.state.users)}
          />
        </div>
        <div className="videoArea">
          <VideoCall
            roomId={roomId}
            allUsers={location.state.users}
            username={location.state.username}
          />
        </div>
        <div>
          <Chat username={location.state.username} roomId={roomId} />
        </div>
      </div>
    </>
  );
};
