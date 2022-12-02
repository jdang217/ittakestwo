import React, {useEffect, useRef, useState} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';
import _1v1Functions from './1v1Functions';

const Template = (props) => {

    const v1Functions = new _1v1Functions();

    const [update, setUpdate] = useState(0);
    const joiner = useRef(false);

    const [startDisable, setStartDisable] = useState(false);
    const [inviteDisable, setInviteDisable] = useState(true);
    const [joinDisable, setJoinDisable] = useState(true);
    const [quitDisable, setQuitDisable] = useState(true);
    const [joinIdDisable, setJoinIdDisable] = useState(true);
    const [joinInputId, setJoinInputId] = useState('');
    const [inviteInputId, setInviteInputId] = useState('');

    const [sentReceiveOpener, setSentReceiveOpener] = useState(false);

    const [messageBox, setMessageBox] = useState('');
    const [chatBox, setChatBox] = useState('');

    const [sendChannel, setSendChannel] = useState({});
    const [receiveChannel, setReceiveChannel] = useState({});
    
    const [pc, setPc] = useState('');
    useEffect(() => {
        const servers = {
            iceServers: [
              {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
              },
            ],
            iceCandidatePoolSize: 10,
        };
        setPc(new RTCPeerConnection(servers));
    }, [])

    useEffect(() => {
        sendChannel.onopen = (e) => v1Functions.handleSendChannelStatusChange(props.user, sendChannel, joiner, e);
        sendChannel.onclose = (e) => v1Functions.handleSendChannelStatusChange(props.user, sendChannel, joiner, e);
        sendChannel.onmessage = handleReceiveMessage;
    }, [sendChannel])

    useEffect(() => {
        receiveChannel.onmessage = handleReceiveMessage;
        receiveChannel.onopen = (e) => v1Functions.handleReceiveChannelStatusChange(receiveChannel, props.user, e);
        receiveChannel.onclose = (e) => v1Functions.handleReceiveChannelStatusChange(receiveChannel, props.user, e);
        receiveChannel.onerror = (e) => v1Functions.handleReceiveChannelStatusChange(receiveChannel, props.user, e);
        receiveChannel.onclosing = (e) => v1Functions.handleReceiveChannelStatusChange(receiveChannel, props.user, e);
        if (!sentReceiveOpener) {
            if(receiveChannel.readyState === 'open') {
                var today = new Date();
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const opener = {
                    user: props.user,
                    timestamp: datetime,
                    type: 'opener'
                }
                receiveChannel.send(JSON.stringify(opener));
                setSentReceiveOpener(true);
            }
        }
        
    }, [receiveChannel])
    
    //make sure chat box stays scrolled to the bottom
    useEffect(() => {
        chat.current.scrollTop = chat.current.scrollHeight;
    }, [chatBox])

    //HTML elements
    const startButton = useRef(null);
    const inviteButton = useRef(null);
    const inviteInput = useRef(null);
    const joinInput = useRef(null);
    const joinButton = useRef(null);
    const quitButton = useRef(null);
    const sendChat = useRef(null);
    const chat = useRef(null);

    const handleQuit = (event) => {
        window.location.reload();
    }

    const handleReceiveMessage = (event) => {
        setUpdate(update => update + 1)
        var data = JSON.parse(event.data)
        switch(data.type) {
            case 'opener':
                var opener = data.timestamp + " SERVER" + ": User " + (data.user ? data.user: "GUEST") + " has connected!";
                setChatBox(prev => prev + opener);
                break;
            case 'chat':
                var chatMessage = "\n" + data.timestamp + " " + data.user + ": " + data.message;
                setChatBox(prev => prev + chatMessage);
                break;
            case 'end':
                break;
            default:
                console.log("datachannel type error")
        }
    }

    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e);
        }
    }

    // 1. Setup media sources
    const handleStart = async () => {
        setSendChannel(pc.createDataChannel("sendChannel"))

        setInviteDisable(false);
        setJoinIdDisable(false);
        setJoinDisable(false);
        setStartDisable(true);
        setQuitDisable(false);
    };

    // 2. Create an offer
    const handleInvite = async () => {
        const invite = await v1Functions.handleInvite(pc);
        setInviteInputId(invite.id);
    };
    
    // 3. Answer the call with the unique ID
    const handleJoin = async () => {
        await v1Functions.handleJoin(joiner, joinInputId, pc, setReceiveChannel)
    }; 
    
    return (
        <div className='window'>
            <h1 className='title'>Template</h1>

            <div className='chat'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={(e) => v1Functions.handleMessageChange(setMessageBox, e)} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
                    </form>
                </div>
            </div>

            <h3>1. Start Webcam</h3>
            <button ref={startButton} className='buttons' onClick={handleStart} disabled={startDisable}>Start Game</button> 
            <br/>

            <div className='createorjoin'>
                <div style={{padding: "2em"}}>
                    <h3>2. Create a new Call</h3>
                    <label>Send code to the receiver</label>
                    <br/>
                    <input ref={inviteInput} value={inviteInputId} disabled/>
                    <button ref={inviteButton} className='buttons' onClick={handleInvite} disabled={inviteDisable}>Create Call</button>
                </div>
                <div style={{padding: "2em"}}>
                    <h3>Or Join a Call</h3>
                    <label>Answer the call by pasting code below</label>
                    <br/>
                    <input ref={joinInput} value={joinInputId} onChange={(e) => v1Functions.onJoinIdInput(setJoinInputId, e)} disabled={joinIdDisable}/>
                    <button ref={joinButton} className='buttons' onClick={handleJoin} disabled={joinDisable}>Answer</button>
                </div>
            </div>

            <br/>
            <h3>3. Hangup</h3>
            <button ref={quitButton} className='buttons' disabled={quitDisable} onClick={handleQuit} >Hangup</button>
        </div>
    );
};

export default Template;
