import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import CreateGame from './pages/CreateGame'
import LobbyScreen from './pages/LobbyScreen'
import GameScreen from './pages/GameScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/lobby" element={<LobbyScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App