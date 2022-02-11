import React, {useEffect, useRef, useState} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';

import './facechat.css';

const FaceChat = () => {
    const [webcamDisable, setWebcamDisable] = useState(false);
    const [callDisable, setCallDisable] = useState(true);
    const [answerDisable, setAnswerDisable] = useState(true);
    const [hangDisable, setHangDisable] = useState(true);
    const [answerIdDisable, setAnswerIdDisable] = useState(true);
    const [answerInputId, setAnswerInputId] = useState('');
    const [callInputId, setCallInputId] = useState('');


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

    const onAnswerIdInput = (event) => {
        setAnswerInputId(event.target.value)
    }

    const handleHangup = (event) => {
        window.location.reload();
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
    
        /* callButton.current.disabled = false;
        answerButton.current.disabled = false;
        webcamButton.current.disabled = true; */
        setCallDisable(false);
        setAnswerIdDisable(false);
        setAnswerDisable(false);
        setWebcamDisable(true);
        setHangDisable(false);
    };

    // 2. Create an offer
    const handleCall = async () => {
        const callDoc = firestore.collection('calls').doc();
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
                console.log(change);
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pc.addIceCandidate(new RTCIceCandidate(data)).catch(e => {
                        console.error(e.name)
                    });
                }
            });
        });
    }; 

    return (
        <div className='window'>   
            <h1 className='title'>FaceChat</h1>

            <div className="videos">
                <span>
                    <h3 style={{textAlign: 'center'}}>Local Stream</h3>
                    <video ref={webcamVideo} autoPlay='true' muted playsInline></video> 
                </span>
                <span>
                    <h3 style={{textAlign: 'center'}}>Remote Stream</h3>
                    <video ref={remoteVideo} autoPlay='true' playsInline></video>
                </span>
            </div>

            <div className='instructions'>
                <h2>1. Start Webcam</h2>
                <button ref={webcamButton} className='buttons' onClick={handleWebcam} disabled={webcamDisable}>Start webcam</button> 
                <br/>

                <div className='createorjoin'>
                    <div style={{padding: "2em"}}>
                        <h2>2. Create a new Call</h2>
                        <label>Send code to the reciever</label>
                        <br/>
                        <input ref={callInput} value={callInputId} disabled/>
                        <button ref={callButton} className='buttons' onClick={handleCall} disabled={callDisable}>Create Call (offer)</button>
                    </div>
                    <div style={{padding: "2em"}}>
                        <h2>3. Join a Call</h2>
                        <label>Answer the call by pasting code below</label>
                        <br/>
                        <input ref={answerInput} value={answerInputId} onChange={onAnswerIdInput} disabled={answerIdDisable}/>
                        <button ref={answerButton} className='buttons' onClick={handleAnswer} disabled={answerDisable}>Answer</button>
                    </div>
                </div>

                <br/>
                <h2>4. Hangup</h2>
                <button ref={hangupButton} className='buttons' disabled={hangDisable} onClick={handleHangup} >Hangup</button>
            </div>
        </div>
    );
};

export default FaceChat;
