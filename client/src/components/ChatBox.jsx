import { TextField } from '@material-ui/core';
import React, { useEffect, useRef, useState, useContext } from 'react';

import io from 'socket.io-client';
import '../css/ChatBox.css';
import { NameContext } from '../Context';

function ChatBox() {
  //const { name } = useContext(NameContext);
  const [state, setState] = useState({ message: '', name: 'User' });
  const [chat, setChat] = useState([]);

  const { globalName } = useContext(NameContext);

  const socketRef = useRef();

  useEffect(() => {
      socketRef.current = io.connect('http://localhost:8000');
      socketRef.current.on('message', ({ name, message }) => {
        console.log({ name, message });
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
    var { name, message } = state;
    if(global !== '') name = globalName;
    else name = 'User';
    console.log({ name, message });
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
        <div>
          <h1>Chat</h1>
          {renderChat()}
        </div>
      </div>
      <div>
        <form onSubmit={onMessageSubmit}>
          <h2>Send Message</h2>
          <div>
            <TextField
              name="message"
              className="text-field"
              onChange={(e) => onTextChange(e)}
              value={state.message}
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
