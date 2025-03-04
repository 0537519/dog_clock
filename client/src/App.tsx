import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Shop from './Shop';
import Pomodoro from './Pomodoro';

function Home() {
  return (
    <div className="content">
      <img src="your-animation.gif" alt="Animation" />
    </div>
  );
}

function App() {

  return (
    <Router>
      <div className="app-container">
        <div className="top-bar">
          <Link className="poppins-regular nav-item" to="/">Home</Link>
          <Link className="poppins-regular nav-item" to="/pomodoro">Pomodoro</Link>
          <Link className="poppins-regular nav-item" to="/">Task Manager</Link>
          <Link className="poppins-regular nav-item" to="/shop">Shop</Link>
          <Link className="poppins-regular nav-item" to="/">Settings</Link>
          <Link className="poppins-regular nav-item" to="/">Data</Link>
        </div>

        <Routes>
          <Route path="/shop" element={<Shop />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/" element={<Home />} />
        </Routes>

        <div className="bottom-bar">
          &nbsp;
        </div>
      </div>
    </Router>
  );
}

export default App;