import { useEffect, useRef, useState } from "react"
import Landing from "./Landing";

const Home = () => {
  
  const [name, setName] = useState('');
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const audioRef= useRef(null);
  const [joined, setJoined] = useState(false);

  const getCan = async () => {

    const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: true
     })
    const audioTracks = stream.getAudioTracks()[0];

    setLocalAudioTrack(audioTracks);
    if (!audioRef.current) {
        return;
    }
    audioRef.current.srcObject = new MediaStream([audioTracks]);
  }



  useEffect(() => {
    if (audioRef && audioRef.current) getCan();
  }, [audioRef])

  if (!joined) {
    return (
        <div>
             <input type="text" onChange={(e) => {
                setName(e.target.value);
            }}>
            </input>
            <button onClick={() => {
                setJoined(true);
            }}>Join</button>
        </div>
    )
  }

  return <Landing localAudioTrack={localAudioTrack} name={name}/>
}

export default Home