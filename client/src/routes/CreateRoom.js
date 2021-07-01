import React, { useState, useContext } from "react";
import { TextField, makeStyles, AppBar } from "@material-ui/core";
import { v1 as uuid } from "uuid";
import { NameContext } from "../Context.js";

const useStyles = makeStyles(() => ({
  Container: {
    height: "20vh",
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

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
    console.log(state["name"]);
  };

  return (
    <>
      <AppBar className='App-bar' position='static' height='10vh'>
        Video Chat App
      </AppBar>
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
        <button>Create room</button>
      </form>
    </>
  );
};

export default CreateRoom;
