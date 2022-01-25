import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';

import './signup.css';

const SignUp = () => {
    var sanitize = require('mongo-sanitize');
    //username and password inputs
    const [inputs, setInputs] = useState({});

    const navigate = useNavigate();

    //username error message
    const [userError, setUserError] = useState('');
    const [userErrorIcon, setUserErrorIcon] = useState(<FaTimesCircle visibility='hidden' size='20px' err='1'/>);

    //password error message
    const [passError, setPassError] = useState('');
    const [passErrorIcon, setPassErrorIcon] = useState(<FaTimesCircle visibility='hidden' size='20px' err='1'/>);

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({...values, [name]: value}))
    }

    const handleUsername = (event) => {

        var letterNumber = /^[0-9a-zA-Z]+$/;
        var cleanUser = sanitize(inputs.username);

        if (!cleanUser || cleanUser === 0) {
            setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
            setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
            setTimeout(function() {setUserError('Username cannot be empty     '); }, 500);
        }
        else if (!cleanUser.match(letterNumber)) {
            setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
            setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
            setTimeout(function() {setUserError('         Characters must be Aa-Zz, 0-9, or _'); }, 500);
        }
        else if (cleanUser.length > 20) {
            setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
            setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
            setTimeout(function() {setUserError('           Username must be 20 characters or less'); }, 500);
        }
        else {

            var bodyFormData = new FormData();
            bodyFormData.append('username', cleanUser);

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
                //show loading and then check icon after .5 seconds
                setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='0'/>);
                setTimeout(function() {setUserErrorIcon(<FaCheckCircle color='#32cd32' size='20px' err='0'/>); }, 500);
                setTimeout(function() {setUserError(''); }, 500);
            })
            .catch(err => {
                if (err.response) {
                // client received an error response (5xx, 4xx)
                    if (err.response.status === 403) {
                        setUserErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
                        setTimeout(function() {setUserErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
                        setTimeout(function() {setUserError('This username is already taken'); }, 500);
                    }
                } else if (err.request) {
                // client never received a response, or request never left
                    console.log(err);
                } else {
                // anything else
                    console.log("here3");
                }
            })
        }
    }

    const handlePassword = (event) => {
        var cleanPass = sanitize(inputs.password);

        if (!cleanPass || cleanPass === 0) {
            setPassErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
            setTimeout(function() {setPassErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
            setTimeout(function() {setPassError('Password cannot be empty      '); }, 500);
            return false;
        }
        else if (cleanPass.length < 8) {
            setPassErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='1'/>);
            setTimeout(function() {setPassErrorIcon(<FaTimesCircle color='red' size='20px' err='1'/>); }, 500);
            setTimeout(function() {setPassError('                   Password must have 8 or more characters'); }, 500);
            return false;
        }
        setPassErrorIcon(<ImSpinner2 icon="spinner" className="spinner" size='20px' err='0'/>);
        setTimeout(function() {setPassErrorIcon(<FaCheckCircle color='#32cd32' size='20px' err='0'/>); }, 500);
        setTimeout(function() {setPassError(''); }, 500);
        return true;
    }

    const bcrypt = require("bcryptjs");
    const saltRounds = 10;
    const handleSubmit = (event) => {
        event.preventDefault();
        handleUsername();
        handlePassword();

        if (userErrorIcon.props.err === '1' || passErrorIcon.props.err === '1') {
            //input failed check
            console.log("input fail check");
            return;
        }

        var cleanUser = sanitize(inputs.username);
        var cleanPass = sanitize(inputs.password);

        //encrypt and insert into mongodb
        bcrypt.genSalt(saltRounds, function (saltError, salt) {
            if (saltError) {
                throw saltError;
            } else {
                bcrypt.hash(cleanPass, salt, function(hashError, hash) {
                if (hashError) {
                    throw hashError;
                } else {
                    //insert into db
                    var bodyFormData = new FormData();
                    bodyFormData.append('username', cleanUser);
                    bodyFormData.append('password', hash);

                    axios({
                        method: "post",
                        url: "/api/signup",
                        data: bodyFormData,
                        headers: { "Content-Type": "multipart/form-data", 
                                    "Signup-Part": "all"
                        },
                    })
                    .then(function (response) {
                        //handle success
                        navigate('/');
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
                <form onSubmit={handleSubmit}>
                    <label >Username:{'                      '} 
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
                    <label className='errors'> {userError}</label>
                    <br/><br/>
                    <label>Password:{'                       '} 
                    <br/> {'      '}
                        <input 
                        type="text" 
                        name="password" 
                        value={inputs.password || ""} 
                        onChange={handleChange}
                        onBlur={handlePassword}
                    />
                    </label>
                    <label className='icon'> {passErrorIcon}</label>
                    <br/>
                    <label className='errors'> {passError}</label>
                    <br/><br/>
                    <input type="submit" value="Sign Up!" />
                </form>
            </div>
        </div>
    );
};

export default SignUp;
