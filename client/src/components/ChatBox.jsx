import React, { useEffect, useRef, useState, useContext } from "react";

import { TextField } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import "../css/ChatBox.css";

import io from "socket.io-client";
import { NameContext } from "../Context";

const Message = (props) => {
  console.log("name1 is " + props.name1);
  console.log("globalName1 is " + props.globalName1);
  if (props.name1 !== props.globalName1) {
    return (
      <div id='message'>
        <div id='name'> {props.name1} </div>
        <span id='message-text'>{props.message1}</span>
      </div>
    );
  } else {
    return (
      <div id='message-own'>
        <div id='name'> {props.name1} </div>
        <span id='message-text'>{props.message1}</span>
      </div>
    );
  }
};

function ChatBox(props) {
  const [state, setState] = useState({ message: "", name: "User" });
  const [chat, setChat] = useState([]);
  const [newChat, setnewChat] = useState(1);

  const roomID = props.roomID;
  const { globalName } = useContext(NameContext);

  const socketRef = useRef();
  const chatRef = useRef([]);

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:8000");
    if (newChat) {
      socketRef.current.emit("newChat", roomID);
      socketRef.current.on("check", (prevData) => {
        prevData.forEach((element) => {
          var name = element.name;
          var message = element.message;
          chatRef.current.push({ name, message });
        });
        setChat(chatRef.current);
      });
      setnewChat(0);
    }
    socketRef.current.on("message", ({ name, message }) => {
      chatRef.current.push({ name, message });
      setChat([...chat, { name, message }]);
    });
    return () => socketRef.current.disconnect();
  }, [chat, roomID]);

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    var { name, message } = state;
    if (global !== "") name = globalName;
    else name = "User";
    socketRef.current.emit("message", { name, message, roomID });
    e.preventDefault();
    setState({ message: "", name });
  };

  const renderChat = () =>
    chatRef.current.map(({ name, message }, index) => (
      <div key={index}>
        <Message name1={name} message1={message} globalName1={globalName} />
      </div>
    ));

  return (
    <div className='card'>
      <div className='render-chat'>
        <div style={{ width: "100%" }}>
          <div className='title'>Chat</div>
          {renderChat()}
        </div>
      </div>
      <div>
        <form onSubmit={onMessageSubmit}>
          <span>
            <TextField
              name='message'
              className='text-field'
              onChange={(e) => onTextChange(e)}
              style={{ width: "65%" }}
              value={state.message}
              label='Message'
            />
            <button
              class='raise'
              style={{
                width: "20%",
                height: "30px",
                padding: "0px",
                margin: "0px",
                marginTop: "20px",
                border: "10px",
              }}
              onClick={onMessageSubmit}
            >
              <SendIcon style={{ marginTop: "0px", width: "50%" }} />
            </button>
          </span>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
