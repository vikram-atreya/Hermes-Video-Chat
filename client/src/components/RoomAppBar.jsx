import React, { useContext } from "react";
import clsx from 'clsx';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, IconButton } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ChatIcon from '@material-ui/icons/Chat';

import { NameContext } from '../Context';

const useStyles = makeStyles((theme) => ({
    appBar: {
      width: '100%',
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: '77%',
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: '23%',
    },
    title: {
      flexGrow: 1,
    },
    hide: {
      display: 'none',
    },
    
  }));

const RoomAppbar = () => {
    const classes = useStyles();
    const theme = useTheme();
    const { chatDrawerOpen, setChatDraweropen } = useContext(NameContext);

    const handleChatDrawerOpen = () => {
        console.log("app bar button works");
        setChatDraweropen(true);
        console.log(chatDrawerOpen);
      };


return (
    <AppBar 
        className={clsx(classes.appBar, {
            [classes.appBarShift]: chatDrawerOpen,
        })} 
        position="static" 
        height="5vh"
        >
        <Toolbar>
          <Typography className={classes.title}>
              Video Chat App
          </Typography>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleChatDrawerOpen}
            className={clsx(chatDrawerOpen && classes.hide)}
          >
            <ChatIcon />
          </IconButton>
        </Toolbar>
    </AppBar>    
);
}

export default RoomAppbar;