import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import { usePlayer } from '../hooks/usePlayer'
import * as gameLogic from '../services/gameLogic'
import './LobbyWaitingRoom.css'

export default function LobbyWaitingRoom() {
  const { lobbyCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { playerId } = usePlayer()
  const { lobbyData, fetchLobby, startGame, loading, error } = useLobby()
  const [pollingInterval, setPollingInterval] = useState(null)
  const [needsJoin, setNeedsJoin] = useState(false)

  const isHost = searchParams.get('isHost') === 'true'

  useEffect(() => {
    try {
      // Check if this player is in the lobby
      const lobby = gameLogic.getLobby(lobbyCode)
      const playerInLobby = lobby.players.some(p => p.playerId === playerId)
      
      if (!playerInLobby && !isHost) {
        // Player not in lobby, but not the host
        setNeedsJoin(true)
        return
      }

      // Fetch initial lobby state
      fetchLobby(lobbyCode)

      // Poll for updates
      const interval = setInterval(() => {
        fetchLobby(lobbyCode)
      }, 1000)

      setPollingInterval(interval)

      return () => {
        if (interval) clearInterval(interval)
      }
    } catch (err) {
      console.error('Error loading lobby:', err)
    }
  }, [lobbyCode, playerId])

  const handleStartGame = async () => {
    try {
      await startGame(lobbyCode)
      setTimeout(() => {
        navigate(`/game/${lobbyCode}${isHost ? '?isHost=true' : ''}`)
      }, 500)
    } catch (err) {
      console.error('Error starting game:', err)
    }
  }

  if (needsJoin) {
    return (
      <div className="container lobby-waiting-room">
        <h1>Join This Lobby?</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Lobby Code: <strong>{lobbyCode}</strong>
        </p>
        <div className="form-group">
          <input
            type="text"
            id="playerName"
            placeholder="Enter your name to join"
            maxLength="50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                gameLogic.joinLobby(lobbyCode, e.target.value.trim())
                window.location.reload()
              }
            }}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={(e) => {
            const input = document.querySelector('#playerName')
            if (input.value.trim()) {
              gameLogic.joinLobby(lobbyCode, input.value.trim())
              window.location.reload()
            }
          }}
        >
          Join Lobby
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => navigate('/')}
        >
          Back
        </button>
      </div>
    )
  }

  if (!lobbyData) {
    return (
      <div className="container">
        <div className="loading">Loading lobby...</div>
      </div>
    )
  }

  return (
    <div className="container lobby-waiting-room">
      <div className="header">
        <h1>Lobby: {lobbyCode}</h1>
        {isHost && <span className="badge badge-host">Host</span>}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="lobby-info">
        <div className="info-item">
          <span className="label">Imposters:</span>
          <span className="value">{lobbyData.settings?.numImposters || 0}</span>
        </div>
        <div className="info-item">
          <span className="label">Genre:</span>
          <span className="value">{lobbyData.settings?.genrePrompt || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="label">Players:</span>
          <span className="value">{lobbyData.players?.length || 0}</span>
        </div>
      </div>

      <div className="players-section">
        <h2>Players</h2>
        <div className="players-list">
          {lobbyData.players && lobbyData.players.length > 0 ? (
            lobbyData.players.map((player) => (
              <div 
                key={player.playerId} 
                className={`player-item ${player.playerId === playerId ? 'current' : ''}`}
              >
                <span className="player-name">{player.name}</span>
                {player.playerId === playerId && (
                  <span className="badge badge-you">You</span>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">No players yet</div>
          )}
        </div>
      </div>

      {isHost && (
        <button
          className="btn btn-primary btn-large"
          onClick={handleStartGame}
          disabled={loading || (lobbyData.players?.length || 0) < 2}
        >
          {loading ? 'Starting Game...' : 'Start Game'}
        </button>
      )}

      {!isHost && (
        <div className="waiting-message">
          Waiting for host to start the game...
        </div>
      )}

      {/* Share Link Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          className="btn btn-outline"
          onClick={() => {
            const shareUrl = `${window.location.origin}/lobby/${lobbyCode}`
            navigator.clipboard.writeText(shareUrl)
            alert('Lobby link copied to clipboard!')
          }}
        >
          📋 Copy Lobby Link
        </button>
      </div>

      <button 
        className="btn btn-outline"
        onClick={() => navigate('/')}
      >
        Leave Lobby
      </button>
    </div>
  )
}