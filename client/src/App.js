import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import AppBar from '@material-ui/core/AppBar';
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import './App.css';

function App() {
  return (
    <>
      <AppBar className="App-bar" position="static" height="10vh">
        Video Chat App
      </AppBar>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={CreateRoom} />
          <Route path="/room/:roomID" component={Room} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
