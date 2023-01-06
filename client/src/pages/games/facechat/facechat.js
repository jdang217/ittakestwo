import React, {useEffect, useRef, useState} from 'react';
import 'firebase/firestore';
import moment from 'moment';
import _1v1Functions from '../1v1Functions';

import './facechat.css';

const FaceChat = (props) => {

    const v1Functions = new _1v1Functions();

    const joiner = useRef(false);
    const [webcamDisable, setWebcamDisable] = useState(false);
    const [callDisable, setCallDisable] = useState(true);
    const [answerDisable, setAnswerDisable] = useState(true);
    const [hangDisable, setHangDisable] = useState(true);
    const [answerIdDisable, setAnswerIdDisable] = useState(true);
    const [answerInputId, setAnswerInputId] = useState('');
    const [callInputId, setCallInputId] = useState('');

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
    
    
    let localStream = null; //curr webcam
    let remoteStream = null; //other webcam

    //HTML elements
    const webcamButton = useRef(null);
    const webcamVideo = useRef(null);
    const remoteVideo = useRef(null);
    const callButton = useRef(null);
    const callInput = useRef(null);
    const answerInput = useRef(null);
    const answerButton = useRef(null);
    const hangupButton = useRef(null);
    const sendChat = useRef(null);
    const chat = useRef(null);

    const handleHangup = (event) => {
        window.location.reload();
    }

    const handleReceiveMessage = (event) => {
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
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e);
        }
    }

    // 1. Setup media sources
    const handleWebcam = async () => {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        remoteStream = new MediaStream();

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Pull tracks from remote stream, add to video stream
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
            });
        };
        webcamVideo.current.srcObject = localStream;
        remoteVideo.current.srcObject = remoteStream;

        setSendChannel(pc.createDataChannel("sendChannel"))

        setCallDisable(false);
        setAnswerIdDisable(false);
        setAnswerDisable(false);
        setWebcamDisable(true);
        setHangDisable(false);
    };

    // 2. Create an offer
    const handleCall = async () => {
        const invite = await v1Functions.handleInvite(pc)
        setCallInputId(invite.id);
    };
    
    // 3. Answer the call with the unique ID
    const handleAnswer = async () => {
        await v1Functions.handleJoin(joiner, answerInputId, pc, setReceiveChannel)
    }; 

    return (
        <div className='window'>   
            <h1 className='title'>FaceChat</h1>

            <div className="videos">
                <span>
                    <video ref={webcamVideo} autoPlay='true' muted playsInline></video> 
                </span>
                <span>
                    <video ref={remoteVideo} autoPlay='true' playsInline></video>
                </span>
            </div>

            <div className='instructions'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={(e) => v1Functions.handleMessageChange(setMessageBox, e)} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
                    </form>
                </div>
                <h3>1. Start Webcam</h3>
                <button ref={webcamButton} className='buttons' onClick={handleWebcam} disabled={webcamDisable}>Start webcam</button> 
                <br/>

                <div className='createorjoin'>
                    <div style={{padding: "2em"}}>
                        <h3>2. Create a new Call</h3>
                        <label>Send code to the receiver</label>
                        <br/>
                        <input ref={callInput} value={callInputId} disabled/>
                        <button ref={callButton} className='buttons' onClick={handleCall} disabled={callDisable}>Create Call</button>
                    </div>
                    <div style={{padding: "2em"}}>
                        <h3>Or Join a Call</h3>
                        <label>Answer the call by pasting code below</label>
                        <br/>
                        <input ref={answerInput} value={answerInputId} onChange={(e) => v1Functions.onJoinIdInput(setAnswerInputId, e)} disabled={answerIdDisable}/>
                        <button ref={answerButton} className='buttons' onClick={handleAnswer} disabled={answerDisable}>Answer</button>
                    </div>
                </div>

                <br/>
                <h3>3. Hangup</h3>
                <button ref={hangupButton} className='buttons' disabled={hangDisable} onClick={handleHangup} >Hangup</button>
            </div>
        </div>
    );
};

export default FaceChat;
