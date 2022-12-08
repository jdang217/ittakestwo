import React, {useEffect, useRef, useState} from 'react';
import 'firebase/firestore';
import moment from 'moment';
import MultiPeerFunctions from '../multiPeerFunctions';
import { createDeck, shuffleDeck } from './gameLogic';
import './one.css'

const One = (props) => {

    const multiPeerFunctions = new MultiPeerFunctions();

    const [playerList, setPlayerList] = useState([]);

    const joiner = useRef(false);   //is current client a joiner or host

    //is component disabled hooks
    const [startDisable, setStartDisable] = useState(false);
    const [inviteDisable, setInviteDisable] = useState(true);
    const [joinDisable, setJoinDisable] = useState(false);
    const [quitDisable, setQuitDisable] = useState(true);
    const [joinIdDisable, setJoinIdDisable] = useState(false);

    //textbox to enter lobby code
    const [joinInputId, setJoinInputId] = useState('');
    const [inviteInputId, setInviteInputId] = useState('');

    //if opener has been sent on first connect
    const [sentReceiveOpener, setSentReceiveOpener] = useState(false);

    const [messageBox, setMessageBox] = useState('');
    const [chatBox, setChatBox] = useState('');

    //host channel and array of client channels
    const [clientChannels, setClientChannels] = useState([]);
    const [hostChannel, setHostChannel] = useState({});
    const [inLobby, setInLobby] = useState(false);
    
    const code = useRef();      //lobby code
    const clients = useRef();   //client channel reference
    const players = useRef();   //players reference
    const chatBoxRef = useRef() //chatbox history
    
    const [pcs, setPcs] = useState([]); //peer connections
    const peers = useRef();

    //on start add self as peer
    useEffect(() => {
       multiPeerFunctions.addRTCPeer(setPcs);
       setDeck(createDeck())
    }, [])

    //on peer connection added, add data channel and handle the connection
    useEffect(() => {
        peers.current = pcs
        if (peers.current.length > 0) {
            addDataChannel()
        }
        if (peers.current.length > 1) {
            handleInvite()
        }
    }, [pcs])

    //when player list changes, 
    useEffect(() => {
        players.current = playerList;

        //if there are clients and current connection is the hostm send info to clients
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

    //set the lobby code reference when code changes for the host
    useEffect(() => {
        code.current = inviteInputId;
    }, [inviteInputId])

    //set the lobby code reference when code changes for joiners
    useEffect(() => {
        code.current = joinInputId;
    }, [joinInputId])

    //when client channel added, add event handlers to the connection
    useEffect(() => {
        clients.current = clientChannels
        if (clientChannels.length > 0) {
            const newestConnection = clientChannels[clientChannels.length - 1]
            newestConnection.onopen = (e) => multiPeerFunctions.handleClientChannelStatusChange(clientChannels, joiner, props.user, players, clients, setPcs, setChatBox, chatBoxRef, setPlayerList, e);
            newestConnection.onclose = (e) => multiPeerFunctions.handleClientChannelStatusChange(clientChannels, joiner, props.user, players, clients, setPcs, setChatBox, chatBoxRef, setPlayerList, e);
            newestConnection.onmessage = handleReceiveMessage;
        }
    }, [clientChannels])

    //when host channel added, add event handlers to the connection
    useEffect(() => {
        hostChannel.onmessage = handleReceiveMessage;
        hostChannel.onopen = (e) => multiPeerFunctions.handleHostChannelStatusChange(hostChannel, props.user, e);
        hostChannel.onclose = (e) => multiPeerFunctions.handleHostChannelStatusChange(hostChannel, props.user, e);
        hostChannel.onerror = (e) => multiPeerFunctions.handleHostChannelStatusChange(hostChannel, props.user, e);
        hostChannel.onclosing = (e) => multiPeerFunctions.handleHostChannelStatusChange(hostChannel, props.user, e);
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

    //make sure chat box stays scrolled to the bottom
    useEffect(() => {
        chat.current.scrollTop = chat.current.scrollHeight;
        chatBoxRef.current = chatBox
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

    //handle user leaving the window
    const handleQuit = (event) => {
        window.location.reload();
    }

    //handle recieving mesages from clients
    const handleReceiveMessage = (event) => {
        var data = JSON.parse(event.data)
        const sourceChannel = event.srcElement.label
        switch(data.type) {
            case 'opener':
                multiPeerFunctions.handleReceiveOpener(data, setChatBox, chatBoxRef, joiner, sourceChannel, setPlayerList, clients)
                setInLobby(true)
                break;
            case 'chat':
                multiPeerFunctions.handleReceiveChat(data, setChatBox, chatBoxRef, joiner, clients, sourceChannel)
                break;
            case 'players':
                setPlayerList(data.message)
                break;
            default:
                console.log("datachannel type error")
        }
    }

    //make enter key submit instead of going to new line
    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            multiPeerFunctions.handleChatSubmit(props.user, messageBox, hostChannel, clientChannels, setChatBox, chatBoxRef, setMessageBox, e);
        }
    }

    //add a data channel for each client
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

        await handleInvite()
    };

    // 2. Create an offer
    const handleInvite = async () => {
        const invite = await multiPeerFunctions.handleInvite(pcs, code);
        setInviteInputId(invite.id);

        setInviteDisable(true)
        setJoinDisable(true)
        setJoinIdDisable(true);
    };
    
    // 3. Answer the call with the unique ID
    const handleJoin = async () => {
        await multiPeerFunctions.handleJoin(pcs, joiner, joinInputId, setHostChannel);
        setInLobby(true)
        setInviteDisable(true)
        setJoinDisable(true)
        setJoinIdDisable(true);
        setQuitDisable(false);
    }; 

    const test = async () => {
        console.log(pcs)
        console.log(pcs[0])
        console.log(clientChannels.length)
        console.log(players.current)
        console.log(playerList)

        console.log(multiPeerFunctions.access)
    }

    const [deck, setDeck] = useState()
    const [discardPile, setDiscardPile] = useState()
    const [currentPlayer, setCurrentPlayer] = useState()
    const [nextPlayer, setNextPlayer] = useState()
    const [currentCard, setCurrentCard] = useState()
    const [gameStarted, setGameStarted] = useState()

    const [hand, setHand] = useState()

    const [gameStartDisable, setGameStartDisable] = useState()

    useEffect(() => {
        console.log(deck)
    }, [deck])

    const handleStartGame = () => {
        setGameStarted(true)
        setGameStartDisable(true)
    }
    
    const NoOppInfo = () => (
        <div className='info'>
            <div style={{paddingTop: "15px"}}>
                <button ref={startButton} className='buttons' onClick={handleStart} disabled={startDisable}>Open Lobby</button> 
                <h5 style={{paddingTop: "10px"}}>Invite Code</h5>
                <input ref={inviteInput} value={inviteInputId} disabled/>
            </div>
            <div style={{paddingTop: "25px"}}>
                <h5>Or Join Lobby</h5>
                <input style={{marginBottom: "5px"}} ref={joinInput} placeholder="Enter Invite Code..." value={joinInputId} onChange={(e) => multiPeerFunctions.onJoinIdInput(setJoinInputId, e)} disabled={joinIdDisable}/>
                <button ref={joinButton} className='buttons' onClick={handleJoin} disabled={joinDisable}>Join Lobby</button>
            </div>
        </div>
    );

    const WithOppInfo = () => (
        <div className='info'>
            <div>
                <button style={{marginTop: "5px"}} className='buttons' hidden={joiner.current} disabled={gameStartDisable} onClick={handleStartGame}>Start Game</button>
                <button style={{marginTop: "5px"}} ref={quitButton} className='buttons' disabled={quitDisable} onClick={handleQuit} >Leave Lobby</button>
            </div>
        </div>
    );

    return (
        <div className='window'>
            <h1 className='title'>One</h1>

            <div className='onegame'>
                <div className='oneboard'>
                    hello
                </div>
                {inLobby ? <WithOppInfo/> : <NoOppInfo/>}
            </div>

            <h2>Num Peers: {pcs.length}</h2>

            <div className='chat'>
                <textarea ref={chat} name='chatBox' className='chatBox' type="text" placeholder='Waiting for connection...' value={chatBox} disabled></textarea>
                <div>
                    <form onSubmit={(e) => multiPeerFunctions.handleChatSubmit(props.user, messageBox, hostChannel, clientChannels, setChatBox, chatBoxRef, setMessageBox, e)} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <textarea ref={sendChat} name='sendChat' className='sendChat' type="text" placeholder='Enter message' value={messageBox} onChange={(e) => multiPeerFunctions.handleMessageChange(setMessageBox, e)} onKeyDown={onEnterPress}></textarea>
                        
                        <input type="button" value="Submit" onClick={(e) => multiPeerFunctions.handleChatSubmit(props.user, messageBox, hostChannel, clientChannels, setChatBox, chatBoxRef, setMessageBox, e)} style={{height: '2em', maxHeight: '2em', fontSize: '16px', width: '4rem'}}/>
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
                    <input ref={joinInput} value={joinInputId} onChange={(e) => multiPeerFunctions.onJoinIdInput(setJoinInputId, e)} disabled={joinIdDisable}/>
                    <button ref={joinButton} className='buttons' onClick={handleJoin} disabled={joinDisable}>Answer</button>
                </div>
            </div>

            <br/>
            <h3>3. Hangup</h3>
            <button ref={quitButton} className='buttons' disabled={quitDisable} onClick={handleQuit} >Hangup</button>
        </div>
    );
};

export default One;
