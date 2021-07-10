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
import { withStyles } from "@material-ui/core/styles";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import MicOffIcon from "@material-ui/icons/MicOff";
import MicIcon from "@material-ui/icons/Mic";
import VideocamIcon from "@material-ui/icons/Videocam";
import VideocamOffIcon from "@material-ui/icons/VideocamOff";
import CallEndIcon from "@material-ui/icons/ScreenShare";
import StopIcon from "@material-ui/icons/Stop";
import AlbumIcon from "@material-ui/icons/Album";
import PhoneDisabledIcon from '@material-ui/icons/PhoneDisabled';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { green, red } from "@material-ui/core/colors";

import io from "socket.io-client";
import Peer from "simple-peer";

import styled from "styled-components";

const useStyles = makeStyles((theme) => ({
  button: {
    height: "5vh",
    padding: "0px",
    marginLeft: "0.5vw",
    marginRight: "0.5vw",
    alignSelf: "center",
    color: "#ffffff",
    display: "wrap",
  },
  stickToBottom: {
    width: "100vw",
    height: "9vh",
    position: "fixed",
    bottom: 0,
    left: 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    alignSelf: "center",
    paddingTop: "2vh",
    paddingBottom: "2vh",
    paddingLeft: "2vw",
  },
  VideoBox: {
    float: "top",
    margin: "20px 20px 0px 20px",
    flexWrap: "wrap",
    height: "100%",
    width: "100%",
  },
  GridElement: {
    height: "100%",
    justifyContent: "space-evenly",
  },
  VideoName: {
    textAlign: "center",
    backgroundColor: "grey",
  },
  oneVideo: {
    width: "80%",
    height: "100%",
    justifyContent: "space-evenly",
  },
  twoVideo: {
    width: "45%",
    height: "100%",
  },
  threeVideo: {
    width: "45%",
    height: "45%",
  },
}));

const Container = styled.div`
  padding: auto;
  padding-top: 0px;
  display: flex;
  height: 88vh;
  width: 96vw;
  margin: auto;
  flex-wrap: wrap;
  justify-content: space-evenly;
`;

const StyledVideo = styled.video`
  height: 80%;
  width: 100%;
  margin: auto;
  object-fit: cover;
  justifycontent: "space-evenly";
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
  height: window.innerHeight,
  width: window.innerWidth,
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const [video, setVideo] = useState(1);
  const [audio, setAudio] = useState(1);
  const [record, setRecord] = useState(0);
  const [myVideo, setmyVideo] = useState();
  const [tempName, settempName] = useState({ name: "" });
  const [nameModalopen, setnameModalOpen] = useState(false);

  const videoState = useRef(1);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const ScreenshareStream = useRef();

  const roomID = props.match.params.roomID;
  const { globalName, setglobalName } = useContext(NameContext);
  const { chatDrawerOpen, setChatDraweropen } = useContext(NameContext);
  const { peopleDrawerOpen, setPeopleDraweropen } = useContext(NameContext);

  const classes = useStyles();
  const cls = (...classes) => classes.filter(Boolean).join(" ");

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
              peer.replaceTrack(
                stream.getVideoTracks()[0],
                userVideo.current.srcObject.getVideoTracks()[0],
                stream
              );
            }
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
              peername,
            });
            const peerObj = {
              peerID: payload.callerID,
              peer,
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
  }, [globalName, roomID]);

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
        userVideo.current.srcObject = currentStream;
        peers.forEach(function (pc) {
          pc.peer.replaceTrack(
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
        userVideo.current.srcObject = currentStream;
        peers.forEach(function (pc) {
          pc.peer.replaceTrack(
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
  var mediaRecorder;

  const Startrecording = () => {
    setRecord(1);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
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
    window.location.replace("http://localhost:3000");
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

  const RedButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(red[700]),
      backgroundColor: red[700],
      "&:hover": {
        backgroundColor: red[900],
      },
    },
  }))(Button);

  const GreenButton = withStyles((theme) => ({
    root: {
      color: theme.palette.getContrastText(green[700]),
      backgroundColor: green[700],
      "&:hover": {
        backgroundColor: green[900],
      },
    },
  }))(Button);

  return (
    <>
      <RoomAppbar />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "100fr 1fr",
          right: "0px",
          margin: "0px",
          height: "86vh",
          width: "100vw",
        }}
      >
        {nameModalopen && (
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
        )}
        <Container>
          <div
            className={cls(
              classes.VideoBox,
              peers.length === 0 && classes.oneVideo,
              peers.length === 1 && classes.twoVideo,
              peers.length >= 2 && classes.threeVideo
            )}
          >
            <StyledVideo controls muted ref={userVideo} autoPlay playsInline />
            <div className={classes.VideoName}>{globalName}</div>
          </div>
          {peers.map((peer, index) => {
            //bug might arise from peersRef, s/peersRef/peers/g
            return (
              <div
                className={cls(
                  classes.VideoBox,
                  peers.length === 0 && classes.oneVideo,
                  peers.length === 1 && classes.twoVideo,
                  peers.length >= 2 && classes.threeVideo
                )}
              >
                <Video key={peer.peerID} peer={peer.peer} name={globalName} />
                <div className={classes.VideoName}>{peers[index].peername}</div>
              </div>
            );
          })}
          <div
            style={{
              height: "3vh",
            }}
          />
          <div className={classes.stickToBottom}>
            <div style={{minWidth: "50vw", alignSelf: "center", alignItems: "center", margin: "auto"}}>
            {video === 0 ? (
              <RedButton
                className={classes.button}
                variant='contained'
                onClick={() => startVideo()}
              >
                <VideocamOffIcon />
              </RedButton>
            ) : (
              <GreenButton
                  className={classes.button}
                  variant='contained'
                  onClick={() => stopVideo()}
                >
                  <VideocamIcon fontSize="small"/>
                </GreenButton>
            )}
            {audio === 0 ? (
              <RedButton
                className={classes.button}
                variant='contained'
                color='danger'
                startIcon={<MicOffIcon fontSize='2vw' />}
                onClick={() => startAudio()}
              />
            ) : (
              <GreenButton
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<MicIcon fontSize='2vw' />}
                onClick={() => stopAudio()}
              />
            )}
            {video === 1 || video === 0 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<ScreenShareIcon fontSize='2vw' />}
                onClick={() => shareScreen()}
                style={{paddingLeft: "10px", paddingRight: "10px"}}
              >
                Share screen
              </Button>
            ) : (
              <RedButton
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<CancelPresentationIcon fontSize='2vw' />}
                onClick={() => stopshareScreen()}
                style={{paddingLeft: "10px", paddingRight: "10px"}}
              >
                Stop Sharin
              </RedButton>
            )}

            {record === 1 ? (
              <Button
                className={classes.button}
                variant='contained'
                color='#f44336'
                startIcon={<StopIcon fontSize='2vw' />}
                onClick={() => Stoprecording()}
                style={{paddingLeft: "10px", paddingRight: "10px"}}
              >
                Stop recording
              </Button>
            ) : (
              <Button
                className={classes.button}
                variant='contained'
                color='primary'
                startIcon={<AlbumIcon fontSize='2vw' />}
                onClick={() => Startrecording()}
                style={{paddingLeft: "10px", paddingRight: "10px"}}
              >
                Record
              </Button>
            )}

            <RedButton
              className={classes.button}
              variant='contained'
              onClick={() => Disconnect()}
            >
              <PhoneDisabledIcon fontSize='small' />
            </RedButton>
            </div>
          </div>
        </Container>
        <Drawer open={chatDrawerOpen} variant='persistent' anchor='right'>
          <div
            style={{ display: "flex", alignItems: "left", flexWrap: "wrap" }}
          >
            <IconButton onClick={handleChatDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </div>
          <ChatBox roomID={roomID} />
        </Drawer>
        <Drawer open={peopleDrawerOpen} variant='persistent' anchor='right'>
          <div
            style={{ display: "flex", alignItems: "left", flexWrap: "wrap" }}
          >
            <IconButton onClick={handlePeopleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </div>
          <ParticipantList usernames={peersRef.current} />
        </Drawer>
      </div>
    </>
  );
};

export default Room;
