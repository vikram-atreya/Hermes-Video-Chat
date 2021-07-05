import { TextField } from "@material-ui/core";
import React, { useEffect, useRef, useState, useContext } from "react";

import io from "socket.io-client";
import "../css/ChatBox.css";
import { NameContext } from "../Context";

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
  }, [chat]);

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
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    ));

  return (
    <div className='card'>
      <div className='render-chat'>
        <div>
          <h1>Chat</h1>
          {renderChat()}
        </div>
      </div>
      <div>
        <form onSubmit={onMessageSubmit}>
          <span>
            <div>
              <TextField
                name='message'
                className='text-field'
                onChange={(e) => onTextChange(e)}
                value={state.message}
                label='Message'
              />
            </div>
            <div>
              <button
                type='button'
                boxShadow='0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                onClick={onMessageSubmit}
              >
                Send
              </button>
            </div>
          </span>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
