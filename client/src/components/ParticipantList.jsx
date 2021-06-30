import React, { useContext, useEffect } from "react";
import clsx from 'clsx';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Typography, IconButton } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';

import { NameContext } from '../Context';

const useStyles = makeStyles(() => ({
    item: {
        width: '20vw',
    }
    
  }));

const ParticipantList = (props) => {
    const classes = useStyles();
    console.log(props.usernames);

return (
    <div className={classes.item}>
        <div>
            No of participants = {props.usernames.length}
        </div>
        <div>
            Me
        </div>
        <div>
            Markdown name                           
        </div>
        {props.usernames.map((peername, index) => {
                    console.log("forEach runs");
                    return (
                        <div>
                            {index}) {peername}
                        </div>
                    );
                })}
    </div>
);
}

export default ParticipantList;