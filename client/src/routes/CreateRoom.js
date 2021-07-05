import React, { useState, useContext } from "react";
import { TextField, makeStyles, AppBar } from "@material-ui/core";
import { v1 as uuid } from "uuid";
import { NameContext } from "../Context.js";
import "../css/CreateRoom.css";

const useStyles = makeStyles(() => ({
  Container: {
    height: "25vh",
    display: "wrap",
    flexDirection: "column",
    width: "40vh",
    marginLeft: "10vh",
    alignItems: "center",
  },
}));

const CreateRoom = (props) => {
  const [state, setState] = useState({ message: "", name: "" });
  const { globalName, setglobalName } = useContext(NameContext);

  const classes = useStyles();

  function create() {
    console.log({ globalName });
    const id = uuid();
    setglobalName(state["name"]);
    props.history.push(`/room/${id}`);
  }

  function createChat() {
    console.log({ globalName });
    const id = uuid();
    setglobalName(state["name"]);
    props.history.push(`/ChatBox/${id}`);
  }



  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
    console.log(state["name"]);
  };

  return (
    <>
      <AppBar className='App-bar' position='static' height='10vh'>
        Video Chat App
      </AppBar>
      <div class='outer-typewriter'>
        <div class='typewriter'>
          <h1>Welcome to my Video Chat App.</h1>
        </div>
      </div>
      <div>
        <form onSubmit={create} className={classes.Container}>
          <h2>Enter your display name</h2>
          <div>
            <TextField
              name='name'
              value={state.name}
              onChange={(e) => onTextChange(e)}
              label='Name'
            />
          </div>
          <button style = {{backgroundColor: "#4169E1"}}>Create room</button>
        </form>
      </div>
      <br></br>
      <div>
        <form onSubmit={createChat} className={classes.Container}>
          <h2>Enter your display name</h2>
          <div>
            <TextField
              name='name'
              value={state.name}
              onChange={(e) => onTextChange(e)}
              label='Name'
            />
          </div>
          <button style = {{backgroundColor: "#4169E1"}}>Create chat room</button>
        </form>
      </div>
    </>
  );
};

export default CreateRoom;
