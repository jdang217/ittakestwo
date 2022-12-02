import firebase from 'firebase/app';
import 'firebase/firestore';
import moment from 'moment';

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

class _1v1Functions {

    constructor() {
        this.access = 100    
    }

    //when the lobby code is entered, set the hook
    onJoinIdInput = (setJoinInputId, event) => {
        setJoinInputId(event.target.value)
    }

    handleReceiveChannelStatusChange = (receiveChannel, user, event) => {        
        if(receiveChannel.readyState === 'open') {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: user,
                timestamp: datetime,
                type: 'opener'
            }
            receiveChannel.send(JSON.stringify(opener));
        }
    }

    //handles the status change of the send channel
    handleSendChannelStatusChange = (user, sendChannel, joiner, event) => {
        if (sendChannel.readyState === 'open' && joiner.current === false) {
            var today = new Date();
            var datetime = moment(today).format("(M/D/YY-h:mma)");
            const opener = {
                user: user,
                timestamp: datetime,
                type: 'opener',
            }
            setTimeout(() => {
                sendChannel.send(JSON.stringify(opener));
            }, 100);
        }
    }

    receiveChannelCallback = (setReceiveChannel, event) => {
        setReceiveChannel(event.channel);
    }

    handleMessageChange = (setMessageBox, event) => {
        setMessageBox(event.target.value)
    }

    handleChatSubmit = (user, messageBox, receiveChannel, sendChannel, setChatBox, setMessageBox, event) => {
        var today = new Date();
        var datetime = moment(today).format("(M/D/YY-h:mma)");

        const chatMessage = {
            user: user ? user: "GUEST",
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

    async handleInvite(pc) {
        var id = this.makeid();
        const callDoc = firestore.collection('calls').doc(id);
        const offerCandidates = callDoc.collection('offerCandidates');
        const answerCandidates = callDoc.collection('answerCandidates');

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

        return callDoc
    }

    async handleJoin(joiner, joinInputId, pc, setReceiveChannel) {
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

        pc.ondatachannel = (e) => this.receiveChannelCallback(setReceiveChannel, e);
    }
}

export default _1v1Functions;