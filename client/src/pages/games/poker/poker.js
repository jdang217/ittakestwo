import React, {useEffect, useRef, useState} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';
import './poker.css';
import { burnAndTurn, createDeck, dealCards, performflop, shuffleDeck } from './gameLogic'; 
import Card from './card';
import MultiPeerFunctions from '../multiPeerFunctions';


const Poker = (props) => {

    const multiPeerFunctions = new MultiPeerFunctions();

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
    const [inLobby, setInLobby] = useState(false);
    
    const code = useRef();
    const clients = useRef();
    const players = useRef();
    const chatBoxRef = useRef() //chatbox history
    
    const [pcs, setPcs] = useState([]);
    const peers = useRef();
    useEffect(() => {
        multiPeerFunctions.addRTCPeer(setPcs)
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
            newestConnection.onopen = (e) => multiPeerFunctions.handleClientChannelStatusChange(clientChannels, joiner, props.user, players, clients, setPcs, setChatBox, chatBoxRef, setPlayerList, e);
            newestConnection.onclose = (e) => multiPeerFunctions.handleClientChannelStatusChange(clientChannels, joiner, props.user, players, clients, setPcs, setChatBox, chatBoxRef, setPlayerList, e);
            newestConnection.onmessage = handleReceiveMessage;
        }
    }, [clientChannels])

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

    const handleQuit = (event) => {
        window.location.reload();
    }

    const handleReceiveMessage = (event) => {
        var data = JSON.parse(event.data)
        const sourceChannel = event.srcElement.label
        switch(String(data.type)) {
            case 'opener':
                multiPeerFunctions.handleReceiveOpener(data, setChatBox, chatBoxRef, joiner, sourceChannel, setPlayerList, clients)
                if (!joiner.current) {
                    //give new player their poker position
                    const newestConnection = clientChannels[clientChannels.length - 1]
                    if (newestConnection.readyState === 'open') {
                        const position = {
                            type: 'position',
                            position: clientChannels.length
                        }
                        newestConnection.send(JSON.stringify(position));
                    }
                }
                setInLobby(true)
                break;
            case 'chat':
                multiPeerFunctions.handleReceiveChat(data, setChatBox, chatBoxRef, joiner, clients, sourceChannel)
                break;
            case 'players':
                setPlayerList(data.message)
                break;
            case 'hand':
                setHand(data.cards)
                break;
            case 'board':
                setBoard(data.board)
                break
            case 'bet':
                setBet(data.bet)
                break
            case 'position':
                setPosition(data.position)
                break
            default:
                console.log("datachannel type error: " + data.type)
        }
    }

    const onEnterPress = (e) => {
        if(e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            multiPeerFunctions.handleChatSubmit(props.user, messageBox, hostChannel, clientChannels, setChatBox, chatBoxRef, setMessageBox, e);
        }
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

    const [deck, setDeck] = useState([]);
    const [shuffledDeck, setShuffledDeck] = useState([]);
    const [board, setBoard] = useState([]);
    const [round, setRound] = useState(0);
    const [dealtCards, setDealtCards] = useState([]);
    const [hand, setHand] = useState([]);
    const [position, setPosition] = useState(0)

    const [pot, setPot] = useState(0)
    const [overallBet, setOverallBet] = useState(0)
    const [bet, setBet] = useState(0)
    const [betInput, setBetInput] = useState(0)
    const [stack, setStack] = useState(0)

    const shuffledDeckRef = useRef()
    const roundRef = useRef()
    const boardRef = useRef()
    const dealtCardsRef = useRef()
    const handRef = useRef()

    useEffect(() => {
        setShuffledDeck(shuffleDeck(deck))
    }, [deck])

    useEffect(() => {
        shuffledDeckRef.current = shuffledDeck
    }, [shuffledDeck])

    useEffect(() => {
        boardRef.current = board

        const boardObj = {
            type: 'board',
            board: board === undefined ? [] : board
        }
        clients.current.forEach((channel) => {
            if (channel.readyState === 'open') {
                channel.send(JSON.stringify(boardObj));
            }
        })
    }, [board])

    useEffect(() => {
        roundRef.current = round
    }, [round])

    useEffect(() => {
        dealtCardsRef.current = dealtCards
    }, [dealtCards])

    useEffect(() => {
        handRef.current = hand
    }, [hand])

    const test = async () => {
        console.log(playerList)
        console.log(deck)
        console.log(shuffledDeck)
        console.log(board)
        console.log(hand)
        console.log(position)
        setDeck(createDeck())
    }

    const deal = async () => {
        var dealtCards = dealCards(shuffledDeckRef.current, players.current)

        const numPlayers = dealtCards.length / 2

        for (var i = 0; i < numPlayers; i++) {
            const cards = [dealtCards[i], dealtCards[i + numPlayers]]
            const channel = dealtCards[i].player

            if (channel === "HOST") {
                setHand(cards)
            }
            else {
                const playerCards = {
                    type: 'hand',
                    cards: cards
                }

                clientChannels.forEach((channel) => {
                    if (channel.label === dealtCards[i].player) {
                        channel.send(JSON.stringify(playerCards));
                    }
                })
            }
        }

        setDealtCards(dealtCards);
    }

    const performRound = () => {
        //preflop
        if (roundRef.current === 0) {
            //get preflop bets
            setRound(roundRef.current += 1)
        }
        //flop
        else if (roundRef.current === 1) {
            flop()
            setRound(roundRef.current += 1)
        }
        //turn
        else if (roundRef.current === 2) {
            turn()
            setRound(roundRef.current += 1)
        }
        //river
        else if (roundRef.current === 3) {
            river()
            setRound(roundRef.current += 1)
        }
        //showdown
        else if (roundRef.current === 4) {
            setRound(roundRef.current += 1)
        }
        //reset everything
        else {
            reset()
        }
    }

    const flop = () => {
        var flop = performflop(shuffledDeckRef.current)
        setBoard(flop)
    }

    const turn = () => {
        var burnAndTurnResult = burnAndTurn(shuffledDeckRef.current)
        setBoard(prevBoard => [...prevBoard, burnAndTurnResult])
    }

    const river = () => {
        var burnAndTurnResult = burnAndTurn(shuffledDeckRef.current)
        setBoard(prevBoard => [...prevBoard, burnAndTurnResult])
    }

    function newBet() {

    }

    const submitBet = () => {
        if (overallBet < betInput) {
            setOverallBet(betInput)
            setBet(betInput)
            setBetInput(0)
        }
        //not enough
        else if (overallBet > betInput) {
            
        }
    }

    const reset = async () => {
        setShuffledDeck(shuffleDeck(deck))
        setBoard([])
        setRound(0)
        setDealtCards([])
        setHand([])
        const playerCards = {
            type: 'hand',
            cards: []
        }

        clients.current.forEach((channel) => {
            if (channel.readyState === 'open') {
                channel.send(JSON.stringify(playerCards));
            }
        })
    }

    const playerElements = playerList.slice(1).map((player, index) => (
        <div className={`player player${index + 2}`} key={index}>
            <div className={`bet bet${index + 2}`}>
                $10
            </div>
        </div>
      ));
    
    return (
        <div className='window'>
            <h1 className='title'>Poker</h1>

            <div className='tableContainer'>
                <img className='table' src={require('./images/pokertable.png')}/>
                <div className='pokerboard'>
                    {board.map((card) => (
                        <Card value={card.value} suit={card.suit}/>
                    ))}
                </div>
                <div className='bet bet1' hidden={bet !== 0}>
                    ${bet}
                </div>
                <div className='hand'>
                    {hand.map((card) => (
                        <Card value={card.card.value} suit={card.card.suit}/>
                    ))}
                </div>
                {playerElements}
            </div>

            <div className='actions'>
                <button>Check</button>
                <button>Fold</button>
                <input type='number' value={betInput == 0 ? "" : betInput} onChange={(e) => setBetInput(e.target.value)}></input>
                <button onClick={submitBet}>Bet</button>
            </div>

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
            <button onClick={deal}>Deal Cards</button>
            <button onClick={performRound}>Next Round</button>
            <button onClick={reset}>Reset</button>

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

export default Poker;
