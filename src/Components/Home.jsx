import { useState } from "react"
import { Link } from "react-router-dom";

const Home = () => {
  
  const [name, setName] = useState('');

  return (
    <div>
        Home
        <input type='text' value={name} onChange={(e) => {
           setName(e.target.value);
        }}/>   
        <nav>
          <Link to="/">Home</Link>
          <Link to={`/root?name=${name}`}>Go to Room</Link>
        </nav>
    </div>
  )
}

export default Home