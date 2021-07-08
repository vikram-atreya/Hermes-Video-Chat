import ChatBox from "../components/ChatBox";
import React, { useEffect, useState, useContext } from "react";
import { Button, TextField, AppBar, makeStyles } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { NameContext } from "../Context.js";
import styled from "styled-components";

const useStyles = makeStyles(() => ({
  appBar: {
    width: "100vw",
    height: "8vh",
    backgroundColor: "#e3e3e3",
    color: "#1b024a",
    fontSize: "xx-large",
    fontWeight: "bold",
    paddingTop: "1vh",
    paddingLeft: "1vw",
    display: "flex",
    flexDirection: "row",
  },
}));

const BB = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const Container = styled.div`
  margin: auto;
  width: 40vw;
  margin-left: 37vw;
  overflow: hidden;
`;

const OnlyChat = (props) => {
  const [nameModalopen, setnameModalOpen] = useState(false);
  const [tempName, settempName] = useState({ name: "" });
  const { globalName, setglobalName } = useContext(NameContext);
  const roomID = props.match.params.roomID;

  const classes = useStyles();

  useEffect(() => {
    if (globalName === "") {
      setnameModalOpen(true);
    }
  }, [globalName]);

  const handleModalClose = () => {
    setglobalName(tempName.name);
    setnameModalOpen(false);
  };

  const onTextChange = (e) => {
    settempName({ ...tempName, [e.target.name]: e.target.value });
  };

  function create() {
    props.history.push(`/room/${roomID}`);
  }

  return (
    <BB>
      {nameModalopen && (
        <div>
          <Dialog
            open={nameModalopen}
            onClose={handleModalClose}
            aria-labelledby='form-dialog-title'
          >
            <DialogTitle id='form-dialog-title'>
              Please enter your name
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin='dense'
                name='name'
                label='Name'
                fullWidth
                onChange={(e) => onTextChange(e)}
                value={tempName.name}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleModalClose} color='primary'>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
      <AppBar className={classes.appBar} position='static' height='10vh'>
        <div style={{ width: "30vw" }}>Video Chat App</div>
        <button
          style={{
            width: "12vw",
            height: "5vh",
            marginLeft: "55vw",
            marginRight: "2vw",
            marginTop: "5px",
          }}
          onClick={create}
          id='spl_button'
        >
          Enter Video room
        </button>
      </AppBar>
      <Container>
        <ChatBox roomID={roomID} />
      </Container>
    </BB>
  );
};

export default OnlyChat;
