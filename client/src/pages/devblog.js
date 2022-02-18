import sanitize from 'mongo-sanitize';
import React from 'react';
import { useState, useEffect } from "react";
import axios from 'axios';
import moment from 'moment';

import TextareaAutosize from '@mui/base/TextareaAutosize';

import './css/devblog.css';

const Devblog = (props) => {

    const checklistTitles = ['Planned Features', 'Bugs', 'General Ideas']

    const [inputs, setInputs] = useState({});

    const [checkListInputs, setCheckListInputs] = useState({});

    const [checklistText, setChecklistText] = useState({
        [checklistTitles[0]]: '',
        [checklistTitles[1]]: '',
        [checklistTitles[2]]: '',
    });

    //const [features, setFeatures] = useState('');
    //const [bugs, setBugs] = useState('');
    //const [ideas, setIdeas] = useState('');

    const [canPost, setCanPost] = useState(false);

    const [posts, setPosts] = useState('');

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setInputs(values => ({...values, [name]: value}))
    }

    const handleChecklistChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setChecklistText(values => ({...values, [name]: value}))
    }

    const handleSubmit = (event) => {

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

    const handleChecklistSubmit = (i) => {
        
        var cleanMessage = sanitize(checklistText[i]);
        
        //insert into db
        var bodyFormData = new FormData();
        //bodyFormData.append('username', )
        bodyFormData.append('message', cleanMessage);

        axios({
            method: "post",
            url: "/api/checklist",
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data",
                       "x-auth-token": localStorage.getItem("token"),
                       "Checklist-Type": i,
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

        checklistTitles.forEach(element => {
            axios({
                method: "get",
                url: "/api/checklist",
                data: "",
                headers: { "Content-Type": "multipart/form-data",
                        "x-auth-token": localStorage.getItem("token"),
                        "Checklist-Type": element
                },
            })
            .then(function (response) {
                //handle success
                const type = response.data.type
                const message = response.data.message
                setChecklistText(values => ({...values, [type]: message}));
            })
            .catch(function (error) {
                //handle error
                console.log(error);
            });
        })
    
    }, [])

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
            <div className='checkboxcontainer' style={{display: 'flex'}}>
                {[...checklistTitles].map(
                    (item) => (
                        <Checklist isLoggedIn={props.isLoggedIn} canPost={canPost} handleChecklistSubmit={handleChecklistSubmit} 
                        handleChange={handleChecklistChange} inputs={checklistText} title={item} message={checklistText[item]}/>
                    )
                )}
                <label>{checkListInputs.Bugs}</label>
            </div>
            <br/>
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

const Checklist = (props) => (
    <div className='checkbox'>
        <div className='checkboxtitle'>
            <label>
                {props.title}
            </label>
        </div>
        
        <div>
            <form>
                <TextareaAutosize 
                    className='checkboxinput' 
                    type='text' 
                    disabled={props.canPost ? false: true} 
                    name={props.title}
                    value={props.inputs[props.title].replace(/\\r\\n/g,"\r\n") || ""}
                    onChange={props.handleChange}
                    minRows={10}
                />
                <input 
                    hidden={props.canPost ? false: true} 
                    className='checkboxsubmit' 
                    type="submit" 
                    value="Submit" 
                    onClick={() => props.handleChecklistSubmit(props.title)}
                />
            </form>
            <br/>
        </div>{/*
        <div className='checkboxtext'>
            <label>
                {props.message}
            </label>
        </div>*/}
    </div>
)

export default Devblog;


