import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import * as gameLogic from '../services/gameLogic'
import './LobbyScreen.css'

export default function LobbyScreen() {
  const navigate = useNavigate()
  const { gameState, loading, error, resetGame, createGame } = useLobby()
  const [players, setPlayers] = useState([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [numImposters, setNumImposters] = useState(1)
  const [genrePrompt, setGenrePrompt] = useState('')

  // Load existing players and settings
  useEffect(() => {
    console.log('🔍 LobbyScreen mounted, gameState:', gameState)
    
    if (gameState) {
      console.log('✅ Loading players from gameState')
      setPlayers(gameState.players.map(p => p.name))
      setNumImposters(gameState.settings.numImposters)
      setGenrePrompt(gameState.settings.genrePrompt)
      
      // Reset game state so roles are cleared
      console.log('🔄 Resetting game state')
      resetGame()
    } else {
      console.log('❌ No gameState, redirecting to /create')
      navigate('/create')
    }
  }, [gameState])

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.includes(newPlayerName.trim())) {
      setPlayers([...players, newPlayerName.trim()])
      setNewPlayerName('')
    }
  }

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handlePlayAgain = async () => {
    if (players.length < 2) {
      alert('Need at least 2 players')
      return
    }
    if (!genrePrompt.trim()) {
      alert('Please enter a genre/prompt')
      return
    }

    try {
      console.log('🎮 Creating new game with players:', players)
      // Create fresh game with current players
      await createGame(players, numImposters, genrePrompt)
      navigate('/game')
    } catch (err) {
      console.error('Error creating game:', err)
      alert('Error: ' + err.message)
    }
  }

  if (!gameState) {
    return (
      <div className="container">
        <div className="loading">Loading lobby...</div>
      </div>
    )
  }

  return (
    <div className="container lobby-screen">
      <h1>Your Lobby</h1>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="genrePrompt">Genre / Prompt</label>
        <textarea
          id="genrePrompt"
          value={genrePrompt}
          onChange={(e) => setGenrePrompt(e.target.value)}
          placeholder="e.g., 'space exploration', 'medieval fantasy'"
          maxLength="200"
          rows="3"
        />
        <small>{genrePrompt.length}/200</small>
      </div>

      <div className="form-group">
        <label htmlFor="numImposters">Number of Imposters</label>
        <select
          id="numImposters"
          value={numImposters}
          onChange={(e) => setNumImposters(parseInt(e.target.value))}
          disabled={players.length < 2}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'imposter' : 'imposters'}
            </option>
          ))}
        </select>
      </div>

      <div className="players-section">
        <h2>Players ({players.length})</h2>
        <div className="players-list">
          {players.length > 0 ? (
            players.map((name, index) => (
              <div key={index} className="player-item">
                <span>{index + 1}. {name}</span>
                <button
                  className="btn btn-remove"
                  onClick={() => removePlayer(index)}
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">No players</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="newPlayer">Add Player</label>
        <div className="input-group">
          <input
            id="newPlayer"
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="Enter player name"
            maxLength="50"
          />
          <button 
            className="btn btn-secondary"
            onClick={addPlayer}
            disabled={!newPlayerName.trim()}
          >
            Add
          </button>
        </div>
      </div>

      <button 
        className="btn btn-primary btn-large"
        onClick={handlePlayAgain}
        disabled={players.length < 2 || !genrePrompt.trim() || loading}
      >
        {loading ? 'Starting Game...' : 'Play Again'}
      </button>

      <button 
        className="btn btn-outline"
        onClick={() => navigate('/')}
      >
        Home
      </button>
    </div>
  )
}