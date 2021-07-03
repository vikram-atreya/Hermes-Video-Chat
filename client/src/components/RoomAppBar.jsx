import React, { useContext } from "react";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Typography, IconButton } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ChatIcon from "@material-ui/icons/Chat";
import PeopleIcon from "@material-ui/icons/People";

import { NameContext } from "../Context";

const useStyles = makeStyles((theme) => ({
  appBar: {
    width: "100%",
    height: "8vh",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: "77%",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: "23%",
  },
  title: {
    flexGrow: 1,
    fontSize: "1em",
  },
  hide: {
    display: "none",
  },
}));

const RoomAppbar = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { chatDrawerOpen, setChatDraweropen } = useContext(NameContext);
  const { peopleDrawerOpen, setPeopleDraweropen } = useContext(NameContext);

  const handleChatDrawerOpen = () => {
    console.log("app bar chat button works");
    setChatDraweropen(true);
    setPeopleDraweropen(false);
    console.log(chatDrawerOpen);
  };

  const handlePeopleDrawerOpen = () => {
    console.log("app bar people button works");
    setPeopleDraweropen(true);
    setChatDraweropen(false);
    console.log(peopleDrawerOpen);
  };

  return (
    <AppBar
      className={clsx(classes.appBar, {
        [classes.appBarShift]: chatDrawerOpen,
      })}
      position='static'
    >
      <Toolbar>
        <Typography className={classes.title}>Video Chat App</Typography>
        <IconButton
          color='inherit'
          aria-label='open drawer'
          edge='end'
          onClick={handlePeopleDrawerOpen}
          className={clsx(peopleDrawerOpen && classes.hide)}
        >
          <PeopleIcon />
        </IconButton>
        <IconButton
          color='inherit'
          aria-label='open drawer'
          edge='end'
          onClick={handleChatDrawerOpen}
          className={clsx(chatDrawerOpen && classes.hide)}
        >
          <ChatIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default RoomAppbar;
