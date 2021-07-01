import React, { useEffect, useRef, useState, useContext } from "react";

import ChatBox from "../components/ChatBox";
import ParticipantList from "../components/ParticipantList";
import RoomAppbar from "../components/RoomAppBar";
import { NameContext } from "../Context";

import {
  Button,
  makeStyles,
  Typography,
  TextField,
  Drawer,
} from "@material-ui/core";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import MicOffIcon from "@material-ui/icons/MicOff";
import MicIcon from "@material-ui/icons/Mic";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import CallEndIcon from "@material-ui/icons/ScreenShare";
import StopIcon from "@material-ui/icons/Stop";
import AlbumIcon from "@material-ui/icons/Album";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

import io from "socket.io-client";
import Peer from "simple-peer";

import styled from "styled-components";

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: "10px",
    alignSelf: "center",
  },
  stickToBottom: {
    width: "76vw",
    position: "fixed",
    bottom: 0,
    left: 0,
    backgroundColor: "lightBlue",
    marginLeft: "0px",
    alignItems: "center",
    alignSelf: "center",
    paddingTop: "1em",
    paddingBottom: "1em",
    paddingLeft: "auto",
  },
  VideoBox: {
    float: "top",
    height: "32%",
    width: "40%",
    margin: "20px 20px 0px 20px",
    flexWrap: "wrap",
  },
  VideoName: {
    textAlign: "center",
    backgroundColor: "grey",
  },
}));

const Container = styled.div`
  padding: 20px;
  display: flex;
  height: 88vh;
  width: 70vw;
  margin: 20 px;
  flex-wrap: wrap;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  height: 100%;
  width: 100%;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  });

  return <StyledVideo controls playsInline autoPlay ref={ref} />;
};

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  //const [peernames, setPeernames] = useState([]);
  const [video, setVideo] = useState(1);
  const [audio, setAudio] = useState(1);
  const [record, setRecord] = useState(0);
  const [myVideo, setmyVideo] = useState();
  const [callEnded, setCallEnded] = useState();
  const [tempName, settempName] = useState({ name: "" });
  const [nameModalopen, setnameModalOpen] = useState(false);

  const videoState = useRef(1);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  //const peernamesRef = useRef([]);

  const roomID = props.match.params.roomID;
  const { globalName, setglobalName } = useContext(NameContext);
  const { chatDrawerOpen, setChatDraweropen } = useContext(NameContext);
  const { peopleDrawerOpen, setPeopleDraweropen } = useContext(NameContext);

  const classes = useStyles();

  useEffect(() => {
    if (globalName === "") {
      setnameModalOpen(true);
    } else {
      socketRef.current = io.connect("/");
      navigator.mediaDevices
        .getUserMedia({ video: videoConstraints, audio: true })
        .then((stream) => {
          setmyVideo(stream);
          userVideo.current.srcObject = stream;
          socketRef.current.emit("join room", { roomID, globalName });

          socketRef.current.on("all users", (usersInThisRoom) => {
            const peers = [];
            usersInThisRoom.forEach((user, index) => {
              const peer = createPeer(user.id, socketRef.current.id, stream);
              peersRef.current.push({
                peerID: user.id,
                peer,
                peername: user.name,
              });
              peers.push({
                peerID: user.id,
                peer,
                peername: user.name,
              });
            });
            setPeers(peers);
          });

          socketRef.current.on("user joined", (payload) => {
            var peer = addPeer(payload.signal, payload.callerID, stream);
            var peername = payload.name;
            if (videoState.current === 2) {
              navigator.mediaDevices
                .getDisplayMedia({ video: videoConstraints, audio: true })
                .then(function (currentStream) {
                  peer.replaceTrack(
                    stream.getVideoTracks()[0],
                    currentStream.getVideoTracks()[0],
                    stream
                  );
                })
                .catch(function (err) {
                  console.error("Error happens:", err);
                });
            }
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
              peername,
            });
            const peerObj = {
              peer,
              peerID: payload.callerID,
              peername,
            };

            setPeers((users) => [...users, peerObj]);
          });

          socketRef.current.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          });

          socketRef.current.on("user left", (id) => {
            const peerObj = peersRef.current.find((p) => p.peerID === id);
            if (peerObj) {
              peerObj.peer.destroy();
            }
            const peers = peersRef.current.filter((p) => p.peerID !== id);
            peersRef.current = peers;
            setPeers(peers);
          });
        });
    }
  }, [globalName]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
        globalName,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const stopVideo = () => {
    myVideo.getVideoTracks()[0].enabled = false;
    setVideo(0);
  };

  const startVideo = () => {
    myVideo.getVideoTracks()[0].enabled = true;
    setVideo(1);
  };

  const stopAudio = () => {
    myVideo.getAudioTracks()[0].enabled = false;
    setAudio(0);
  };

  const startAudio = () => {
    myVideo.getAudioTracks()[0].enabled = true;
    setAudio(1);
  };

  const shareScreen = () => {
    videoState.current = 2;
    setVideo(2);
    navigator.mediaDevices
      .getDisplayMedia({ video: videoConstraints, audio: true })
      .then(function (currentStream) {
        setmyVideo(currentStream);
        userVideo.current.srcObject = currentStream;
        peers.forEach(function (pc) {
          pc.replaceTrack(
            myVideo.getVideoTracks()[0],
            currentStream.getVideoTracks()[0],
            myVideo
          );
        });
      })
      .catch(function (err) {
        console.error("Error happens:", err);
      });
  };

  const stopshareScreen = () => {
    videoState.current = 1;
    setVideo(1);
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then(function (currentStream) {
        setmyVideo(currentStream);
        userVideo.current.srcObject = currentStream;
        peers.forEach(function (pc) {
          pc.replaceTrack(
            myVideo.getVideoTracks()[0],
            currentStream.getVideoTracks()[0],
            myVideo
          );
        });
      })
      .catch(function (err) {
        console.error("Error happens:", err);
      });
  };

  const parts = [];
  let mediaRecorder;

  const Startrecording = () => {
    setRecord(1);
    navigator.mediaDevices
      .getDisplayMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start(1000);

        mediaRecorder.ondataavailable = function (e) {
          parts.push(e.data);
        };
      });
  };

  const Stoprecording = () => {
    setRecord(0);
    mediaRecorder.stop();
    const blob = new Blob(parts, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = "test.webm";
    a.click();
  };

  const Disconnect = () => {
    socketRef.current.emit("disconnect");
    window.location.reload();
  };

  const handleModalClose = () => {
    setglobalName(tempName.name);
    setnameModalOpen(false);
  };

  const handleChatDrawerClose = () => {
    setChatDraweropen(false);
  };

  const handlePeopleDrawerClose = () => {
    setPeopleDraweropen(false);
  };

  const onTextChange = (e) => {
    settempName({ ...tempName, [e.target.name]: e.target.value });
  };

  var h = window.innerHeight;

  return (
    <>
      <RoomAppbar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100fr 1fr",
          right: "0px",
          margin: "0px",
          maxHeight: { h },
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Container>
          <div>
            <Dialog
              open={nameModalopen}
              onClose={handleModalClose}
              aria-labelledby='form-dialog-title'
            >
              <DialogTitle id='form-dialog-title'>
                Please enter your name
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin='dense'
                  name='name'
                  label='Name'
                  fullWidth
                  onChange={(e) => onTextChange(e)}
                  value={tempName.name}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleModalClose} color='primary'>
                  Submit
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          <div className={classes.VideoBox}>
            <div>
              <StyledVideo
                controls
                muted
                ref={userVideo}
                autoPlay
                playsInline
              />
            </div>
            <div className={classes.VideoName}>{globalName}</div>
          </div>

          {peers.map((peer, index) => {
            return (
              <div className={classes.VideoBox}>
                <div>
                  <Video key={peer.peerID} peer={peer.peer} name={globalName} />
                </div>
                <div className={classes.VideoName}>{peers[index].peername}</div>
              </div>
            );
          })}
          <Typography className={classes.stickToBottom}>
            {video === 0 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='danger'
                startIcon={<VideocamIcon fontSize='large' />}
                onClick={() => startVideo()}
              />
            ) : (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<VideocamOffIcon fontSize='large' />}
                onClick={() => stopVideo()}
              />
            )}
            {audio === 0 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='danger'
                startIcon={<MicIcon fontSize='large' />}
                onClick={() => startAudio()}
              />
            ) : (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<MicOffIcon fontSize='large' />}
                onClick={() => stopAudio()}
              />
            )}
            {video === 1 || video === 0 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<ScreenShareIcon fontSize='large' />}
                onClick={() => shareScreen()}
              >
                Share screen
              </Button>
            ) : (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<CancelPresentationIcon fontSize='large' />}
                onClick={() => stopshareScreen()}
              >
                Stop Sharin
              </Button>
            )}

            {record === 1 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='#f44336[900]'
                startIcon={<StopIcon fontSize='large' />}
                onClick={() => Stoprecording()}
              >
                Stop recording
              </Button>
            ) : (
              <Button
                className={classes.button}
                variant='contained'
                color='#f44336[900]'
                startIcon={<AlbumIcon fontSize='large' />}
                onClick={() => Startrecording()}
              >
                Start recording
              </Button>
            )}

            <Button
              className={classes.button}
              variant='contained'
              color='#f44336[900]'
              startIcon={<CallEndIcon fontSize='large' />}
              onClick={() => Disconnect()}
            >
              Disconnect
            </Button>
          </Typography>
        </Container>
        <Drawer open={chatDrawerOpen} variant='persistent' anchor='right'>
          <IconButton onClick={handleChatDrawerClose}>
            <ChevronRightIcon />
          </IconButton>
          <ChatBox />
        </Drawer>
        <Drawer open={peopleDrawerOpen} variant='persistent' anchor='right'>
          <IconButton onClick={handlePeopleDrawerClose}>
            <ChevronRightIcon />
          </IconButton>
          <ParticipantList usernames={peersRef.current} />
        </Drawer>
      </div>
    </>
  );
};

export default Room;
