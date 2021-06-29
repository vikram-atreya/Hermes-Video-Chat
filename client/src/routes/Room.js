import React, { useEffect, useRef, useState, useContext } from "react";

import ChatBox from '../components/ChatBox';
import { NameContext } from '../Context';

import { Button, makeStyles, Typography, TextField } from '@material-ui/core';
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import io from "socket.io-client";
import Peer from "simple-peer";

import styled from "styled-components";

const useStyles = makeStyles((theme) => ({
    button: {
      marginLeft: '10px',
      alignSelf: 'center',
    },
    stickToBottom: {
        width: '76vw',
        position: 'fixed',
        bottom: 0,
        left: 0,
        backgroundColor: 'lightBlue',
        marginLeft: '0px',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: '1em',
        paddingBottom: '1em',
        paddingLeft: 'auto',
      },
    VideoBox: {
        float:'top',
        height: '32%',
        width: '40%',
        margin: '20px 20px 0px 20px',
        flexWrap: 'wrap',
      },
    VideoName: {
        textAlign: 'center',
        backgroundColor: 'grey',
    }
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
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    });

    return (
        <StyledVideo controls playsInline autoPlay ref={ref} />
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [peernames, setPeernames] = useState([]);
    const [video, setVideo] = useState(1);
    const videoState = useRef(1);
    const [audio, setAudio] = useState(1);
    const [myVideo, setmyVideo] = useState();
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const peernamesRef= useRef([]);
    const roomID = props.match.params.roomID;
    const { globalName, setglobalName } = useContext(NameContext);
    const [open, setOpen] = useState(false);
    const [tempName, settempName] = useState({name: ''});

    const classes = useStyles();

    useEffect(() => {
        console.log('running but cant do shit');
        if(globalName === ''){
            setOpen(true);
        }
        else{
            console.log({globalName});
            socketRef.current = io.connect("/");
            navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
                setmyVideo(stream);
                userVideo.current.srcObject = stream;
                socketRef.current.emit("join room", { roomID, globalName });

                socketRef.current.on("all users", users => {
                    console.log("all users running");
                    const peers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        peers.push(peer);
                    })
                    setPeers(peers);
                });

                socketRef.current.on("all usernames", usernames => {
                    console.log("all usernames running");
                    const peernames = [];
                    usernames.forEach(username => {
                        peernamesRef.current.push(username);
                        peernames.push(username);
                    })
                    setPeernames(peernames);
                    console.log(peernames);              
                }); 

                socketRef.current.on("user joined", payload => {
                    var peer = addPeer(payload.signal, payload.callerID, stream);
                    var peername = payload.name;
                    console.log(peername);
                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })
                    peernamesRef.current.push(peername);
                    if(videoState.current === 2){
                        navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: true })
                        .then(function(currentStream) {
            
                        peer.replaceTrack(stream.getVideoTracks()[0] ,currentStream.getVideoTracks()[0], stream);              
                        })
                        .catch(function(err) {
                            console.error('Error happens:', err);
                        });
                    }
                    setPeers(users => [...users, peer]); 
                    setPeernames(usernames => [...usernames, peername]);
                    console.log(peernamesRef.current);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                    console.log(peernames);
                });
            })
        }
    }, [globalName]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal, globalName })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

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
        navigator.mediaDevices.getDisplayMedia({ video: videoConstraints, audio: true })
        .then(function(currentStream) {
            setmyVideo(currentStream);
            userVideo.current.srcObject = currentStream;
            peers.forEach(function(pc) {
              pc.replaceTrack(myVideo.getVideoTracks()[0] ,currentStream.getVideoTracks()[0], myVideo);              
            });
          })
          .catch(function(err) {
            console.error('Error happens:', err);
          });
      };

      const stopshareScreen = () => {
        videoState.current = 1;
        setVideo(1);
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true })
        .then(function(currentStream) {
            setmyVideo(currentStream);
            userVideo.current.srcObject = currentStream;
            peers.forEach(function(pc) {
              pc.replaceTrack(myVideo.getVideoTracks()[0] ,currentStream.getVideoTracks()[0], myVideo);              
            });
          })
          .catch(function(err) {
            console.error('Error happens:', err);
          });
      };
    
      const handleModalClose = () => {
        console.log(tempName.name);
        setglobalName(tempName.name);
        setOpen(false);
      };
      const onTextChange = (e) => {
        settempName({ ...tempName, [e.target.name]: e.target.value });
        console.log(tempName.name);
      };
    var h = window.innerHeight;

    return (
        <div style={{  
            display: "grid",  
            gridTemplateColumns: "100fr 1fr",
            right: "0px",
            margin: "0px",
            maxHeight: {h},
            maxWidth: "100%",
            overflow: "hidden",
          }}>
            <Container>
                <div>
                    <Dialog open={open} onClose={handleModalClose} aria-labelledby="form-dialog-title">
                        <DialogTitle id="form-dialog-title">Please enter your name</DialogTitle>
                        <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Name"
                            fullWidth
                            onChange={(e) => onTextChange(e)}
                            value={tempName.name}
                        />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleModalClose} color="primary">
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div className={classes.VideoBox}>
                    <div>
                        <StyledVideo controls muted ref={userVideo} autoPlay playsInline />
                    </div>
                    <div  className={classes.VideoName}>
                        {globalName}
                    </div>

                </div>
                
                {peers.map((peer, index) => {
                    return (
                        <div className={classes.VideoBox}>
                            <div>
                                <Video key={index} peer={peer} name={globalName} />
                            </div>
                            <div className={classes.VideoName}>
                                {peernamesRef.current[index]}
                            </div>

                        </div>
                    );
                })}
                <Typography className={classes.stickToBottom}>
                    { (video === 0) ? (
                        <Button className={classes.button} variant="contained" color="danger" startIcon={<VideocamIcon fontSize="large" />} onClick={() => startVideo()} />
                    ) : (
                        <Button className={classes.button} variant="contained" color="primary" startIcon={<VideocamOffIcon fontSize="large" />} onClick={() => stopVideo()} />
                    )}
                    { (audio === 0) ? (
                        <Button className={classes.button} variant="contained" color="danger" startIcon={<MicIcon fontSize="large" />} onClick={() => startAudio()} />
                    ) : (
                        <Button className={classes.button} variant="contained" color="primary" startIcon={<MicOffIcon fontSize="large" />} onClick={() => stopAudio()} />
                    )}
                    { (video === 1 || video === 0) ? (
                        <Button className={classes.button} variant="contained" color="primary" startIcon={<ScreenShareIcon fontSize="large" />} onClick={() => shareScreen()}>
                        Share screen
                        </Button>
                    ) : (
                        <Button className={classes.button} variant="contained" color="primary" startIcon={<CancelPresentationIcon fontSize="large" />} onClick={() => stopshareScreen()}>
                        Stop Sharin
                        </Button>
                    )}
                </Typography>
            </Container>
            <ChatBox />
        </div>
        
    );
};

export default Room;
