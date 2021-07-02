import React, { useContext, useEffect } from "react";
import clsx from "clsx";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Typography, IconButton } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ChatIcon from "@material-ui/icons/Chat";
import PeopleIcon from "@material-ui/icons/People";

import { NameContext } from "../Context";

const useStyles = makeStyles(() => ({
  item: {
    width: "20vw",
  },
}));

const ParticipantList = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      <div>No of participants = {props.usernames.length + 1}</div>
      <div>1) Me</div>
      {props.usernames.map((user, index) => {
        return (
          <div>
            {index + 2}) {user.peername}
          </div>
        );
      })}
    </div>
  );
};

export default ParticipantList;
