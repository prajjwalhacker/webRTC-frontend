import { io } from "socket.io-client"
import { useState, useEffect, useRef } from "react"
import { useLocation  } from "react-router-dom";

const Landing = ({ localAudioTrack, name }) => {

 const [socket, setSocket] = useState(null);
 const [videoCam, setVideoCam] = useState(null);
 const [roomId,  setRoomId] = useState(null);
 const [connection, setConnection] = useState(false);
 const [sendingPc,setPendingPc] = useState(null);
 const [remoteVideoTrack, setRemoteVideoTrack]  = useState(null);
 const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
 const [lobby, setLobby] = useState(false);
 const [recievingPc, setReceivingPc] = useState(null);
 const [remoteMediaStream,setRemoteMediaStream] = useState(null);
 const [localAudioRef, setLocalAudioRef] = useState(null);

 const remoteAudioRef = useRef({});


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

            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }

    
            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
    
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
        console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            // trickle ice 
            setReceivingPc(pc);
            window.pcr = pc;
            pc.ontrack = (e) => {
                alert("ontrack");
                console.error("inside ontrack");
                const {track, type} = e;
                if (type == 'audio') {
                    remoteAudioRef.current.srcObject.addTrack(track)
                }
                remoteAudioRef.current.play();
            }

            pc.onicecandidate = async (e) => {
                console.log("onicecandidate");
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                   socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                console.log("pc.getTransceivers");
                console.log(pc.getTransceivers())
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                if (!track1 || !track2) {
                   return;
                }
                console.log(track1);
                setRemoteAudioTrack(track1)
                setRemoteVideoTrack(track2)
                //@ts-ignore
                remoteAudioRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteAudioRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteAudioRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 5000)
    })

    socket.on("answer-with-sdp", ({roomId, sdp: remoteSdp}) => {
        setLobby(false);
        setPendingPc(pc => {
            pc?.setRemoteDescription(remoteSdp)
            return pc;
        });
        console.log("loop closed");
    })

    socket.on("add-ice-candidate", ({candidate, type}) => {
        console.log("add ice candidate from remote");
        console.log({candidate, type})
        if (type == "sender") {
            setReceivingPc(pc => {
                if (!pc) {
                    console.error("receicng pc nout found")
                } else {
                    console.error(pc.ontrack)
                }
                pc?.addIceCandidate(candidate)
                return pc;
            });
        } else {
            setPendingPc(pc => {
                if (!pc) {
                    console.error("sending pc nout found")
                } else {
                    // console.error(pc.ontrack)
                }
                pc?.addIceCandidate(candidate)
                return pc;
            });
        }
    })

    socket.on('lobby', () => {
        console.log("hello");
        setLobby(true);
    })

    return () => {
        socket.disconnect();
    };

 }, []);


 useEffect(() => {
    if (localAudioRef?.current) {
        if (localAudioRef) {
            localAudioRef.current.srcObject = new MediaStream([localAudioTrack]);
            localAudioRef.current.play();
        }
    }
}, [localAudioRef])

 console.log("recievingPc");
 console.log(recievingPc);


 console.log("pendinPc");
 console.log(sendingPc);

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
        <audio ref={localAudioRef} autoPlay controls/> 
        <audio ref={remoteAudioRef} autoPlay controls/> 
    </div>
  )
}
 
export default Landing