import React, { useContext } from 'react';
import { Button, Grid, Typography, Paper, makeStyles } from '@material-ui/core';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import { SocketContext } from '../Context';

const useStyles = makeStyles((theme) => ({
  video: {
    width: '100%;',
    [theme.breakpoints.down('xs')]: {
      width: '50%',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '0px',
    border: '10px solid black',
    margin: '0px',
    flexDirection: 'row',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call, video, shareScreen, stopshareScreen, audio, stopAudio, startAudio, stopVideo, startVideo } = useContext(SocketContext);
  const classes = useStyles();

  return (
    <Grid container className={classes.gridContainer}>
      {stream && (
        <Paper className={classes.paper} lg={6}>
          <Grid item xs={12} md={12}>
            <Typography variant="h5" gutterBottom alignRight>{name || 'Name'}</Typography>
            <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
          </Grid>
          <Grid>
            <div item xs={3} md={3}>
              { (video === 1 || video === 0) ? (
                <Button variant="contained" color="primary" startIcon={<ScreenShareIcon fontSize="large" />} onClick={() => shareScreen()}>
                  Share screen
                </Button>
              ) : (
                <Button variant="contained" color="primary" startIcon={<CancelPresentationIcon fontSize="large" />} onClick={() => stopshareScreen()}>
                  Stop Sharin
                </Button>
              )}
            </div>
            <div item xs={3} md={3}>
              { (audio) ? (
                <Button variant="contained" color="primary" startIcon={<MicOffIcon fontSize="large" />} onClick={() => stopAudio()} />
              ) : (
                <Button variant="contained" color="primary" startIcon={<MicIcon fontSize="large" />} onClick={() => startAudio()} />
              )}
            </div>
            <div item xs={3} md={3}>
              { (video === 0) ? (
                <Button variant="contained" color="primary" startIcon={<VideocamIcon fontSize="large" />} onClick={() => startVideo()} />
              ) : (
                <Button variant="contained" color="primary" startIcon={<VideocamOffIcon fontSize="large" />} onClick={() => stopVideo()} />
              )}
            </div>
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={classes.paper} lg={6}>
          <Grid item xs={12} md={12}>
            <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
            <video playsInline ref={userVideo} autoPlay className={classes.video} />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
