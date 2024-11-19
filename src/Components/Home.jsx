import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import Landing from "./Landing";

const Home = () => {
  
  const [name, setName] = useState('');
  const [localVideoTrack, setLocalVideoTrack]  = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const audioRef= useRef(null);

  const getCan = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: true
     })
    const videoTracks = stream.getVideoTracks()[0];
    const audioTracks = stream.getAudioTracks()[0];

    console.log("autdioTrackss");
    console.log(audioTracks);

    setLocalAudioTrack(audioTracks);
    setLocalVideoTrack(videoTracks);
    if (!audioRef.current) {
        return;
    }
    audioRef.current.srcObject = new MediaStream([audioTracks]);
  }

  useEffect(() => {
     getCan();
  }, [])

  return (
    <div>
        Home
        <audio ref={audioRef} controls autoPlay>
        </audio>
        <input type ='text' value={name} onChange={(e) => {
           setName(e.target.value);
        }}/>   
        <Landing localAudioTrack={localAudioTrack} name={name}/>
    </div>
  )
}

export default Home