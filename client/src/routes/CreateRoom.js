import React, { useState, useContext } from "react";
import { TextField } from '@material-ui/core';
import { v1 as uuid } from "uuid";
import { NameContext } from '../Context.js';

const CreateRoom = (props) => {
    const [state, setState] = useState({ message: '', name: '' });
    const { name, setName } = useContext(NameContext);
    function create() {
        console.log({name});
        const id = uuid();
        setName(state["name"]);
        props.history.push(`/room/${id}`);
    }

    const onTextChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
        console.log(state["name"]);
      };

return (
    <form onSubmit={create}>
        <h2>Enter your display name</h2>
        <div>
            <TextField name="name" value={state.name} onChange={(e) => onTextChange(e)} label="Name"/>
        </div>
        <button>Create room</button>
    </form>
    
);
}

export default CreateRoom;