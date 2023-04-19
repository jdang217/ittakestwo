import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import './friends.css'

const Friends = (props) => {
    const navigate = useNavigate(); 
    const location = useLocation();
    const user = location.pathname.split("/")[2];
    const clientUser = props.user;
    
    const [friends, setFriends] = useState([])
    const [friendRequests, setFriendRequests] = useState([])

    const theme = createTheme({
        palette: {
            primary: {
                main: '#FFFFFF',
                contrastText: "#774DCB",
            },
            secondary: {
                main: '#2F52A6',
                contrastText: '#FFFFFF'
            }
        },
    });

    useEffect(() => {
        axios({
            method: "get",
            url: "/api/profile/" + user,
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            setFriends(response.data.friends)
            setFriendRequests(response.data.friendRequests)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        }); 
    }, [])

    function handleAccept(username) {
        axios({
            method: "post",
            url: "/api/profile/" + user + "/" + username,
            data: {type: "ACCEPT"},
            headers: { "Content-Type": "application/json",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(Response)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        });
        window.location.reload()
    }

    function handleReject(username) {
        axios({
            method: "post",
            url: "/api/profile/" + user + "/" + username,
            data: {type: "REJECT"},
            headers: { "Content-Type": "application/json",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(Response)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        });
        setFriendRequests(prevArr => prevArr.filter(req => req !== username));
    }

    function handleUnfriend(username) {
        console.log("/api/profile/" + user + "/" + username + "/unfriend")
        axios({
            method: "post",
            url: "/api/profile/" + user + "/" + username + "/unfriend",
            data: {},
            headers: { "Content-Type": "application/json",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(response)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        });
        setFriends(prevArr => prevArr.filter(friend => friend !== username));
    }

    function goToProfile(username) {
        navigate("/profile/" + username + "");
    }
    

    const Request = (props) => {
        return (
            <div className='friends-request'>
                <ThemeProvider theme={theme}>
                <Avatar className='friends-icon' sx={{ width: 150, height: 150 }} onClick={() => goToProfile(props.username)} >{props.username.charAt(0).toUpperCase()}</Avatar>
                <div className='friends-username' onClick={() => goToProfile(props.username)} >{props.username}</div>
                <Button className='friends-accept' variant="contained" color='secondary' onClick={() => handleAccept(props.username)}>Accept</Button>
                <Button className='friends-reject' variant="contained" onClick={() => handleReject(props.username)}>Reject</Button>
                </ThemeProvider>
            </div>
        )
    }

    const Friend = (props) => {
        return (
            <div className='friends-friend'>
                <ThemeProvider theme={theme}>
                <Avatar className='friends-friendicon' sx={{ width: 150, height: 150 }} onClick={() => goToProfile(props.username)} >{props.username.charAt(0).toUpperCase()}</Avatar>
                <div className='friends-friendusername' onClick={() => goToProfile(props.username)} >{props.username}</div>
                <Button className='friends-unfriend' variant="contained" onClick={() => handleUnfriend(props.username)} hidden={clientUser != user} >Unfriend</Button>
                </ThemeProvider>
            </div>
        )
    }

    return (
        <div className='friends-window'>
            <h1 className='friends-title'>Friends</h1>
            {friendRequests.length != 0 && props.user == user && <div className='friends-requests'>
                <div className='friends-requeststitle'>Friend Requests</div>
                <div className='friends-requestsicons'>
                    {friendRequests.map(user => <Request username={user}/>)}
                </div>
            </div>}

            <div className='friends-friends'>
                {friends.map(user => <Friend username={user}/>)}
            </div>
        </div>
    );
};

export default Friends;
