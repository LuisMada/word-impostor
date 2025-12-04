import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import { usePlayer } from '../hooks/usePlayer'
import './LobbyWaitingRoom.css'

export default function LobbyWaitingRoom() {
  const { lobbyCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { playerId } = usePlayer()
  const { lobbyData, fetchLobby, startGame, loading, error } = useLobby()
  const [pollingInterval, setPollingInterval] = useState(null)

  const isHost = searchParams.get('isHost') === 'true'

  useEffect(() => {
    // Initial fetch
    fetchLobby(lobbyCode)

    // Poll for lobby updates every 2 seconds
    const interval = setInterval(() => {
      fetchLobby(lobbyCode)
    }, 2000)

    setPollingInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lobbyCode])

  const handleStartGame = async () => {
    try {
      await startGame(lobbyCode)
      // Redirect to game screen after a short delay
      setTimeout(() => {
        navigate(`/game/${lobbyCode}${isHost ? '?isHost=true' : ''}`)
      }, 500)
    } catch (err) {
      console.error('Error starting game:', err)
    }
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

      <button 
        className="btn btn-outline"
        onClick={() => navigate('/')}
      >
        Leave Lobby
      </button>
    </div>
  )
}