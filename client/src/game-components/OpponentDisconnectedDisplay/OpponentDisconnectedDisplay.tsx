import "./OpponentDisconnectedDisplay.css";
import { useEffect, useState } from "react";
import { socket } from "../../services/socket";

interface OpponentDisconnectedDisplayProps {
  show: boolean;
  roomId: string;
}

function OpponentDisconnectedDisplay(props: OpponentDisconnectedDisplayProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!props.show) return;

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
  }, [props.show, props.roomId]);

  if (!props.show) {
    return null;
  }

  return (
    <div className="opponent-disconnected-overlay">
      <div className="opponent-disconnected-content">
        <div className="opponent-disconnected-icon">⚠️</div>
        <div className="opponent-disconnected-title">Opponent Disconnected</div>
        <div className="opponent-disconnected-message">
          Your opponent has left the game or lost connection.
        </div>
        <div className="opponent-disconnected-countdown">
          Returning to lobby in {countdown} seconds...
        </div>
      </div>
    </div>
  );
}

export default OpponentDisconnectedDisplay;
