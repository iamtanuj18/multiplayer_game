import "./App.css";
import Board from "../Board";
import TurnDisplay from "../TurnDisplay";
import CheckDisplay from "../CheckDisplay";
import { useState } from "react";
import { Spinner } from "react-bootstrap";

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

  const otherUser = props.users.find(
    (user: userType) => user.username !== props.username
  );
  const otherUsername = otherUser?.username || 'Opponent';

  setTimeout(() => {
    setLoading(true);
  }, 500);

  return (
    <>
      {load ? (
        <div className="App">
          <TurnDisplay
            currentTurn={currentTurn}
            isBlackTurn={isBlackTurn}
            playerVal={props.playerVal}
            username={props.username}
            otherUsername={otherUsername}
          ></TurnDisplay>
          <CheckDisplay isCheck={isCheck}></CheckDisplay>
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
          ></Board>
        </div>
      ) : (
        <Spinner animation="border" variant="dark" />
      )}
    </>
  );
};

export default App;
