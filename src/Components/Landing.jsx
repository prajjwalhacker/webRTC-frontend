import { io } from "socket.io-client"
import { useState, useEffect } from "react"
import { useLocation  } from "react-router-dom";

const Landing = () => {

 const [socket, setSocket] = useState(null);
 const [videoCam, setVideoCam] = useState(null);
 const [roomId,  setRoomId] = useState(null);
 const [connection, setConnection] = useState(false);

 const location = useLocation(); 
  const queryParams = new URLSearchParams(location.search); 
  const name = queryParams.get('name'); 
 
 useEffect(() => {
    const socket = io('http://localhost:3000');

    setSocket(socket);

    socket.on('connect', () => {
        console.log("websocket connection");
    })

    socket.on('send-offer', (room) => {
        alert('send offer please');
        console.log("jellllll");
        socket.emit('offer',  {
            roomId: room?.roomId, 
            sdp: "" 
        })
        setRoomId(room);
    }) 

    socket.on('offer-with-sdp', ({ roomId, sdp }) => {
        console.log("hello");
        alert("send answer please !!");
        socket.emit('answer', {
            roomId: roomId,
            sdp: ""
        })
    })

    socket.on('answer-with-sdp', ({ roomId, sdp }) => {
        alert("got answer !!!");
    })

    return () => {
        socket.disconnect();
    };

 }, []);

  return (
    <div>
        Hi {name}
        <button>
           Open Video Cam
        </button>   
    </div>
  )
}
 
export default Landing