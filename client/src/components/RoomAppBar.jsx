import React, { useContext, useState } from "react";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
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
    backgroundColor: "#ffffff",
    color: "#1b024a",
    fontSize: "x-large",
    fontWeight: "10000",
    marginRight: "23%",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: "77%",
    color: "#1b024a",
    fontSize: "x-large",
    fontWeight: "10000",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: "23%",
  },
  title: {
    flexGrow: 1,
    fontSize: "xx-large",
    fontWeight: "bold",
    color: "#1b024a"
  },
  hide: {
    display: "none",
  },
}));

const RoomAppbar = () => {

  const [copied, setCopied] = useState(0);

  const classes = useStyles();
  const { chatDrawerOpen, setChatDraweropen } = useContext(NameContext);
  const { peopleDrawerOpen, setPeopleDraweropen } = useContext(NameContext);

  const handleChatDrawerOpen = () => {
    setChatDraweropen(true);
    setPeopleDraweropen(false);
    console.log(chatDrawerOpen);
  };

  const handlePeopleDrawerOpen = () => {
    setPeopleDraweropen(true);
    setChatDraweropen(false);
    console.log(peopleDrawerOpen);
  };

  const copyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = window.location.href;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setCopied(1);
    setInterval(() => {
      setCopied(0);
    }, 2500)
  }

  return (
    <AppBar
      className={clsx(classes.appBar, {
        [classes.appBarShift]: chatDrawerOpen,
      })}
      position='static'
      style={{color: "#1b024a"}}
    >
      <Toolbar>
          <Typography className={classes.title}>
            <a href="http://localhost:3000/" style={{textDecoration: "none", color: "#1b024a"}}>
              Hermes
            </a>
          </Typography>
          {copied === 1 ? (
              <button
              style={{
                width: "8vw",
                height: "5vh",
                marginLeft: "50vw",
                marginTop: "-1px",
                boxShadow: "none"
              }}
              onClick={copyToClipboard}
              id='spl_button'
            >
               Copied!
            </button> 
            ) : (
              <button
                style={{
                  width: "8vw",
                  height: "5vh",
                  marginLeft: "50vw",
                  marginTop: "-1px",
                  boxShadow: "none"
                }}
                onClick={copyToClipboard}
                id='spl_button'
              >
                 Copy link
              </button> 
            )}
        
  
  
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
