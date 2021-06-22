import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');
// const socket = io('https://warm-wildwood-81069.herokuapp.com');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [video, setVideo] = useState(1);
  const [audio, setAudio] = useState(true);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    if (video === 1) {
      // eslint-disable-next-line
      console.log('useffect video func called');
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          setVideo(true);
          myVideo.current.srcObject = currentStream;
        });
    } else {
      // eslint-disable-next-line
      console.log('useffect sharescreen func called');
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((currentStream) => {
          setStream(currentStream);
          setVideo(false);
          myVideo.current.srcObject = currentStream;
        });
    }

    socket.on('me', (id) => setMe(id));

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

  const shareScreen = () => {
    // eslint-disable-next-line
    console.log({myVideo});
    setVideo(2);
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  };

  const stopshareScreen = () => {
    // eslint-disable-next-line
    console.log({myVideo});
    setVideo(1);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });
  };

  const stopAudio = () => {
    stream.getAudioTracks()[0].enabled = false;
    setAudio(false);
  };

  const startAudio = () => {
    stream.getAudioTracks()[0].enabled = true;
    setAudio(true);
  };

  const stopVideo = () => {
    stream.getVideoTracks()[0].enabled = false;
    setVideo(0);
  };

  const startVideo = () => {
    stream.getVideoTracks()[0].enabled = true;
    setVideo(1);
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
      shareScreen,
      stopshareScreen,
      video,
      audio,
      stopAudio,
      startAudio,
      stopVideo,
      startVideo,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
