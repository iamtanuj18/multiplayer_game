import "./App.css";
import Board from "../Board";
import TurnDisplay from "../TurnDisplay";
import CheckDisplay from "../CheckDisplay";
import GameOverDisplay from "../GameOverDisplay";
import OpponentDisconnectedDisplay from "../OpponentDisconnectedDisplay";
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { socket } from "../../services/socket";

interface userType {
  id: string;
  username: string;
}

interface AppProps {
  username: string;
  playerVal: string;
  roomId: string;
  users: userType[];
}

const App = (props: AppProps) => {
  const [currentTurn, setCurrentTurn] = useState("1");
  const [isBlackTurn, setIsBlackTurn] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [load, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<"checkmate" | "stalemate" | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const otherUser = props.users.find(
    (user: userType) => user.username !== props.username
  );
  const otherUsername = otherUser?.username || 'Opponent';

  useEffect(() => {
    // Listen for opponent disconnect during game
    socket.on("opponentDisconnected", () => {
      setOpponentDisconnected(true);
    });

    return () => {
      socket.off("opponentDisconnected");
    };
  }, []);

  setTimeout(() => {
    setLoading(true);
  }, 500);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleGameOver = (winnerName: string | null, reason: "checkmate" | "stalemate") => {
    setIsGameOver(true);
    setWinner(winnerName);
    setGameOverReason(reason);
  };

  setTimeout(() => {
    setLoading(true);
  }, 500);

  return (
    <>
      {load ? (
        <div className="App">
          <CheckDisplay isCheck={isCheck}></CheckDisplay>
          <OpponentDisconnectedDisplay
            show={opponentDisconnected}
            roomId={props.roomId}
          ></OpponentDisconnectedDisplay>
          <GameOverDisplay
            isGameOver={isGameOver}
            winner={winner}
            reason={gameOverReason}
            roomId={props.roomId}
          ></GameOverDisplay>
          <div className="board-container">
            <Board
              isBlackTurn={isBlackTurn}
              setTurn={setIsBlackTurn}
              isCheck={isCheck}
              setCheck={setIsCheck}
              roomId={props.roomId}
              playerVal={props.playerVal}
              currentTurn={currentTurn}
              setCurrentTurn={setCurrentTurn}
              username={props.username}
              otherUsername={otherUsername}
              gameStarted={gameStarted}
              onGameOver={handleGameOver}
            ></Board>
            <TurnDisplay
              currentTurn={currentTurn}
              isBlackTurn={isBlackTurn}
              playerVal={props.playerVal}
              username={props.username}
              otherUsername={otherUsername}
              gameStarted={gameStarted}
              onStartGame={handleStartGame}
            ></TurnDisplay>
          </div>
        </div>
      ) : (
        <Spinner animation="border" variant="dark" />
      )}
    </>
  );
};

export default App;
