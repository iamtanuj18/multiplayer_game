import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { socket } from "../services/socket";
import { Button, Modal } from "react-bootstrap";
import "./bootstrap.min.css";
import "./video.css";

export const VideoCall = (props) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [connected, setConnected] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [mediaRequested, setMediaRequested] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();

  useEffect(() => {
    // Don't request media automatically, wait for user action or set stream to allow connection
    setStream(null);
    setMediaRequested(true);

    socket.on("hello", (data) => {
      setCaller(data.from);
      setCallerSignal(data.signal);
      setReceivingCall(true);
    });

    return () => {
      socket.off("hello");
    };
  }, []);

  // Auto-initiate call when ready and we have opponent
  useEffect(() => {
    if (mediaRequested && props.allUsers && props.allUsers.length > 1 && !callInitiated && !receivingCall) {
      const opponent = props.allUsers.find(
        (user) => user.username !== props.username
      );
      if (opponent) {
        callPeer(opponent.username);
        setCallInitiated(true);
      }
    }
  }, [mediaRequested, props.allUsers, props.username, callInitiated, receivingCall]);

  // Auto-accept incoming call
  useEffect(() => {
    if (receivingCall && mediaRequested && callerSignal) {
      acceptCall();
    }
  }, [receivingCall, mediaRequested, callerSignal]);

  const enableMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      setVideoEnabled(true);
      setAudioEnabled(true);
      
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }

      // If peer already exists, we need to recreate it with the new stream
      if (peerRef.current) {
        console.log("Destroying old peer and recreating with stream...");
        const wasInitiator = peerRef.current.initiator;
        peerRef.current.destroy();
        
        // Recreate peer with stream
        if (wasInitiator) {
          // Re-initiate call with stream
          const opponent = props.allUsers.find(
            (user) => user.username !== props.username
          );
          if (opponent) {
            callPeer(opponent.username);
          }
        } else if (callerSignal) {
          // Re-accept call with stream
          acceptCall();
        }
      }
    } catch (err) {
      console.error("Failed to get media permissions:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const callPeer = (username) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: username,
        signalData: data,
        from: props.username,
        roomId: props.roomId,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    socket.on("callAccepted", (signal) => {
      setConnected(true);
      setCallAccepted(true);
      peer.signal(signal);
    });
  };

  const acceptCall = () => {
    setCallAccepted(true);
    setConnected(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on("signal", (data) => {
      socket.emit("acceptCall", {
        signal: data,
        to: caller,
        roomId: props.roomId,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
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
        className="video-feed"
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
        className="video-feed"
      />
    );
  }

  const userVideoContent = UserVideo || (
    <div className="video-placeholder">Your camera</div>
  );

  const partnerVideoContent = PartnerVideo || (
    <div className="video-placeholder">Waiting for opponent</div>
  );

  return (
    <div className="videoScreen">
      <div className="video-grid">
        <div className="user-video-container">
          <div className="video-tile">
            {userVideoContent}
            
            {/* Controls overlay for toggle icons only when stream is active */}
            {stream && (
              <div className="video-controls-overlay">
                <div className="control-icons">
                  <button 
                    onClick={toggleVideo}
                    className={`control-icon ${videoEnabled ? 'active' : 'inactive'}`}
                    title={videoEnabled ? "Turn Camera Off" : "Turn Camera On"}
                  >
                    {videoEnabled ? '📹' : '📹'}
                  </button>
                  <button 
                    onClick={toggleAudio}
                    className={`control-icon ${audioEnabled ? 'active' : 'inactive'}`}
                    title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {audioEnabled ? '🎤' : '🎤'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Enable button below video */}
          {!stream && (
            <button 
              onClick={enableMedia}
              className="enable-media-button"
              title="Enable Camera & Microphone"
            >
              Enable Camera & Mic
            </button>
          )}
        </div>
        
        <div className="video-tile">
          {partnerVideoContent}
        </div>
      </div>
    </div>
  );
};
