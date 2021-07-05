import ChatBox from "../components/ChatBox";
import React, { useState, useContext } from "react";
import { TextField, makeStyles, AppBar } from "@material-ui/core";
import { v1 as uuid } from "uuid";
import { NameContext } from "../Context.js";
import styled from "styled-components";

const Container = styled.div`
    margin: auto;
    width: 40vw;
    margin-left: 37vw;
 `;
  



const OnlyChat = (props) => {

  return (
    <>
    <AppBar className='App-bar' position='static' height='10vh'>
        Video Chat App
    </AppBar>
    <Container >
        <ChatBox/>

    </Container>
    </>
  );
};

export default OnlyChat;