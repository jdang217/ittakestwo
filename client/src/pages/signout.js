import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

const SignOut = (props) => {

    const navigate = useNavigate();

    console.log(localStorage.getItem("token"));
    localStorage.removeItem("token");
    console.log(localStorage.getItem("token"));
    props.logout();
    navigate('/');

    return null;
};

export default SignOut;
