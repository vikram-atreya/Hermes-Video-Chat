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
    paddingLeft: "1vw",
  },
  Container: {
    height: "30vh",
    display: "wrap",
    flexDirection: "column",
    width: "30vw",
    marginLeft: "10vh",
    alignItems: "center",
    background: "#ffffff",
    backgroundColor: "#e3e3e3",
    paddingLeft: "2vw",
    paddingRight: "2vw",
    paddingTop: "2vh",
    paddingDown: "2vh",
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
      <AppBar className={classes.appBar} position='static'>
        Video Chat App
      </AppBar>
      <div class='outer-typewriter'>
        <div class='typewriter'>
          <h1>Welcome to my Video Chat App.</h1>
        </div>
      </div>
      <div style={{ marginLeft: "30vw", width: "40vw", height: "30vh" }}>
        <form onSubmit={create} className={classes.Container}>
          <h2 style={{ height: "4vh" }}>Enter your display name</h2>
          <div style={{ height: "8vh" }}>
            <TextField
              name='name'
              value={state.name}
              onChange={(e) => onTextChange(e)}
              label='Name'
              style={{ width: "23vw" }}
            />
          </div>
          <div id="btn-container">
            <button id="spl_button" role='button' onClick={create}>
            Create Video Room<span></span>
              <span></span>
              <span></span>
              <span></span>
              <b aria-hidden='true'>Create Video Room</b>
              <b aria-hidden='true'>Create Video Room</b>
              <b aria-hidden='true'>Create Video Room</b>
              <b aria-hidden='true'>Create Video Room</b>
            </button>
            <button id="spl_button" role='button' onClick={createChat}>
            Create Chat Room<span></span>
              <span></span>
              <span></span>
              <span></span>
              <b aria-hidden='true'>Create Chat Room</b>
              <b aria-hidden='true'>Create Chat Room</b>
              <b aria-hidden='true'>Create Chat Room</b>
              <b aria-hidden='true'>Create Chat Room</b>
            </button>
          </div>          
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
