import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { usePlayer } from '../hooks/usePlayer'
import { useLobby } from '../hooks/useLobby'
import { useGameState } from '../hooks/useGameState'
import RoleCard from '../components/RoleCard'
import './GameScreen.css'

export default function GameScreen() {
  const { lobbyCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { playerId } = usePlayer()
  const { lobbyData, fetchLobby, endGame, getPlayerRole, loading, error } = useLobby()
  const [playerRole, setPlayerRole] = useState(null)
  const [pollingInterval, setPollingInterval] = useState(null)

  const isHost = searchParams.get('isHost') === 'true'
  const gameState = useGameState(playerRole)

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      try {
        const lobby = await fetchLobby(lobbyCode)
        if (lobby.status !== 'playing') {
          navigate(`/lobby/${lobbyCode}${isHost ? '?isHost=true' : ''}`)
          return
        }

        const role = await getPlayerRole(playerId, lobbyCode)
        setPlayerRole(role)
        gameState.updateRole(role)
      } catch (err) {
        console.error('Error fetching game data:', err)
      }
    }

    fetchData()

    // Poll for game state updates every 2 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 2000)

    setPollingInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [lobbyCode, playerId])

  const handleEndGame = async () => {
    if (confirm('Are you sure you want to end the game?')) {
      try {
        await endGame(lobbyCode)
        navigate(`/lobby/${lobbyCode}?isHost=true`)
      } catch (err) {
        console.error('Error ending game:', err)
      }
    }
  }

  return (
    <div className="container game-screen">
      <div className="game-header">
        <h1>Game in Progress</h1>
        <div className="game-info">
          <span className="code">{lobbyCode}</span>
          {playerRole?.isFirstSpeaker && (
            <span className="badge badge-first">First Speaker</span>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="game-content">
        <RoleCard 
          playerName={lobbyData?.players?.find(p => p.playerId === playerId)?.name || 'You'}
          role={playerRole}
          isRevealed={gameState.isRevealed}
          onReveal={gameState.reveal}
          onHide={gameState.hide}
        />

        {isHost && (
          <button
            className="btn btn-danger btn-large"
            onClick={handleEndGame}
            disabled={loading}
          >
            {loading ? 'Ending Game...' : 'End Game'}
          </button>
        )}

        {!isHost && (
          <div className="players-info">
            <h3>Other Players</h3>
            <div className="other-players">
              {lobbyData?.players?.filter(p => p.playerId !== playerId).map(player => (
                <div key={player.playerId} className="other-player">
                  {player.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        className="btn btn-outline"
        onClick={() => navigate('/')}
      >
        Leave Game
      </button>
    </div>
  )
}