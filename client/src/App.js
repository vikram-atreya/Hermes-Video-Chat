import React from 'react';
import { Typography, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import VideoPlayer from './components/VideoPlayer';
import ChatBox from './components/ChatBox';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'left',
    width: '100%',
    border: '2px solid black',
    backgroundColor: '#241233',

    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  image: {
    marginLeft: '15px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    margin: 0,
  },
  title: {
    borderRadius: 0,
    color: 'aliceblue',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    margin: 0,
  },
}));

const App = () => {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <AppBar className={classes.appBar} position="static" color="inherit" align="center" alignItems="left">
        <Typography variant="h4" className={classes.title}>
          Teams clone
        </Typography>
      </AppBar>

      <div className={classes.row}>
        <VideoPlayer />
        <ChatBox />
      </div>
      <div className={classes.footer}>
        <Sidebar>
          <Notifications />
        </Sidebar>
      </div>

    </div>
  );
};

export default App;
