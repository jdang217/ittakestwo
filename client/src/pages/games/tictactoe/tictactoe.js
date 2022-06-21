import React, {useEffect, useRef, useState} from 'react';
import Square from './square';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';

import "./tictactoe.css"

const TicTacToe = (props) => {

    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = useState(true);
    const [isX, setIsX] = useState(Math.random() < 0.5 ? true: false);
    const [update, setUpdate] = useState(0);
    const [opponent, setOpponent] = useState("")
    const winner = calculateWinner(board);

    const xIsNextRef = useRef(true);
    const isXRef = useRef(isX);
    const boardRef = useRef();

    const joiner = useRef(false);

    //boardRef.current = board

    function calculateWinner(squares) {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return "Winner: " + squares[a];
            }
        }
        if (squares[0] && squares[1] && squares[2] && squares[3] && squares[4] &&
            squares[5] && squares[6] && squares[7] && squares[8]) {
            return "Tie"
        }

        return null;
    }

    const handleClick = (i) => {
        if ((isX && !xIsNext) || (!isX && xIsNext)) return;
        const boardCopy = [...boardRef.current];
        // If user click an occupied square or if game is won, return
        if (winner || boardCopy[i]) return;
        // Put an X or an O in the clicked square
        boardCopy[i] = isXRef.current ? "X" : "O";
        setBoard(boardCopy) 
        setXisNext(!xIsNextRef.current)
        handleTurn(i)
    };

    useEffect(() => {
        boardRef.current = board;
    }, [board])

    useEffect(() => {
        xIsNextRef.current = xIsNext;
    }, [xIsNext])

    useEffect(() => {
        isXRef.current = isX
    }, [isX])

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
                console.log("receffect")
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

    const handleSendChannelStatusChange = (event) => {
        console.log(sendChannel.readyState, receiveChannel.readyState)
        if (sendChannel.readyState === 'open' && joiner.current === false) {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: props.user,
                timestamp: datetime,
                type: 'opener',
                isX: isX,
            }
            console.log("sending")
            setTimeout(() => {
                sendChannel.send(JSON.stringify(opener));
                console.log("sent")
            }, 100);
        }
    }

    const receiveChannelCallback = (event) => {
        setReceiveChannel(event.channel);
    }

    const handleReceiveMessage = (event) => {
        setUpdate(update => update + 1)
        var data = JSON.parse(event.data)
        console.log(data)
        switch(data.type) {
            case 'opener':
                const opp = data.user ? data.user: "GUEST"
                var opener = data.timestamp + " SERVER" + ": User " + opp + " has connected!";
                setOpponent(opp)
                setChatBox(prev => prev + opener);
                if (data.hasOwnProperty("isX")) {
                    setIsX(!data.isX)
                }
                break;
            case 'chat':
                var chatMessage = "\n" + data.timestamp + " " + data.user + ": " + data.message;
                setChatBox(prev => prev + chatMessage);
                chat.current.scrollTop = chat.current.scrollHeight;
                break;
            case 'end':
                break;
            case 'turn':
                handleReceiveTurn(data)
                break;
            default:
                console.log("datachannel type error")
        }
    }

    const handleReceiveChannelStatusChange = (event) => {        
        // Here you would do stuff that needs to be done
        // when the channel's status changes.
        console.log("rec", receiveChannel.readyState)
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
                console.log("send to rec")
                receiveChannel.send(JSON.stringify(chatMessage));
            }
            else if (sendChannel.readyState === 'open') {
                console.log("send to send")
                sendChannel.send(JSON.stringify(chatMessage));
            }
            
            var message = "\n" + chatMessage.timestamp + " " + chatMessage.user + ": " + chatMessage.message;
            setChatBox(prev => prev + message);
            setMessageBox("");
        }
        chat.current.scrollTop = chat.current.scrollHeight;
    }

    function handleTurn(square) {
        const turn = {
            user: props.user ? props.user: "GUEST",
            type: 'turn',
            move: square
        }

        if (receiveChannel.readyState === 'open') {
            receiveChannel.send(JSON.stringify(turn));
        }
        else if (sendChannel.readyState === 'open') {
            sendChannel.send(JSON.stringify(turn));
        }
    }

    function handleReceiveTurn(turnData) {
        const boardCopy = [...boardRef.current];
        boardCopy[turnData.move] = isXRef.current ? "O" : "X";
        setBoard(boardCopy);
        setXisNext(!xIsNextRef.current);
    }

    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
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
        var id = makeid();
        const callDoc = firestore.collection('calls').doc(id);
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

        setInviteInputId(callDoc.id);

        // Get candidates for caller, save to db
        pc.onicecandidate = (event) => {
            event.candidate && offerCandidates.add(event.candidate.toJSON());
        };

        // Create offer
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
    const handleJoin = async () => {
        joiner.current = true;
        const callId = joinInputId;
        const callDoc = firestore.collection('calls').doc(callId);
        const answerCandidates = callDoc.collection('answerCandidates');
        const offerCandidates = callDoc.collection('offerCandidates');
    
        pc.onicecandidate = (event) => {
            event.candidate && answerCandidates.add(event.candidate.toJSON());
        };
    
        const callData = (await callDoc.get()).data();
    
        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
    
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
            <h1 className='title'>Tic Tac Toe</h1>


            <div className='game'>
                <div className='board'>
                    {board.map((square, i) => (
                    <Square key={i} value={square} onClick={() => handleClick(i)} />
                ))}
                </div>
                <div className='info'>
                    <h5>Opponent: {opponent}</h5>
                    <h5>Your Marker: {opponent ? (isX ? "X" : "O") : ""}</h5>
                </div>
            </div>

            <div>
                <h3 style={{textAlign: "center"}}>
                    {/* please remove this ternary with something readable*/}
                    {opponent ? (winner ? winner : "Next Player: " + (xIsNext === true ? "X" : "O")) : ""}
                </h3>
            </div>

            <div className='chat'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={handleChatSubmit} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={handleMessageChange} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={handleChatSubmit} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
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

export default TicTacToe;
