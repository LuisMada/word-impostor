import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import CreateLobby from './pages/CreateLobby'
import JoinLobby from './pages/JoinLobby'
import LobbyWaitingRoom from './pages/LobbyWaitingRoom'
import GameScreen from './pages/GameScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create-lobby" element={<CreateLobby />} />
        <Route path="/join-lobby" element={<JoinLobby />} />
        <Route path="/lobby/:lobbyCode" element={<LobbyWaitingRoom />} />
        <Route path="/game/:lobbyCode" element={<GameScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App