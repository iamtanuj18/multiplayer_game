import { userInfo } from "os";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "./TurnDisplay.css";

function TurnDisplay(props: any) {
  //   let blackDisplay = props.playerVal === "2" ? "Opponent's " : "Your";
  //   let whiteDisplay = props.playerVal === "2" ? "Your" : "Opponent's  ";

  const whoseTurn = (
    <CSSTransition
      key={props.isBlackTurn}
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
