import React from 'react';
import { useState } from "react";

import './signup.css';

const SignUp = () => {
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        //check username availability
        console.log(inputs.username);

        //check password security
        console.log(inputs.password);

        //encrypt and insert into mongodb

    }

    return (
        <div>
            <h1 className='title'>Sign Up</h1>
            <div className='form'>
                <form onSubmit={handleSubmit}>
                    <label>Username:
                    <input 
                        type="text" 
                        name="username" 
                        value={inputs.username || ""} 
                        onChange={handleChange}
                    />
                    </label>
                    <br/>
                    <label>Password:
                        <input 
                        type="text" 
                        name="password" 
                        value={inputs.password || ""} 
                        onChange={handleChange}
                    />
                    </label>
                    <input type="submit" />
                </form>
            </div>
        </div>
    );
};

export default SignUp;
