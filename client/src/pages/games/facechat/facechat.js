import React, {useEffect, useRef, useState} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';

import './facechat.css';

const FaceChat = (props) => {
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

    const firebaseConfig = {
        apiKey: "AIzaSyCHcdPg44U4oWfG-BsYKv0YcF8vzX4kF1M",
        authDomain: "ittakestwo-8d2b7.firebaseapp.com",
        projectId: "ittakestwo-8d2b7",
        storageBucket: "ittakestwo-8d2b7.appspot.com",
        messagingSenderId: "335382479790",
        appId: "1:335382479790:web:bca774cf112969bd9dbe3f",
        measurementId: "G-YNY8CXEV47"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const firestore = firebase.firestore();

    
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
        sendChannel.onopen = handleSendChannelStatusChange;
        sendChannel.onclose = handleSendChannelStatusChange;
        sendChannel.onmessage = handleReceiveMessage;
    }, [sendChannel])

    useEffect(() => {
        receiveChannel.onmessage = handleReceiveMessage;
        receiveChannel.onopen = handleReceiveChannelStatusChange;
        receiveChannel.onclose = handleReceiveChannelStatusChange;
        receiveChannel.onerror = handleReceiveChannelStatusChange;
        receiveChannel.onclosing = handleReceiveChannelStatusChange;
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

    const onAnswerIdInput = (event) => {
        setAnswerInputId(event.target.value)
    }

    const handleHangup = (event) => {
        window.location.reload();
    }

    const handleSendChannelStatusChange = (event) => {
        if (sendChannel.readyState === 'open') {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: props.user,
                timestamp: datetime,
                type: 'opener'
            }
            sendChannel.send(JSON.stringify(opener));
        }
    }

    const receiveChannelCallback = (event) => {
        setReceiveChannel(event.channel);
    }

    const handleReceiveMessage = (event) => {
        var data = JSON.parse(event.data)
        switch(data.type) {
            case 'opener':
                var opener = data.timestamp + " SERVER" + ": User " + data.user + " has connected!";
                setChatBox(prev => prev + opener);
                break;
            case 'chat':
                var chatMessage = "\n" + data.timestamp + " " + data.user + ": " + data.message;
                setChatBox(prev => prev + chatMessage);
                chat.current.scrollTop = chat.current.scrollHeight;
                break;
            case 'end':
                break;
            default:
                console.log("datachannel type error")
        }
    }

    const handleReceiveChannelStatusChange = (event) => {        
        // Here you would do stuff that needs to be done
        // when the channel's status changes.
        if(receiveChannel.readyState === 'open') {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: props.user,
                timestamp: datetime,
                type: 'opener'
            }
            receiveChannel.send(JSON.stringify(opener));
        }
    }

    const handleMessageChange = (event) => {
        setMessageBox(event.target.value)
        scrollChat();
    }

    const handleChatSubmit = (event) => {
        var today = new Date();
        var datetime = moment(today).format("(M/D/YY-h:mma)");

        const chatMessage = {
            user: props.user ? props.user: "GUEST",
            timestamp: datetime,
            type: 'chat',
            message: messageBox,
        }

        if (chatMessage.message) {
            if (receiveChannel.readyState === 'open') {
                receiveChannel.send(JSON.stringify(chatMessage));
            }
            else if (sendChannel.readyState === 'open') {
                sendChannel.send(JSON.stringify(chatMessage));
            }
            
            var message = "\n" + chatMessage.timestamp + " " + chatMessage.user + ": " + chatMessage.message;
            setChatBox(prev => prev + message);
            setMessageBox("");
        }
        chat.current.scrollTop = chat.current.scrollHeight;
    }

    const onEnterPress = (e) => {
        if(e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            handleChatSubmit();
        }
        scrollChat();
    }

    const scrollChat = (e) => {
        chat.current.scrollTop = chat.current.scrollHeight;
    }

    function makeid() {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 5; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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
        var id = makeid();
        console.log(id)
        const callDoc = firestore.collection('calls').doc(id);
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        setCallInputId(callDoc.id);

        // Get candidates for caller, save to db
        pc.onicecandidate = (event) => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        // Create offer
        //{ offerToReceiveAudio: true, offerToReceiveVideo: true }
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        // Listen for remote answer
        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        answerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.addIceCandidate(candidate).catch(e => {
                    console.error(e);
                });
            }
            });
        });

    };
    
    // 3. Answer the call with the unique ID
    const handleAnswer = async () => {
        const callId = answerInputId;
        const callDoc = firestore.collection('calls').doc(callId);
        const answerCandidates = callDoc.collection('answerCandidates');
        const offerCandidates = callDoc.collection('offerCandidates');
    
        pc.onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
        };
    
        const callData = (await callDoc.get()).data();
    
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
        //{ offerToReceiveAudio: true, offerToReceiveVideo: true }
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);


        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };
    
        await callDoc.update({ answer });
    
        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data)).catch(e => {
                        console.error(e.name)
                    });
                }
            });
        });

        pc.ondatachannel = receiveChannelCallback;
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
                    <form onSubmit={handleChatSubmit} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={handleMessageChange} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={handleChatSubmit} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
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
                        <input ref={answerInput} value={answerInputId} onChange={onAnswerIdInput} disabled={answerIdDisable}/>
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
