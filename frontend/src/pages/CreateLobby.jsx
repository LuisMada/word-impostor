import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import { usePlayer } from '../hooks/usePlayer'
import './CreateLobby.css'

export default function CreateLobby() {
  const navigate = useNavigate()
  const { saveCurrentLobby } = usePlayer()
  const { createLobby, loading, error } = useLobby()

  const [formData, setFormData] = useState({
    hostName: '',
    numImposters: 1,
    genrePrompt: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numImposters' ? parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await createLobby(
        formData.hostName,
        formData.numImposters,
        formData.genrePrompt
      )
      saveCurrentLobby(result.lobbyCode)
      // Redirect to lobby with isHost flag in URL
      navigate(`/lobby/${result.lobbyCode}?isHost=true`)
    } catch (err) {
      console.error('Error creating lobby:', err)
    }
  }

  return (
    <div className="container create-lobby">
      <h1>Create Lobby</h1>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="hostName">Your Name</label>
          <input
            id="hostName"
            type="text"
            name="hostName"
            value={formData.hostName}
            onChange={handleChange}
            placeholder="Enter your name"
            required
            maxLength="50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="numImposters">Number of Imposters</label>
          <select
            id="numImposters"
            name="numImposters"
            value={formData.numImposters}
            onChange={handleChange}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="genrePrompt">Genre / Prompt</label>
          <textarea
            id="genrePrompt"
            name="genrePrompt"
            value={formData.genrePrompt}
            onChange={handleChange}
            placeholder="e.g., 'space exploration', 'medieval fantasy', 'underwater creatures'"
            required
            maxLength="200"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Lobby'}
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