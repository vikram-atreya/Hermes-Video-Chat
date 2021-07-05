import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import CreateRoom from "./routes/CreateRoom";
import ChatBox from "./components/ChatBox";
import OnlyChat from "./routes/OnlyChat";
import Room from "./routes/Room";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route path='/' exact component={CreateRoom} />
          <Route path='/ChatBox/:roomID' component={OnlyChat} />
          <Route path='/room/:roomID' component={Room} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
