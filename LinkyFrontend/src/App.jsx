import './App.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Signup from './components/signup'
import Login from './components/login'
import MainPage from './components/MainPage';
import Profile from './components/profile';
import NotFoundPage from './404';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
