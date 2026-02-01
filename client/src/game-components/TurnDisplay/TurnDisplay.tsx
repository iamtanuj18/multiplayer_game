import { useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";

import "./TurnDisplay.css";

interface TurnDisplayProps {
  playerVal: string;
  currentTurn: string;
  username: string;
  otherUsername: string;
  isBlackTurn: boolean;
  gameStarted: boolean;
  onStartGame: () => void;
}

function TurnDisplay(props: TurnDisplayProps) {
  const [showOverlay, setShowOverlay] = useState(true); // Show on mount
  const [isInitialTurn, setIsInitialTurn] = useState(true);

  useEffect(() => {
    if (!props.gameStarted) {
      // Keep showing the initial overlay until game starts
      setShowOverlay(true);
      setIsInitialTurn(true);
    } else {
      // Game has started, hide initial overlay
      setIsInitialTurn(false);
    }
  }, [props.gameStarted]);

  useEffect(() => {
    if (props.gameStarted && !isInitialTurn) {
      // Show overlay when turn changes (normal gameplay)
      setShowOverlay(true);
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 1500); // Hide after 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [props.currentTurn, props.gameStarted, isInitialTurn]);

  const isMyTurn = props.playerVal === props.currentTurn;
  
  let content;
  let showDismissButton = false;

  if (isInitialTurn && !props.gameStarted) {
    // Initial turn - stays until dismissed
    if (isMyTurn) {
      content = "Your Turn - Start when ready!";
      showDismissButton = true;
    } else {
      content = `Waiting for ${props.otherUsername} to start...`;
      showDismissButton = false;
    }
  } else {
    // Normal turn change during game
    content = isMyTurn ? "Your Turn" : `${props.otherUsername}'s Turn`;
    showDismissButton = false;
  }

  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log('Let\'s Play clicked!');
    props.onStartGame();
  };

  return (
    <CSSTransition
      in={showOverlay}
      timeout={300}
      classNames="turn-overlay"
      unmountOnExit
    >
      <div className="turn-overlay-container">
        <div className={`turn-overlay-content ${isInitialTurn ? 'initial' : ''}`}>
          <div>{content}</div>
          {showDismissButton && (
            <button 
              className="start-game-button"
              onClick={handleStartClick}
              type="button"
            >
              Let's Play!
            </button>
          )}
        </div>
      </div>
    </CSSTransition>
  );
}

export default TurnDisplay;
