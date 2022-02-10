import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Visibility from "@material-ui/icons/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Input from "@mui/material/Input";

import './css/signin.css';

const SignIn = (props) => {

    var sanitize = require('mongo-sanitize');

    var token = "";

    const navigate = useNavigate();

    const [inputs, setInputs] = useState({});

    const [loginError, setLoginError] = useState('');

    //controls password hiding
    const [showPass, setShowPass] = useState(false);

    const handleClickShowPassword = (event) => {
        setShowPass(!showPass)
    }

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
            console.log(response.data)
            token = response.data.token;
            localStorage.setItem("token", token);
            props.login();
            navigate('/');
        })
        .catch(function (response) {
            //handle error
            setTimeout(function() {setLoginError('Invalid username or password'); }, 500);
        });
    }

    return (
        <div>
            <h1 className='title'>Sign In</h1>
            <br/>
            <div className='form'>
                <InputLabel style={{"margin-left": "35vw"}} className='errors'
                sx={{
                    'font-size': '15px',
                    color: 'red',
                }}
                >
                    {loginError}
                </InputLabel>
                <br/>
                <form onSubmit={handleSubmit}>
                    <div style={{"margin-left": "35vw"}}>
                        <InputLabel className='label' htmlFor="standard-adornment-username">
                            Username
                        </InputLabel>
                        <Input 
                            sx={{
                                width: '30vw',
                                display: 'flex',
                            }}
                            type="text" 
                            name="username" 
                            value={inputs.username || ""} 
                            onChange={handleChange}
                            pattern="[a-zA-Z0-9-]+"
                        />
                        <br/><br/>
                        <InputLabel className='label' htmlFor="standard-adornment-password">
                            Password
                        </InputLabel>
                        <Input 
                            sx={{
                                width: '30vw',
                                display: 'flex',
                            }}
                            type={showPass ? "text" : "password"} 
                            name="password" 
                            value={inputs.password || ""} 
                            onChange={handleChange}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                    onClick={handleClickShowPassword}
                                    >
                                    {showPass ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        <br/><br/>
                    </div>
                    <input type="submit" value="Sign In!" />
                </form>
            </div>
        </div>
    );
};

export default SignIn;
