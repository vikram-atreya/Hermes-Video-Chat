import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  item: {
    width: "25vw",
  },
  styl: {
    fontStyle : 'italic', 
    fontWidth : '5px' ,
  }
}));

const ParticipantList = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      <div>No of participants({props.usernames.length + 1})</div><br></br>
      Participant list:
      <div className={classes.styl}>
        <div>1) You </div>
        {props.usernames.map((user, index) => {
        return (
          <div>
            {index + 2}) {user.peername}
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default ParticipantList;
