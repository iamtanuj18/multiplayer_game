import "./GameOverDisplay.css";
import { useEffect, useState } from "react";
import { socket } from "../../services/socket";

interface GameOverDisplayProps {
  isGameOver: boolean;
  winner: string | null; // null means draw/stalemate
  reason: "checkmate" | "stalemate" | null;
  roomId: string;
  onNewGame?: () => void;
}

function GameOverDisplay(props: GameOverDisplayProps) {
  const [countdown, setCountdown] = useState(20);

  useEffect(() => {
    if (!props.isGameOver) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          
          // Stop all media tracks before leaving
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              stream.getTracks().forEach(track => track.stop());
            })
            .catch(() => {}); // Ignore errors if no media
          
          // Leave room and disconnect before redirect
          socket.emit("leaveRoom", { roomId: props.roomId });
          socket.disconnect();
          
          // Redirect to home page
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [props.isGameOver, props.roomId]);

  if (!props.isGameOver) {
    return null;
  }

  const isStalemate = props.reason === "stalemate";
  const title = isStalemate ? "Stalemate!" : "Game Over!";
  const winnerText = isStalemate
    ? "It's a Draw"
    : props.winner
    ? `${props.winner} Wins!`
    : "It's a Draw";
  const reasonText = isStalemate
    ? "No legal moves available"
    : props.reason === "checkmate"
    ? "by Checkmate"
    : "";

  return (
    <div className="game-over-overlay">
      <div className={`game-over-content ${isStalemate ? "stalemate" : ""}`}>
        <div className="game-over-title">{title}</div>
        <div className="game-over-winner">{winnerText}</div>
        {reasonText && <div className="game-over-reason">{reasonText}</div>}
        <div className="game-over-countdown">
          Returning to lobby in {countdown} seconds...
        </div>
      </div>
    </div>
  );
}

export default GameOverDisplay;
