import React, { useState, useContext } from "react";
import { TextField, makeStyles, AppBar } from "@material-ui/core";
import { v1 as uuid } from "uuid";
import { NameContext } from "../Context.js";
import "../css/CreateRoom.css";

const useStyles = makeStyles(() => ({
  appBar: {
    width: "100%",
    height: "8vh",
    backgroundColor: "#e3e3e3",
    color: "#1b024a",
    fontWeight: "10000",
    fontSize: "xx-large",
    fontWeight: "bold",
    paddingTop: "1vh",
    paddingLeft: "2vh",
  },
  Container: {
    height: "25vh",
    display: "wrap",
    flexDirection: "column",
    width: "40vh",
    marginLeft: "10vh",
    alignItems: "center",
    background: "#ffffff",
    backgroundColor: "#e3e3e3",
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
    <div>
      <AppBar className={classes.appBar} position='static' height='10vh'>
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
          <button style={{ backgroundColor: "#1b024a", color: "#ffffff", fontWeight: "bold", }}>Create room</button>
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
          <button style={{ backgroundColor: "#1b024a", color: "#ffffff", fontWeight: "bold", }}>
            Create chat room
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
