import React, { useEffect, useRef, useState, useContext } from "react";

import ChatBox from '../components/ChatBox';
import { NameContext } from '../Context';

import { Button, makeStyles, Typography } from '@material-ui/core';
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import io from "socket.io-client";
import Peer from "simple-peer";

import styled from "styled-components";
import { lightBlue } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
    button: {
      marginLeft: '10px',
      alignSelf: 'center',
    },
    stickToBottom: {
        width: '100%',
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
  }));

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    });

    return (
        <>
        <StyledVideo controls playsInline autoPlay ref={ref} />
        </>
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [video, setVideo] = useState(1);
    const [audio, setAudio] = useState(1);
    const [myVideo, setmyVideo] = useState();
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    const { name } = useContext(NameContext);

    const classes = useStyles();

    useEffect(() => {
        console.log({name});
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            setmyVideo(stream);
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
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
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })
                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, [name]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
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
        setVideo(2);
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then((currentStream) => {
            setmyVideo(currentStream);
            userVideo.current.srcObject = currentStream;
            //myVideo.streams[0].replaceTrack(myVideo.streams[0].getVideoTracks()[0], currentStream, myVideo.streams[0]);
          });
      };

      const stopshareScreen = () => {
        setVideo(1);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((currentStream) => {
            setmyVideo(currentStream);
            userVideo.current.srcObject = currentStream;
            //myVideo.streams[0].replaceTrack(myVideo.streams[0].getVideoTracks()[0], currentStream, myVideo.streams[0]);
          });
      };

    return (
        <div style={{  
            display: "grid",  
            gridTemplateColumns: "5fr 1fr",
            right: "0px",
            margin: "0px",
            maxHeight: "1080px",
          }}>
            <Container>
                <StyledVideo controls muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => {
                    return (
                        <Video key={index} peer={peer} name={name} />
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
