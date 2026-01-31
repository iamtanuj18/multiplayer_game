import React, { useState } from "react";
import {
  useCreateRoomMutation,
  useJoinRoomMutation,
} from "../generated/graphql";
import { RouteComponentProps } from "react-router-dom";
import { socket } from "../services/socket.js";
import {
  GAME_IN_PROGRESS,
  ROOM_DOES_NOT_EXIST,
  ROOM_IS_FULL,
  USERNAME_EXIST_IN_ROOM,
} from "../constants-socket";
import "./HomeScreen.css";

interface HomeScreenProps extends RouteComponentProps {}

export const HomeScreen: React.FC<HomeScreenProps> = ({ history }) => {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [socketId, setSocketId] = useState("");
  
  // Modal-specific error states
  const [createRoomUsernameError, setCreateRoomUsernameError] = useState("");
  const [joinRoomUsernameError, setJoinRoomUsernameError] = useState("");
  const [joinRoomCodeError, setJoinRoomCodeError] = useState("");
  
  const [modalLoading, setModalLoading] = useState(false);
  const [openCreateRoomModal, setOpenCreateRoom] = useState(false);
  const [openJoinRoomModal, setOpenJoinRoom] = useState(false);
  const [createRoomMutation] = useCreateRoomMutation();
  const [joinRoomMutation] = useJoinRoomMutation();
  socket.on("setId", function (data) {
    setSocketId(data.id);
  });

  const changeCreateRoomStatus = () => {
    setCreateRoomUsernameError("");
    setUsername("");
    setOpenCreateRoom(true);
  };
  
  const changeJoinRoomStatus = () => {
    setJoinRoomUsernameError("");
    setJoinRoomCodeError("");
    setUsername("");
    setCode("");
    setOpenJoinRoom(true);
  };
  
  const handleClose = () => {
    setOpenCreateRoom(false);
    setOpenJoinRoom(false);
    setCreateRoomUsernameError("");
    setJoinRoomUsernameError("");
    setJoinRoomCodeError("");
    setUsername("");
    setCode("");
  };

  const createRoom = async () => {
    setCreateRoomUsernameError("");
    
    if (username.trim() === "" || username.length <= 4) {
      setCreateRoomUsernameError("Username must be at least 5 characters long.");
      return;
    }

    setOpenCreateRoom(false);
    setModalLoading(true);

    const values = {
      adminId: socketId,
      username: username,
    };
    const response = await createRoomMutation({
      variables: values,
    });
    setModalLoading(false);
    const roomCode = response?.data?.createRoom?.response?.code?.toString();

    history.push({
      pathname: "/gameInfo/" + roomCode,
      state: { username: username, socketId: socketId },
    });
  };

  const joinRoom = async () => {
    setJoinRoomUsernameError("");
    setJoinRoomCodeError("");
    
    let hasError = false;
    
    if (username.trim() === "" || username.length <= 4) {
      setJoinRoomUsernameError("Username must be at least 5 characters long.");
      hasError = true;
    }

    if (code.trim() === "" || code.length < 4) {
      setJoinRoomCodeError("Please enter a valid room code (minimum 4 characters)");
      hasError = true;
    }
    
    if (hasError) return;

    setOpenJoinRoom(false);
    setModalLoading(true);

    const values = {
      userId: socketId,
      username: username,
      roomCode: code,
    };
    const response = await joinRoomMutation({
      variables: values,
    });

    if (!response?.data?.joinRoom?.response?.values) {
      const errorDetected = response?.data?.joinRoom?.response?.error?.toString();
      setModalLoading(false);
      setOpenJoinRoom(true);

      if (errorDetected === ROOM_DOES_NOT_EXIST) {
        setJoinRoomCodeError("Room does not exist. Please check the code and try again.");
        return;
      }

      if (errorDetected === ROOM_IS_FULL) {
        setJoinRoomCodeError("Room is full. Unable to join at this time.");
        return;
      }

      if (errorDetected === GAME_IN_PROGRESS) {
        setJoinRoomCodeError("Game is already in progress. Cannot join at this time.");
        return;
      }

      if (errorDetected === USERNAME_EXIST_IN_ROOM) {
        setJoinRoomUsernameError("This username is already taken in this room. Please choose a different one.");
        return;
      }
    }
    setModalLoading(false);

    history.push({
      pathname: "/gameInfo/" + code,
      state: { username: username, socketId: socketId },
    });
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Header */}
        <div className="header-section">
          <div className="chess-icon-container">
            <svg viewBox="0 0 24 24" className="chess-icon" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM11.5 9H13v2h1.5V9H16V7h-1.5V5.5H13V7h-1.5zm0 4.5v1.25c0 .41.34.75.75.75h3c.41 0 .75-.34.75-.75V13.5H15v1h-2v-1z"/>
            </svg>
          </div>
          <h1 className="home-title">Online Multiplayer Chess</h1>
          <p className="home-subtitle">
            Create a room or join an existing game to start playing
          </p>
        </div>

        {/* Action Cards */}
        <div className="cards-grid">
          {/* Create Room Card */}
          <div className="room-card">
            <div className="room-card-content">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h2 className="card-title">Create Room</h2>
              <p className="card-description">
                Start a new game and invite your friends to join
              </p>
              <button className="card-button primary" onClick={changeCreateRoomStatus}>
                Create Room
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="room-card">
            <div className="room-card-content">
              <div className="card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h2 className="card-title">Join Room</h2>
              <p className="card-description">
                Enter a room code to join an existing game
              </p>
              <button className="card-button outline" onClick={changeJoinRoomStatus}>
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="footer-text">
          Ready to challenge your opponent? Choose an option above to get started.
        </div>
      </div>

      {/* Loading Overlay */}
      {modalLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Create Room Modal */}
      {openCreateRoomModal && (
        <>
          <div className="modal-overlay" onClick={handleClose}></div>
          <div className="modal-wrapper">
            <button className="modal-close-button" onClick={handleClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Close</span>
            </button>
            <div className="modal-header">
              <h2 className="modal-title">Create Room</h2>
            </div>
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); createRoom(); }}>
              <div className="form-field">
                <label className="form-label" htmlFor="create-username">
                  Enter your username
                </label>
                <input
                  id="create-username"
                  type="text"
                  className={`form-input ${createRoomUsernameError ? 'error' : ''}`}
                  placeholder="iamtanuj"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {createRoomUsernameError && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{createRoomUsernameError}</span>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-button primary">
                  Create
                </button>
                <button type="button" className="modal-button secondary" onClick={handleClose}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Join Room Modal */}
      {openJoinRoomModal && (
        <>
          <div className="modal-overlay" onClick={handleClose}></div>
          <div className="modal-wrapper">
            <button className="modal-close-button" onClick={handleClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }}>Close</span>
            </button>
            <div className="modal-header">
              <h2 className="modal-title">Join Room</h2>
            </div>
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); joinRoom(); }}>
              <div className="form-field">
                <label className="form-label" htmlFor="join-username">
                  Enter your username
                </label>
                <input
                  id="join-username"
                  type="text"
                  className={`form-input ${joinRoomUsernameError ? 'error' : ''}`}
                  placeholder="iamtanuj"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {joinRoomUsernameError && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{joinRoomUsernameError}</span>
                  </div>
                )}
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="join-roomcode">
                  Enter Room Code
                </label>
                <input
                  id="join-roomcode"
                  type="text"
                  className={`form-input ${joinRoomCodeError ? 'error' : ''}`}
                  placeholder="qwerty123"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                {joinRoomCodeError && (
                  <div className="form-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{joinRoomCodeError}</span>
                  </div>
                )}
              </div>
              <div className="modal-buttons">
                <button type="submit" className="modal-button primary">
                  Join Room
                </button>
                <button type="button" className="modal-button secondary" onClick={handleClose}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
