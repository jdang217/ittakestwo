import axios from 'axios';
import React from 'react';
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

import './signup.css';

const SignUp = () => {

    //username and password inputs
    const [inputs, setInputs] = useState({});
    
    //username error message
    const [userError, setUserError] = useState('');
    const [userErrorIcon, setUserErrorIcon] = useState(<FaTimesCircle visibility='hidden' size='25px'/>);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({...values, [name]: value}))
    }

    const handleUsername = (event) => {

        var letterNumber = /^[0-9a-zA-Z]+$/;

        if (!inputs.username || inputs.username === 0) {
            setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='25px'/>);
            setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='25px' />); }, 500);
            setTimeout(function() {setUserError('Username cannot be empty     '); }, 500);
        }
        else if (!inputs.username.match(letterNumber)) {
            setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='25px'/>);
            setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='25px' />); }, 500);
            setTimeout(function() {setUserError('       Characters must be Aa-Zz, 0-9, or _'); }, 500);
        }
        else {

            var bodyFormData = new FormData();
            bodyFormData.append('username', inputs.username);

            axios({
                method: "post",
                url: "/api/signup/",
                data: bodyFormData,
                headers: { "Content-Type": "multipart/form-data", 
                        "Signup-Part": "username"
                },
            })
            .then(function (response) {
                //handle success
                console.log("here");
                console.log(response);

                //show loading and then check icon after .5 seconds
                setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='25px'/>);
                setTimeout(function() {setUserErrorIcon(<FaCheckCircle color='#32cd32' size='25px' />); }, 500);
                setTimeout(function() {setUserError(''); }, 500);
            })
            .catch(err => {
                if (err.response) {
                // client received an error response (5xx, 4xx)
                    console.log("here1");
                    if (err.response.status === 403) {
                        setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='25px'/>);
                        setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='25px' />); }, 500);
                        setTimeout(function() {setUserError('This username is already taken'); }, 500);
                    }
                } else if (err.request) {
                // client never received a response, or request never left
                    console.log("here2");
                } else {
                // anything else
                    console.log("here3");
                }
            })
        }
    }

    const handleFocusOut = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({...values, [name]: value}))

        var letterNumber = /^[0-9a-zA-Z]+$/;

        if (name === 'username') {
            
        }
        else if (name === 'password') {

        }
        else {
            console.log("type of input is not valid");
        }
    }

    const bcrypt = require("bcryptjs");
    const saltRounds = 10;
    const handleSubmit = (event) => {
        event.preventDefault();

        //check username availability
        //console.log(inputs.username);

        //check password security
        //console.log(inputs.password);

        //encrypt and insert into mongodb
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
            if (saltError) {
                throw saltError;
            } else {
                bcrypt.hash(inputs.password, salt, function(hashError, hash) {
                if (hashError) {
                    throw hashError;
                } else {
                    //insert into db
                    //console.log(hash);
                    var bodyFormData = new FormData();
                    bodyFormData.append('username', inputs.username);
                    bodyFormData.append('password', hash);

                    axios({
                        method: "post",
                        url: "/api/signup",
                        data: bodyFormData,
                        headers: { "Content-Type": "multipart/form-data" },
                    })
                    .then(function (response) {
                        //handle success
                        console.log(response);
                    })
                    .catch(function (response) {
                        //handle error
                        console.log(response);
                    });
                }
              })
            }
        })  
    }

    return (
        <div>
            <h1 className='title'>Sign Up</h1>
            <br/>
            <br/>
            <div className='form'>
                <form onSubmit={()=>{ handleUsername(); handleSubmit() }}>
                    <label >Username:{'                   '} 
                    <br/> {'      '}  
                    <input 
                        type="text" 
                        name="username" 
                        value={inputs.username || ""} 
                        onChange={handleChange}
                        onBlur={handleUsername}
                        pattern="[a-zA-Z0-9-]+"
                    />
                    </label> 
                    <label className='icon'> {userErrorIcon}</label>
                    <br/>
                    <label className='errors'>{userError}</label>
                    <br/><br/>
                    <label>Password:{'                           '} 
                    <br/>
                        <input 
                        type="text" 
                        name="password" 
                        value={inputs.password || ""} 
                        onChange={handleChange}
                        onBlur={handleFocusOut}
                    />
                    </label>
                    <br/><br/>
                    <input type="submit" value="Sign Up!" />
                </form>
            </div>
        </div>
    );
};

export default SignUp;
