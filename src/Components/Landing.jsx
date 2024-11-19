import { io } from "socket.io-client"
import { useState, useEffect } from "react"
import { useLocation  } from "react-router-dom";

const Landing = ({ localAudioTrack, name }) => {

 const [socket, setSocket] = useState(null);
 const [videoCam, setVideoCam] = useState(null);
 const [roomId,  setRoomId] = useState(null);
 const [connection, setConnection] = useState(false);
 const [sendingPc,setPendingPc] = useState(null);
 const [recievingPc, setRecievingPc] = useState(null);
 const [remoteVideoTrack, setRemoteVideoTrack]  = useState(null);
 const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
 const [lobby, setLobby] = useState(false);


 const location = useLocation(); 


 console.log("www");
 console.log(localAudioTrack);
 useEffect(() => {
    const socket = io('http://localhost:3000');

    setSocket(socket);

    socket.on('connect', () => {
        console.log("websocket connection");
    }) 

    socket.on('person-quit', () => {
         alert('person left the room');
         setLobby(true);
    })


    socket.on('send-offer', async (room) => {
        console.log("GOT offer !!!");
    
        try {
            const pc = new RTCPeerConnection();
            setPendingPc(pc);
    
            // Add a media track if available
           // Create a dummy audio track
const audioContext = new AudioContext();
const oscillator = audioContext.createOscillator();
const destination = audioContext.createMediaStreamDestination();

oscillator.connect(destination);
oscillator.start();

const stream = destination.stream;
const audioTrack = stream.getAudioTracks()[0];

// Add the track to the RTCPeerConnection
pc.addTrack(audioTrack, stream);

    
            // Handle ICE candidates
            pc.onicecandidate = (e) => {
                console.log("on ice candidate");
                if (e.candidate) {
                    socket.emit('ice-candidate', {
                        candidate: e.candidate,
                        roomId: room?.roomId
                    });
                }
            };
    
            // Handle negotiation
            pc.onnegotiationneeded = async () => {
                console.log('Negotiation needed');
                try {
                    const sdp = await pc.createOffer();
                    pc.setLocalDescription(sdp.sdp);
                    socket.emit('offer', {
                        sdp,
                        roomId: room?.roomId
                    });
                } catch (error) {
                    console.error("Error during negotiation:", error);
                }
            };
    
            // Create the initial offer
            const sdp = await pc.createOffer();
            await pc.setLocalDescription(sdp);
    
            // Send the offer through the signaling server
            socket.emit('offer', {
                roomId: room?.roomId, 
                sdp: sdp
            });
    
            setRoomId(room);
        } catch (error) {
            console.error("Error during offer creation:", error);
        }
    });
    

    socket.on('offer-with-sdp', async ({ roomId, sdp: remoteSdp }) => {
        alert('offer with sdp got');
        setLobby(false);
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription(remoteSdp);
        setPendingPc(() => {
            return pc;
        })
        // pc.addTrack(localAudioTrack); 
        const answerSdp = await pc.createAnswer();
        pc.setLocalDescription(answerSdp.sdp);
        socket.emit('answer', {
            roomId: roomId,
            sdp: answerSdp
        })
    })

    socket.on('lobby', () => {
        console.log("hello");
        setLobby(true);
    })

    socket.on('answer-with-sdp', ({ roomId, sdp }) => {
        alert("got answer !!!");
    })

    return () => {
        socket.disconnect();
    };

 }, []);

 console.log("lobby");
 console.log(lobby);

 if (lobby) {
    return (
        <div>
        Waiting for someone to connect to you !.
        </div>
    )
 }


  return (
    <div>
        Hi {name}
        <video width={400} height={400}/>
        <video width={400} height={400}/>    
    </div>
  )
}
 
export default Landing