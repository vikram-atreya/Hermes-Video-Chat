import { TextField } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import '../css/ChatBox.css';

function ChatBox() {
  const [state, setState] = useState({ message: '', name: '' });
  const [chat, setChat] = useState([]);

  const socketRef = useRef();

  useEffect(
    () => {
      socketRef.current = io.connect('http://localhost:5000');
      socketRef.current.on('message', ({ name, message }) => {
        setChat([...chat, { name, message }]);
      });
      return () => socketRef.current.disconnect();
    },
    [chat],
  );

  const onTextChange = (e) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const onMessageSubmit = (e) => {
    // eslint-disable-next-line
    console.log('Message submit button working');
    const { name, message } = state;
    socketRef.current.emit('message', { name, message });
    e.preventDefault();
    setState({ message: '', name });
  };

  const renderChat = () => (
    chat.map(({ name, message }, index) => (
      <div key={index}>
        <h3>
          {name}: <span>{message}</span>
        </h3>
      </div>
    )));

  return (
    <div className="card">
      <div className="render-chat">
        <h1>Chat Log</h1>
        {renderChat()}
      </div>
      <br />
      <div>
        <form onSubmit={onMessageSubmit}>
          <h2>Send Message</h2>
          <div>
            <TextField
              name="message"
              className="text-field"
              onChange={(e) => onTextChange(e)}
              value={state.message}
              id="outlined-multiline-static"
              variant="outlined"
              label="Message"
            />
          </div>
          <br />
          <button type="button" onClick={onMessageSubmit}>Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
