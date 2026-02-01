import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { socket } from "../services/socket";
import { Button, Modal } from "react-bootstrap";
import "./bootstrap.min.css";
import "./video.css";

export const VideoCall = (props) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });

    socket.on("hello", (data) => {
      setShowModal(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  const callPeer = (username) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: username,
        signalData: data,
        from: props.username,
        roomId: props.roomId,
      });
    });

    peer.on("stream", (stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setConnected(true);
      setCallAccepted(true);
      peer.signal(signal);
    });
  };

  const acceptCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("acceptCall", {
        signal: data,
        to: caller,
        roomId: props.roomId,
      });
    });

    peer.on("stream", (stream) => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    setReceivingCall(false);
  };

  let UserVideo;
  if (stream) {
    UserVideo = (
      <video
        playsInline
        ref={userVideo}
        muted
        autoPlay
        style={{ width: "20vw" }}
      />
    );
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = (
      <video
        playsInline
        ref={partnerVideo}
        autoPlay
        style={{ width: "20vw" }}
      />
    );
  }

  const callFunction = () => {
    acceptCall();
    setShowModal(false);
    setConnected(true);
  };

  return (
    <div className="videoScreen">
      <Modal show={showModal}>
        <Modal.Header>
          <Modal.Title>Incoming Call</Modal.Title>
        </Modal.Header>
        <Modal.Body>{caller} is calling you.</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={callFunction}>
            Accept Call
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
      <div>
        {UserVideo}
        {PartnerVideo}
      </div>
      {!connected ? (
        <div>
          {props.allUsers.map((user) => {
            if (user.username !== props.username && !callerSignal) {
              return (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => callPeer(user.username)}
                >
                  Call {user.username}
                </Button>
              );
            }
          })}
        </div>
      ) : (
        <div> </div>
      )}
      {/* <div>{incomingCall}</div> */}
    </div>
  );
};
