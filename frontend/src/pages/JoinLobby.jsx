import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import { usePlayer } from '../hooks/usePlayer'
import './JoinLobby.css'

export default function JoinLobby() {
  const navigate = useNavigate()
  const { saveCurrentLobby } = usePlayer()
  const { joinLobby, loading, error } = useLobby()

  const [formData, setFormData] = useState({
    lobbyCode: '',
    playerName: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await joinLobby(
        formData.lobbyCode,
        formData.playerName
      )
      saveCurrentLobby(result.lobbyCode)
      navigate(`/lobby/${result.lobbyCode}`)
    } catch (err) {
      console.error('Error joining lobby:', err)
    }
  }

  return (
    <div className="container join-lobby">
      <h1>Join Lobby</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="lobbyCode">Lobby Code</label>
          <input
            id="lobbyCode"
            type="text"
            name="lobbyCode"
            value={formData.lobbyCode}
            onChange={handleChange}
            placeholder="E.g., ABC123"
            required
            maxLength="6"
            style={{ fontSize: '24px', letterSpacing: '4px', textAlign: 'center' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="playerName">Your Name</label>
          <input
            id="playerName"
            type="text"
            name="playerName"
            value={formData.playerName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                playerName: e.target.value,
              }))
            }
            placeholder="Enter your name"
            required
            maxLength="50"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || formData.lobbyCode.length !== 6}
        >
          {loading ? 'Joining...' : 'Join Lobby'}
        </button>
      </form>

      <button 
        className="btn btn-outline"
        onClick={() => navigate('/')}
        disabled={loading}
      >
        Back
      </button>
    </div>
  )
}