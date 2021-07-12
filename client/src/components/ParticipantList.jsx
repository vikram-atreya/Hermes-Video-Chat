import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import "../css/ParticipantList.css";

const useStyles = makeStyles(() => ({
  item: {
    width: "20vw",
    marginLeft: "2vw",
    fontWeight: "bolder",
    color: "#1b024a",
    wordWrap: "break-word",
  },
}));

const ParticipantList = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      <h2 id="users-head">Users in Call ({props.usernames.length + 1})</h2>
      <br></br>
      <ul id="un-list">
        <li id="list-el"><a href="#">1) You </a></li>
        {props.usernames.map((user, index) => {
          return (
            <li id="list-el">
              <a href="#">{index + 2}) {user.peername}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParticipantList;
