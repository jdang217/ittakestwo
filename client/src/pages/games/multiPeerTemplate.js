import React, {useEffect, useRef, useState} from 'react';
import { Prompt } from 'react-router'
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';

const MultiPeerTemplate = (props) => {

    const [update, setUpdate] = useState(0);
    const [playerList, setPlayerList] = useState([]);
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

    const [clientChannels, setClientChannels] = useState([]);
    const [hostChannel, setHostChannel] = useState({});
    
    const code = useRef();
    const clients = useRef();
    const players = useRef();

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

    function addRTCPeer() {
        const servers = {
            iceServers: [
              {
                urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
              },
            ],
            iceCandidatePoolSize: 10,
        };
        setPcs(prevPeers => [...prevPeers, new RTCPeerConnection(servers)])
    }
    
    const [pcs, setPcs] = useState([]);
    const peers = useRef();
    useEffect(() => {
        addRTCPeer();
    }, [])

    useEffect(() => {
        peers.current = pcs
        if (peers.current.length > 0) {
            addDataChannel()
        }
        if (peers.current.length > 1) {
            handleInvite()
        }
    }, [pcs])

    useEffect(() => {
        players.current = playerList;

        if (clients.current && joiner.current === false) {
            const infoForClients = {
                message: playerList,
                type: 'players',
            }

            clients.current.forEach((channel) => {
                if (channel.readyState === 'open') {
                    channel.send(JSON.stringify(infoForClients));
                }
            })
        }
    }, [playerList])

    useEffect(() => {
        code.current = inviteInputId;
    }, [inviteInputId])

    useEffect(() => {
        code.current = joinInputId;
    }, [joinInputId])

    useEffect(() => {
        clients.current = clientChannels
        if (clientChannels.length > 0) {
            const newestConnection = clientChannels[clientChannels.length - 1]
            newestConnection.onopen = handleClientChannelStatusChange;
            newestConnection.onclose = handleClientChannelStatusChange;
            newestConnection.onmessage = handleReceiveMessage;
        }
    }, [clientChannels])

    useEffect(() => {
        hostChannel.onmessage = handleReceiveMessage;
        hostChannel.onopen = handleHostChannelStatusChange;
        hostChannel.onclose = handleHostChannelStatusChange;
        hostChannel.onerror = handleHostChannelStatusChange;
        hostChannel.onclosing = handleHostChannelStatusChange;
        if (!sentReceiveOpener) {
            if(hostChannel.readyState === 'open') {
                var today = new Date();
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const opener = {
                    user: props.user,
                    timestamp: datetime,
                    type: 'opener'
                }
                hostChannel.send(JSON.stringify(opener));
                setSentReceiveOpener(true);
            }
        }
        
    }, [hostChannel])

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

    const onJoinIdInput = (event) => {
        setJoinInputId(event.target.value)
    }

    const handleQuit = (event) => {
        window.location.reload();
    }

    const handleClientChannelStatusChange = (event) => {
        var sourceChannel; 
        clientChannels.forEach((channel) => {
            if (channel.label === event.srcElement.label) {
                sourceChannel = channel
            }
        })
        
        if (sourceChannel.readyState === 'open' && joiner.current === false) {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: props.user,
                timestamp: datetime,
                type: 'opener',
            }
            setTimeout(() => {
                sourceChannel.send(JSON.stringify(opener));
            }, 100);
        }

        if (event.type === 'open' && joiner.current === false) {
            addRTCPeer()
        }

        if (event.type === 'close') {
            //host leaving
            console.log(event)
            if (joiner.current === true) {
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const dcMessage = datetime + " SERVER: Host has disconnected. Please join another lobby.\n"
                setChatBox(prev => prev + dcMessage);
            }
            //client leaving 
            else {
                var leaver;
                players.current.forEach((player) => {
                    if (player.channel === sourceChannel.label) {
                        leaver = player.user
                    }
                })

                const message = "User " + leaver + " has disconnected!\n"
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const messageForClients = {
                    user: "SERVER",
                    timestamp: datetime,
                    type: 'chat',
                    message: message,
                }

                clients.current.forEach((channel) => {
                    if (channel.readyState === 'open' && channel.label !== sourceChannel.label) {
                        channel.send(JSON.stringify(messageForClients));
                    }
                })
                
                const dcMessage = datetime + " SERVER: " + message
                setChatBox(prev => prev + dcMessage);

                setPlayerList(players.current.filter(player => player.user !== leaver)); 
            }
        }
    }

    const hostChannelCallback = (event) => {
        setHostChannel(event.channel);
    }

    const handleReceiveMessage = (event) => {
        console.log(event)
        setUpdate(update => update + 1)
        var data = JSON.parse(event.data)
        const sourceChannel = event.srcElement.label
        switch(data.type) {
            case 'opener':
                var opener = data.timestamp + " SERVER: User " + (data.user ? data.user: "GUEST") + " has connected!\n";
                setChatBox(prev => prev + opener);
                if (joiner.current === false) {
                    const player = {
                        user: data.user ? data.user: "GUEST",
                        channel: sourceChannel,
                    }
                    setPlayerList(prevPlayers => [...prevPlayers, player])

                    const openerForClients = {
                        user: data.user ? data.user: "GUEST",
                        timestamp: data.timestamp,
                        type: 'opener',
                    }

                    clients.current.forEach((channel) => {
                        if (channel.readyState === 'open' && channel.label !== sourceChannel) {
                            channel.send(JSON.stringify(openerForClients));
                        }
                    })
                }
                break;
            case 'chat':
                var chatMessage = data.timestamp + " " + data.user + ": " + data.message + "\n";
                setChatBox(prev => prev + chatMessage);
                if (joiner.current === false) {
                    const messageForClients = {
                        user: data.user ? data.user: "GUEST",
                        timestamp: data.timestamp,
                        type: 'chat',
                        message: data.message,
                    }
                    clients.current.forEach((channel) => {
                        if (channel.readyState === 'open' && channel.label !== sourceChannel) {
                            channel.send(JSON.stringify(messageForClients));
                        }
                    })
                }
                break;
            case 'players':
                setPlayerList(data.message)
                break;
            default:
                console.log("datachannel type error")
        }
    }

    const handleHostChannelStatusChange = (event) => {        
        // Here you would do stuff that needs to be done
        // when the channel's status changes.
        if(hostChannel.readyState === 'open') {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: props.user,
                timestamp: datetime,
                type: 'opener'
            }
            hostChannel.send(JSON.stringify(opener));
        }   
    }

    const handleMessageChange = (event) => {
        setMessageBox(event.target.value)
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
            if (hostChannel.readyState === 'open') {
                hostChannel.send(JSON.stringify(chatMessage));
            }
            else {
                clientChannels.forEach((channel) => {
                    if (channel.readyState === 'open') {
                        channel.send(JSON.stringify(chatMessage));
                    }
                })
            }
            var message = chatMessage.timestamp + " " + chatMessage.user + ": " + chatMessage.message + "\n";
            setChatBox(prev => prev + message);
            setMessageBox("");
        }
    }

    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            handleChatSubmit();
        }
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

    const addDataChannel = (e) => {
        const channelName = "clientChannel" + (peers.current.length - 1).toString()
        const dc = peers.current[peers.current.length - 1].createDataChannel(channelName)
        setClientChannels(prevClients => [...prevClients, dc])
    }

    // 1. Setup media sources
    const handleStart = async () => {
        const self = {
            user: props.user ? props.user: "GUEST",
            channel: "HOST",
        }

        setPlayerList(prevPlayers => [...prevPlayers, self])
        setInviteDisable(false);
        setJoinIdDisable(false);
        setJoinDisable(false);
        setStartDisable(true);
        setQuitDisable(false);
    };

    // 2. Create an offer
    const handleInvite = async () => {
        var id = code.current === "" ? makeid() : code.current;
        const callDoc = firestore.collection('calls').doc(id);
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        setInviteInputId(callDoc.id);
        // Get candidates for caller, save to db
        pcs[pcs.length - 1].onicecandidate = (event) => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        // Create offer
        const offerDescription = await pcs[pcs.length - 1].createOffer();
        await pcs[pcs.length - 1].setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await callDoc.set({ offer });

        // Listen for remote answer
        callDoc.onSnapshot((snapshot) => {
            const data = snapshot.data();
            if (!pcs[pcs.length - 1].currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pcs[pcs.length - 1].setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        answerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pcs[pcs.length - 1].addIceCandidate(candidate).catch(e => {
                    console.error(e);
                });
            }
            });
        });

        setInviteDisable(true)
        setJoinDisable(true)
        setJoinIdDisable(true);
    };
    
    // 3. Answer the call with the unique ID
    const handleJoin = async () => {
        joiner.current = true;
        const callId = joinInputId;
        const callDoc = firestore.collection('calls').doc(callId);
        const answerCandidates = callDoc.collection('answerCandidates');
        const offerCandidates = callDoc.collection('offerCandidates');
        pcs[0].onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
        };
        const callData = (await callDoc.get()).data();
    
        const offerDescription = callData.offer;
        await pcs[0].setRemoteDescription(new RTCSessionDescription(offerDescription));
    
        const answerDescription = await pcs[0].createAnswer();
        await pcs[0].setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };
    
        await callDoc.update({ answer });
        offerCandidates.onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    let data = change.doc.data();
                    pcs[0].addIceCandidate(new RTCIceCandidate(data)).catch(e => {
                        console.error(e.name)
                    });
                }
            });
        });
        pcs[0].ondatachannel = hostChannelCallback;

        setInviteDisable(true)
        setJoinDisable(true)
        setJoinIdDisable(true);
    }; 

    const test = async () => {
        console.log(pcs)
        console.log(pcs[0])
        console.log(clientChannels.length)
        console.log(players.current)
        console.log(playerList)
    }
    
    return (
        <div className='window'>
            <h1 className='title'>Multi Peer Template</h1>

            <h2>Num Peers: {pcs.length}</h2>

            <div className='chat'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={handleChatSubmit} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={handleMessageChange} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={handleChatSubmit} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
                    </form>
                </div>
            </div>

            <button onClick={test}>test</button>

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
                    <input ref={joinInput} value={joinInputId} onChange={onJoinIdInput} disabled={joinIdDisable}/>
                    <button ref={joinButton} className='buttons' onClick={handleJoin} disabled={joinDisable}>Answer</button>
                </div>
            </div>

            <br/>
            <h3>3. Hangup</h3>
            <button ref={quitButton} className='buttons' disabled={quitDisable} onClick={handleQuit} >Hangup</button>
        </div>
    );
};

export default MultiPeerTemplate;
