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
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [localMediaReady, setLocalMediaReady] = useState(false);
  const [remoteMediaReady, setRemoteMediaReady] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const initiatedCall = useRef(false);
  const initialSignalSentRef = useRef(false);
  const fallbackCallTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on("hello", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.signal(signal);
      }
    });

    socket.on("streamEnabled", (data) => {
      if (data?.username && data.username !== props.username) {
        setRemoteMediaReady(true);
      }
    });

    socket.on("renegotiate", (data) => {
      if (peerRef.current && !peerRef.current.destroyed && data?.signal) {
        peerRef.current.signal(data.signal);
      }
    });

    return () => {
      socket.off("hello");
      socket.off("callAccepted");
      socket.off("streamEnabled");
      socket.off("renegotiate");
      if (fallbackCallTimeoutRef.current) {
        clearTimeout(fallbackCallTimeoutRef.current);
      }
      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.destroy();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      if (stream) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (e) {
            // Ignore errors on cleanup
          }
        });
      }
    };
  }, []);

  // Auto-accept incoming call (receive-only allowed)
  useEffect(() => {
    if (receivingCall && callerSignal && !peerRef.current) {
      acceptCall();
    }
  }, [receivingCall, callerSignal]);

  // Initiate call once local media is enabled
  useEffect(() => {
    const opponent = props.allUsers.find(
      (user) => user.username !== props.username
    );

    const shouldInitiate = props.username < opponent?.username;

    if (!opponent || props.allUsers.length < 2 || !localMediaReady) {
      return;
    }

    if (peerRef.current || initiatedCall.current) {
      return;
    }

    if (shouldInitiate) {
      initiatedCall.current = true;
      callPeer(opponent.username);
      return;
    }

    if (fallbackCallTimeoutRef.current) {
      clearTimeout(fallbackCallTimeoutRef.current);
    }

    fallbackCallTimeoutRef.current = setTimeout(() => {
      if (!peerRef.current && !initiatedCall.current && !receivingCall) {
        initiatedCall.current = true;
        callPeer(opponent.username);
      }
    }, 1500);
  }, [localMediaReady, props.allUsers, props.username]);

  const enableMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      setVideoEnabled(true);
      setAudioEnabled(true);
      setLocalMediaReady(true);
      
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }

      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.addStream(mediaStream);
        } catch (e) {
          // Ignore addStream errors
        }
      }

      socket.emit("streamEnabled", {
        roomId: props.roomId,
        username: props.username,
      });
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
    if (peerRef.current) {
      return;
    }

    if (!stream) {
      return;
    }

    initialSignalSentRef.current = false;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on("signal", (data) => {
      if (!initialSignalSentRef.current) {
        initialSignalSentRef.current = true;
        socket.emit("callUser", {
          userToCall: username,
          signalData: data,
          from: props.username,
          roomId: props.roomId,
        });
      } else {
        socket.emit("renegotiate", {
          signal: data,
          roomId: props.roomId,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("track", (track, stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });
  };

  const acceptCall = () => {
    if (peerRef.current) {
      return;
    }

    if (!callerSignal) {
      return;
    }

    initialSignalSentRef.current = false;
    setCallAccepted(true);
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream || undefined,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peerRef.current = peer;

    peer.on("signal", (data) => {
      if (!initialSignalSentRef.current) {
        initialSignalSentRef.current = true;
        socket.emit("acceptCall", {
          signal: data,
          to: caller,
          roomId: props.roomId,
        });
      } else {
        socket.emit("renegotiate", {
          signal: data,
          roomId: props.roomId,
        });
      }
    });

    peer.on("stream", (remoteStream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = remoteStream;
      }
    });

    peer.on("track", (track, stream) => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
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
