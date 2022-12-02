import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';

//stun servers to create RTC connections from
const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
};

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

class MultiPeerFunctions {

    constructor() {
        this.access = 100    
    }

    addRTCPeer(setPcs) {
        setPcs(prevPeers => [...prevPeers, new RTCPeerConnection(servers)])
    }

    //when the lobby code is entered, set the hook
    onJoinIdInput = (setJoinInputId, event) => {
        setJoinInputId(event.target.value)
    }

    //set the host channel on callback
    hostChannelCallback = (setHostChannel, event) => {
        setHostChannel(event.channel);
    }

    //handle status changes from connections
    handleClientChannelStatusChange = (clientChannels, joiner, user, players, clients, setPcs, setChatBox, setPlayerList, event) => {
        //identify the client channel 
        var sourceChannel; 
        clientChannels.forEach((channel) => {
            if (channel.label === event.srcElement.label) {
                sourceChannel = channel
            }
        })
        
        //if client is joining send opener
        if (sourceChannel.readyState === 'open' && joiner.current === false) {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: user,
                timestamp: datetime,
                type: 'opener',
            }
            setTimeout(() => {
                sourceChannel.send(JSON.stringify(opener));
            }, 100);
        }

        //if client is joining add as peer
        if (event.type === 'open' && joiner.current === false) {
            this.addRTCPeer(setPcs)
        }

        //if connection is leaving check if host or client
        if (event.type === 'close') {
            //host leaving
            if (joiner.current === true) {
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const dcMessage = datetime + " SERVER: Host has disconnected. Please join another lobby.\n"
                setChatBox(prev => prev + dcMessage);
            }
            //client leaving 
            else {
                //identify leaver
                var leaver;
                players.current.forEach((player) => {
                    if (player.channel === sourceChannel.label) {
                        leaver = player.user
                    }
                })

                //send message to all clients that leaver left
                const message = "User " + leaver + " has disconnected!\n"
                var datetime = moment(today).format("(M/D/YY-h:mma)");
                const messageForClients = {
                    user: "SERVER",
                    timestamp: datetime,
                    type: 'chat',
                    message: message,
                }

                //send to clients
                clients.current.forEach((channel) => {
                    if (channel.readyState === 'open' && channel.label !== sourceChannel.label) {
                        channel.send(JSON.stringify(messageForClients));
                    }
                })
                
                //sent to self
                const dcMessage = datetime + " SERVER: " + message
                setChatBox(prev => prev + dcMessage);

                //adjust player list
                setPlayerList(players.current.filter(player => player.user !== leaver)); 
            }
        }
    }

    //if host channel status changes
    handleHostChannelStatusChange = (hostChannel, user, event) => {      
        //if host becomes open send opener  
        if(hostChannel.readyState === 'open') {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: user,
                timestamp: datetime,
                type: 'opener'
            }
            hostChannel.send(JSON.stringify(opener));
        }   
    }

    //when new message comes in change the box
    handleMessageChange = (setMessageBox, event) => {
        setMessageBox(event.target.value)
    }

    //handle user sending a chat message
    handleChatSubmit = (user, messageBox, hostChannel, clientChannels, setChatBox, setMessageBox, event) => {
        var today = new Date();
        var datetime = moment(today).format("(M/D/YY-h:mma)");

        const chatMessage = {
            user: user ? user: "GUEST",
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

    makeid() {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 5; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    async handleInvite(pcs, code) {
        var id = code.current === "" ? this.makeid() : code.current;
        const callDoc = firestore.collection('calls').doc(id);
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

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

        return callDoc
    }

    async handleJoin(pcs, joiner, joinInputId, setHostChannel) {
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
        pcs[0].ondatachannel = (e) => this.hostChannelCallback(setHostChannel, e);
    }
}

export default MultiPeerFunctions;
