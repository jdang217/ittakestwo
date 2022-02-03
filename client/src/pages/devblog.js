import sanitize from 'mongo-sanitize';
import React from 'react';
import { useState, useEffect } from "react";
import axios from 'axios';
import moment from 'moment';

import './css/devblog.css';

const Devblog = (props) => {

    const [inputs, setInputs] = useState({});

    const [canPost, setCanPost] = useState(false);

    const [posts, setPosts] = useState('');

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        var cleanMessage = sanitize(inputs.message);

        //insert into db
        var bodyFormData = new FormData();
        //bodyFormData.append('username', )
        bodyFormData.append('message', cleanMessage);

        axios({
            method: "post",
            url: "/api/devblog",
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data",
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
    }

    useEffect(() => {
        axios({
            method: "get",
            url: "/api/devblog",
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(response)
            const postData = response.data;
            setPosts(postData);
            setCanPost(response.headers["can-post"] === 'true')
        })
        .catch(function (error) {
            //handle error
            setCanPost(false);
            console.log(error);
        });
    }, [inputs])

    /*useEffect(() => {
        if (posts !== '') {
            posts.forEach(item => {
                console.log(item.username);
                console.log(item.message);
            });
        }
    }, [posts])*/

    return (
        <div className='window' >
            <h1 className='title' >ItTakesTwo Devblog</h1>
            <div className='form'>
                <form onSubmit={handleSubmit}>
                    {(props.isLoggedIn && canPost) && (
                        <textarea 
                            className='submittext' 
                            type='text' 
                            disabled={false} 
                            name='message'
                            value={inputs.message || ""}
                            onChange={handleChange}
                        />
                    )}

                    {(props.isLoggedIn && canPost) && (
                        <input 
                            className='submit' 
                            type="submit" 
                            value="Submit" 
                        />
                    )}
                </form>
            </div>
            <div className='post'>
                {(!props.isLoggedIn || !canPost) && (
                    <div>
                        {[...posts].map(
                            (item) => (
                                <Post username={item.username} message={item.message.replace(/\\r\\n/g,"\r\n")} 
                                date={moment(item.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').format("MMM Do, YYYY")}/>
                            )
                        )}
                        <br/>
                    </div> 
                )}
                {(props.isLoggedIn && canPost) && (
                    <div style={{"margin-top": "200px"}}>
                        <br/>
                        {[...posts].map(
                            (item) => (
                                <Post username={item.username} message={item.message.replace(/\\r\\n/g,"\r\n")} 
                                date={moment(item.createdAt, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').format("MMM Do, YYYY")}/>
                            )
                        )} 
                        <br/>
                    </div>
                )}
            </div>
        </div>
    );
};

const Post = (props) => (
    <div className='postbox'>
        <div className='posttitle'>
            <label>
                Post By {props.username} 
            </label>

            <label>
                {props.date}
            </label>
        </div>
        <br/>
        <div className='posttext'>
            <label style={{"maxWidth": "86vw"}}>
                {props.message}
            </label>
        </div>
    </div>
)

export default Devblog;


