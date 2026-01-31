import { CSSTransition, TransitionGroup } from "react-transition-group";

import "./TurnDisplay.css";

interface TurnDisplayProps {
  playerVal: string;
  currentTurn: string;
  username: string;
  otherUsername: string;
  isBlackTurn: boolean;
}

function TurnDisplay(props: TurnDisplayProps) {
  const whoseTurn = (
    <CSSTransition
      key={props.isBlackTurn ? 'black' : 'white'}
      timeout={800}
      classNames="whose-turn"
    >
      <span>
        {props.playerVal !== props.currentTurn
          ? props.otherUsername + "'s  Turn"
          : props.username + "'s  Turn"}
      </span>
    </CSSTransition>
  );
  return (
    <span className="turn-display">
      <TransitionGroup className="animation-turn">{whoseTurn}</TransitionGroup>
    </span>
  );
}

export default TurnDisplay;
