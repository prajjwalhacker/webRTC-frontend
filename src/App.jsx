import Home from './Components/Home';
import Landing from './Components/Landing';

import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/root" element={<Landing />} />
      </Routes>
    </Router>
  );
}

export default App;
