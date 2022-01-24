import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

import './signin.css';

const SignIn = (props) => {

    console.log("signin props")
    console.log(props);

    var sanitize = require('mongo-sanitize');

    var token = "";

    const navigate = useNavigate();

    const [inputs, setInputs] = useState({});

    const [loginError, setLoginError] = useState('');

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
    
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        var cleanUser = sanitize(inputs.username);
        var cleanPass = sanitize(inputs.password);
        //encrypt and insert into mongodb

        //insert into db
        var bodyFormData = new FormData();
        bodyFormData.append('username', cleanUser);
        bodyFormData.append('password', cleanPass);

        axios({
            method: "post",
            url: "/api/signin",
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data"},
        })
        .then(function (response) {
            //handle success
            token = response.data.token;
            console.log(token);
            localStorage.setItem("token", token);
            props.login();
            navigate('/');
        })
        .catch(function (response) {
            //handle error
            console.log(response);
            setTimeout(function() {setLoginError('Invalid username or password'); }, 500);
        });
    }

    return (
        <div>
            <h1 className='title'>Sign In</h1>
            <br/>
            <br/>
            <div className='form'>
                <label className='errors'> {loginError}  </label>
                <form onSubmit={handleSubmit}>
                    <label >Username:{'                             '} 
                    <br/> 
                    <input 
                        type="text" 
                        name="username" 
                        value={inputs.username || ""} 
                        onChange={handleChange}
                        pattern="[a-zA-Z0-9-]+"
                    />
                    </label> 
                    <br/><br/>
                    <label>Password:{'                              '} 
                    <br/>
                        <input 
                        type="text" 
                        name="password" 
                        value={inputs.password || ""} 
                        onChange={handleChange}
                    />
                    </label>
                    <br/><br/>
                    <input type="submit" value="Sign In!" />
                </form>
            </div>
        </div>
    );
};

export default SignIn;
