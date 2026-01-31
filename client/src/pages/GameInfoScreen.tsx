import React, { useState, useEffect } from "react";
import { Button, Container, Modal, Row, Spinner, Table } from "react-bootstrap";
import { RouteComponentProps, useLocation, useParams } from "react-router-dom";
import {
  useDestroyRoomAndLobbyMutation,
  useGetLobbyDetailsQuery,
  useLeaveRoomMutation,
  useRoomDetailsQuery,
} from "../generated/graphql";
import { socket } from "../services/socket.js";
import "./bootstrap.min.css";
interface GameInfoScreenRoomIdProps {
  roomId: string;
}

interface GameInfoScreenRoomProps extends RouteComponentProps {}

export const GameInfoScreen: React.FC<GameInfoScreenRoomProps> = ({
  history,
}) => {
  const { roomId } = useParams<GameInfoScreenRoomIdProps>();
  const location = useLocation<{ username: "value"; socketId: "value" }>();

  const [totalUsers, setTotalUsers] = useState(0);
  const [newDisabled, setNewDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [leaveRoom] = useLeaveRoomMutation();
  const [dom_content, setDomContent] = useState<Array<JSX.Element>>([]);
  const [allUsers, setAllUsers] = useState<
    Array<{
      id: string;
      username: string;
    }>
  >([]);
  const [destroyRoomAndLobby] = useDestroyRoomAndLobbyMutation();

  const { data, error, loading } = useRoomDetailsQuery({
    variables: {
      roomCode: roomId,
    },
  });

  const {
    data: lobbyData,
    error: lobbyError,
    loading: lobbyLoading,
  } = useGetLobbyDetailsQuery({
    variables: {
      roomCode: roomId,
    },
  });

  let playerVal: string =
    data && data?.getRoomDetails?.adminSocketId === location.state.socketId
      ? "1"
      : "2";

  const renderTable = async (
    users: Array<{ id: string; username: string }>
  ) => {
    let dom_content_copy: JSX.Element[] = [];
    for (let i = 0; i < users.length; i += 2) {
      dom_content_copy.push(
        <tr>
          <td>
            {i + 1} {` ${users[i].username}`}{" "}
          </td>
          {i + 1 < users.length ? (
            <td>
              {i + 2} {` ${users[i + 1].username}`}
            </td>
          ) : (
            <td></td>
          )}
        </tr>
      );
    }

    setDomContent(dom_content_copy);
  };

  socket.emit("init", {
    username: location.state.username,
    roomCode: roomId,
  });

  const domHandler = () => {
    if (!lobbyLoading && lobbyData) {
      setTotalUsers(lobbyData?.getLobbyDetails?.length);
      let newAllusers: Array<{
        id: string;
        username: string;
      }> = [];
      for (let i = 0; i < lobbyData?.getLobbyDetails?.length; i++) {
        newAllusers.push({
          id: lobbyData?.getLobbyDetails[i]?.userId,
          username: lobbyData?.getLobbyDetails[i]?.username,
        });
      }

      setAllUsers([...newAllusers]);

      setTimeout(() => {
        renderTable(newAllusers);
      }, 500);

      socket.emit("joinRoom", {
        roomId: roomId,
        users: lobbyData?.getLobbyDetails?.length,
      });
    }
  };

  useEffect(() => {
    domHandler();
  }, [lobbyLoading, lobbyData]);

  useEffect(() => {
    if (!loading) {
      if (data === null || lobbyData === null) {
        setErrorMessage("Room does not exist.");
        setShowModal(true);
      }
    }
  }, [loading]);

  socket.on("someone-joined", async function (data) {
    setTotalUsers(data.users);

    if (totalUsers > 2) {
      setNewDisabled(false);
    }
    let newAllusers: Array<{
      id: string;
      username: string;
    }> = [...allUsers, { id: data.id, username: data.username }];
    setAllUsers(newAllusers);

    setTimeout(() => {
      renderTable(newAllusers);
    }, 500);
  });

  socket.on("someone-leaved", async function (data) {
    let newAllusers: Array<{
      id: string;
      username: string;
    }> = [...allUsers];

    setTotalUsers(data.users);

    let newA = newAllusers.filter((ele) => ele.id !== data.id);

    setAllUsers(newA);

    setTimeout(() => {
      renderTable(newA);
    }, 500);
  });

  const startTheGame = () => {
    if (totalUsers < 2) {
      return;
    }
    socket.emit("startGame", {
      roomId: roomId,
    });

    socket.off("startGame");

    history.push({
      pathname: "/game/" + roomId,
      state: {
        username: location.state.username,
        playerVal: playerVal,
        users: allUsers,
      },
    });
  };

  const sendToHomePage = () => {
    setShowModal(false);

    const values = {
      roomCode: roomId,
    };
    destroyRoomAndLobby({ variables: values });
    history.push("/");
  };

  const handleLeavingRoom = async () => {
    socket.emit("leaveRoom", {
      roomId: roomId,
      users: totalUsers - 1,
    });

    setTotalUsers(totalUsers - 1);
    if (data?.getRoomDetails?.adminSocketId === location.state.socketId) {
      socket.emit("throw-all-users-out-of-room", {
        roomId: roomId,
      });
    }

    const values = {
      id: location.state.socketId,
      roomCode: roomId,
    };

    await leaveRoom({ variables: values });

    history.push("/");
  };

  socket.on("throw-room-recieved", function (data) {
    setShowModal(true);
    setErrorMessage(
      "The room host has closed this lobby. Please return to the home page to join or create a new room."
    );
  });

  useEffect(() => {
    socket.on("gameStarted", function (data) {
      history.push({
        pathname: "/game/" + roomId,
        state: {
          username: location.state.username,
          playerVal: playerVal,
          users: allUsers,
        },
      });
    });

    return () => {
      socket.off("gameStarted");
    };
  });

  useEffect(() => {
    socket.on("opponent-left", () => {
      setErrorMessage("Your opponent has left the game. Please return to the main screen.");
      setShowModal(true);
    });
    return () => {
      socket.off("opponent-left");
    };
  });

  return (
    <>
      {!loading && !lobbyLoading ? (
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

          <h3>Game Lobby Users</h3>
          <div className="display: inline">
            <span className="float: right">
              <h3>The Room Code is- </h3>
              {roomId}
            </span>
            <p></p>
          </div>
          <h3>Players in Lobby: {totalUsers}/2</h3>
          <div className="col-xs-6">
            <Row className="flex" sm={3} md={2} lg={2}>
              <Table striped bordered size="sm">
                <tbody>{dom_content}</tbody>
              </Table>
            </Row>

            <Container>
              <Row>
                {data?.getRoomDetails?.adminSocketId ===
                location.state.socketId ? (
                  <Button onClick={startTheGame}>Start Game</Button>
                ) : (
                  <div></div>
                )}
                <Button onClick={handleLeavingRoom}>Leave Lobby</Button>
              </Row>
            </Container>
          </div>
        </>
      ) : (
        <Spinner animation="border" variant="dark" />
      )}
    </>
  );
};
