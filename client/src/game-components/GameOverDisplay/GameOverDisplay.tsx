import "./GameOverDisplay.css";

interface GameOverDisplayProps {
  isGameOver: boolean;
  winner: string | null; // null means draw/stalemate
  reason: "checkmate" | "stalemate" | null;
  onNewGame?: () => void;
}

function GameOverDisplay(props: GameOverDisplayProps) {
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
      </div>
    </div>
  );
}

export default GameOverDisplay;
