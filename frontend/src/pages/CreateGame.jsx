import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import './CreateGame.css'

export default function CreateGame() {
  const navigate = useNavigate()
  const { createGame, loading, error } = useLobby()

  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState([])
  const [numImposters, setNumImposters] = useState(1)
  const [genrePrompt, setGenrePrompt] = useState('')
  const [showGenreStep, setShowGenreStep] = useState(false)

  const addPlayer = () => {
    if (playerName.trim()) {
      setPlayers([...players, playerName.trim()])
      setPlayerName('')
    }
  }

  const removePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleStartGame = async () => {
    if (players.length < 2) {
      alert('Need at least 2 players')
      return
    }
    if (!genrePrompt.trim()) {
      alert('Please enter a genre/prompt')
      return
    }

    try {
      await createGame(players, numImposters, genrePrompt)
      navigate('/game')
    } catch (err) {
      console.error('Error starting game:', err)
    }
  }

  return (
    <div className="container create-game">
      {!showGenreStep ? (
        <>
          <h1>Add Players</h1>
          
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <div className="input-group">
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                placeholder="Enter player name"
                maxLength="50"
              />
              <button 
                className="btn btn-secondary"
                onClick={addPlayer}
                disabled={!playerName.trim()}
              >
                Add
              </button>
            </div>
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
                <div className="empty-state">No players added yet</div>
              )}
            </div>
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

          <button 
            className="btn btn-primary btn-large"
            onClick={() => setShowGenreStep(true)}
            disabled={players.length < 2 || loading}
          >
            Next
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            Back
          </button>
        </>
      ) : (
        <>
          <h1>Game Settings</h1>
          
          <div className="form-group">
            <label htmlFor="genrePrompt">Genre / Prompt</label>
            <textarea
              id="genrePrompt"
              value={genrePrompt}
              onChange={(e) => setGenrePrompt(e.target.value)}
              placeholder="e.g., 'space exploration', 'medieval fantasy', 'underwater creatures'"
              maxLength="200"
              rows="4"
            />
            <small>{genrePrompt.length}/200</small>
          </div>

          <div className="settings-review">
            <h3>Game Setup</h3>
            <p><strong>Players:</strong> {players.length}</p>
            <p><strong>Imposters:</strong> {numImposters}</p>
            <p><strong>Genre:</strong> {genrePrompt || '(not set)'}</p>
          </div>

          <button 
            className="btn btn-primary btn-large"
            onClick={handleStartGame}
            disabled={!genrePrompt.trim() || loading}
          >
            {loading ? 'Starting Game...' : 'Start Game'}
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => setShowGenreStep(false)}
          >
            Back
          </button>
        </>
      )}
    </div>
  )
}