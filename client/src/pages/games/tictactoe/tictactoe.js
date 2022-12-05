import React, {useEffect, useRef, useState} from 'react';
import Square from './square';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';
import _1v1Functions from '../1v1Functions';

import "./tictactoe.css"
import { containerClasses } from '@mui/material';

const TicTacToe = (props) => {

    const v1Functions = new _1v1Functions();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXisNext] = useState(true);
    const [isX, setIsX] = useState(Math.random() < 0.5 ? true: false);
    const [update, setUpdate] = useState(0);
    const [opponent, setOpponent] = useState("")
    const [gameStarted, setGameStarted] = useState(false)
    const [rematchVote, setRematchVote] = useState(0)
    const winner = calculateWinner(board);

    const xIsNextRef = useRef(true);
    const isXRef = useRef(isX);
    const boardRef = useRef();
    const rematchVoteRef = useRef(rematchVote)

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
        if (gameStarted) {
            if ((isX && !xIsNext) || (!isX && xIsNext)) return;
            const boardCopy = [...boardRef.current];
            // If user click an occupied square or if game is won, return
            if (winner || boardCopy[i]) return;
            // Put an X or an O in the clicked square
            boardCopy[i] = isXRef.current ? "X" : "O";
            setBoard(boardCopy) 
            setXisNext(!xIsNextRef.current)
            handleTurn(i)
        }
    };

    const handleStartGame = () => {
        setGameStarted(true)
        setMarkerInfoHidden(false)
        setGameStartDisable(true)

        const start = {
            user: props.user,
            type: 'start',
            isX: isXRef.current
        }
        sendChannel.send(JSON.stringify(start));
    }

    const handleRematchClick = () => {
        setRematchVote(rematchVoteRef.current + 1)
        setRematchDisable(true)
        const data = {
            user: props.user,
            type: 'rematchVote',
        }

        if (receiveChannel.readyState === 'open') {
            receiveChannel.send(JSON.stringify(data));
        }
        else if (sendChannel.readyState === 'open') {
            sendChannel.send(JSON.stringify(data));
        }
    }

    useEffect(() => {
        boardRef.current = board;
    }, [board])

    useEffect(() => {
        xIsNextRef.current = xIsNext;
    }, [xIsNext])

    useEffect(() => {
        isXRef.current = isX
    }, [isX])

    useEffect(() => {
        if (winner != null && (winner.startsWith("Winner: ") || winner.startsWith("Tie"))) {
            setRematchDisable(false)
            setRematchVoteTotalHidden(false)
        }
    }, [winner])

    useEffect(() => {
        rematchVoteRef.current = rematchVote
        if (rematchVote == 2) {
            setBoard(Array(9).fill(null))
            setGameStartDisable(false)
            setGameStarted(false)
            setMarkerInfoHidden(true)
            setXisNext(true)
            setRematchVote(0)
            setRematchVoteTotalHidden(true)
            if (!joiner.current) {
                setIsX(Math.random() < 0.5 ? true: false)
            }
        }
    }, [rematchVote])

    const [startDisable, setStartDisable] = useState(false);
    const [inviteDisable, setInviteDisable] = useState(true);
    const [joinDisable, setJoinDisable] = useState(false);
    const [quitDisable, setQuitDisable] = useState(true);
    const [joinIdDisable, setJoinIdDisable] = useState(false);
    const [joinInputId, setJoinInputId] = useState('');
    const [inviteInputId, setInviteInputId] = useState('');

    const [gamestartDisable, setGameStartDisable] = useState(false)
    const [rematchDisable, setRematchDisable] = useState(true)

    const [markerInfoHidden, setMarkerInfoHidden] = useState(true)
    const [rematchVoteTotalHidden, setRematchVoteTotalHidden] = useState(true)

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
                break;
            case 'end':
                break;
            case 'start':
                handleReceiveStart(data)
                break;
            case 'turn':
                handleReceiveTurn(data)
                break;
            case 'rematchVote':
                handleRematchVote(data)
                break;
            default:
                console.log("datachannel type error")
        }
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

    function handleReceiveStart(data) {
        if (data.hasOwnProperty("isX")) {
            setIsX(!data.isX)
        }
        setGameStarted(true)
        setMarkerInfoHidden(false)
    }

    function handleRematchVote(data) {
        setRematchVote(rematchVoteRef.current + 1)
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

        await handleInvite()
    };

    // 2. Create an offer
    const handleInvite = async () => {
        const invite = await v1Functions.handleInvite(pc);
        setInviteInputId(invite.id);
    };
    
    // 3. Answer the call with the unique ID
    const handleJoin = async () => {
        setSendChannel(pc.createDataChannel("sendChannel"))
        setQuitDisable(false);

        await v1Functions.handleJoin(joiner, joinInputId, pc, setReceiveChannel);
    }; 

    const NoOppInfo = () => (
        <div className='info'>
            <div style={{paddingTop: "15px"}}>
                <button ref={startButton} className='buttons' onClick={handleStart} disabled={startDisable}>Open Lobby</button> 
                <h5 style={{paddingTop: "10px"}}>Invite Code</h5>
                <input ref={inviteInput} value={inviteInputId} disabled/>
            </div>
            <div style={{paddingTop: "25px"}}>
                <h5>Or Join Lobby</h5>
                <input style={{marginBottom: "5px"}} ref={joinInput} placeholder="Enter Invite Code..." value={joinInputId} onChange={(e) => v1Functions.onJoinIdInput(setJoinInputId, e)} disabled={joinIdDisable}/>
                <button ref={joinButton} className='buttons' onClick={handleJoin} disabled={joinDisable}>Join Lobby</button>
            </div>
        </div>
    );

    const WithOppInfo = () => (
        <div className='info'>
            <h5>Opponent: {opponent}</h5>
            <h5 hidden={markerInfoHidden}>Your Marker: {opponent ? (isX ? "X" : "O") : ""}</h5>
            <div>
                <button style={{marginTop: "5px"}} className='buttons' hidden={joiner.current} disabled={gamestartDisable} onClick={handleStartGame}>Start Game</button>
                <button style={{marginTop: "5px"}} className='buttons' disabled={rematchDisable} onClick={handleRematchClick}>Rematch</button>
                <span hidden={rematchVoteTotalHidden}>{rematchVote}/2</span>
                <button style={{marginTop: "5px"}} ref={quitButton} className='buttons' disabled={quitDisable} onClick={handleQuit} >Leave Lobby</button>
            </div>
        </div>
    );
    
    return (
        <div className='window'>
            <h1 className='title'>Tic Tac Toe</h1>


            <div className='game'>
                <div className='board'>
                    {board.map((square, i) => (
                    <Square key={i} value={square} onClick={() => handleClick(i)} />
                ))}
                </div>
                {opponent ? <WithOppInfo/> : <NoOppInfo/>}
            </div>

            <div>
                <h3 style={{textAlign: "center"}} hidden={markerInfoHidden}>
                    {/* please remove this ternary with something readable*/}
                    {opponent ? (winner ? winner : "Next Player: " + (xIsNext === true ? "X" : "O")) : ""}
                </h3>
            </div>

            <div className='chat'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={(e) => v1Functions.handleMessageChange(setMessageBox, e)} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={(e) => v1Functions.handleChatSubmit(props.user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, e)} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TicTacToe;
