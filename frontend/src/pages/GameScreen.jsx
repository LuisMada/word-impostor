import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../hooks/useLobby'
import RoleCard from '../components/RoleCard'
import './GameScreen.css'

export default function GameScreen() {
  const navigate = useNavigate()
  const { gameState, currentRole, loading, error, startGame, goToNextPlayer, endGameSession } = useLobby()
  const [allPlayersViewed, setAllPlayersViewed] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showSecretWord, setShowSecretWord] = useState(false)

  // Auto-start game when gameState loads
  useEffect(() => {
    console.log('🔍 GameScreen useEffect - gameState:', gameState, 'status:', gameState?.status)
    
    if (gameState && gameState.status === 'setup' && !gameStarted) {
      console.log('🎮 Starting game from setup...')
      handleStartGame()
      setGameStarted(true)
    }
  }, [gameState])

  const handleStartGame = async () => {
    try {
      console.log('🎮 Calling startGame with genrePrompt:', gameState.settings.genrePrompt)
      await startGame(gameState.settings.genrePrompt)
      console.log('✅ Game started successfully')
    } catch (err) {
      console.error('❌ Error starting game:', err)
      alert('Error starting game: ' + err.message)
    }
  }

  const handleNextPlayer = () => {
    try {
      const result = goToNextPlayer()
      if (result.isLastPlayer) {
        console.log('✅ All players have cycled through')
        setAllPlayersViewed(true)
      }
    } catch (err) {
      console.error('Error moving to next player:', err)
    }
  }

  const handlePlayAgain = () => {
    // Reset to setup but keep same players
    setAllPlayersViewed(false)
    setGameStarted(false)
    setShowSecretWord(false)
    
    // Navigate to lobby management screen with same players
    navigate('/lobby')
  }

  const handleEndGame = async () => {
    if (confirm('End game and return home?')) {
      try {
        await endGameSession()
        navigate('/')
      } catch (err) {
        console.error('Error ending game:', err)
      }
    }
  }

  // Still loading gameState from localStorage
  if (!gameState) {
    return (
      <div className="container">
        <div className="loading">Loading game...</div>
      </div>
    )
  }

  // All players viewed - show summary screen
  if (allPlayersViewed) {
    return (
      <div className="container game-screen">
        <div className="game-header">
          <h1>Game</h1>
        </div>

        <div className="game-content">
          <div className="all-players-viewed-screen">
            <h2>✓ All Players Reviewed</h2>
            <p>Everyone has seen their role!</p>
            
            <div className="game-summary">
              <h3>Game Summary</h3>
              <div className="summary-item">
                <strong>Total Players:</strong> {gameState.players.length}
              </div>
              <div className="summary-item">
                <strong>Imposters:</strong> {gameState.settings.numImposters}
              </div>
              <div className="summary-item">
                <strong>Genre:</strong> {gameState.settings.genrePrompt}
              </div>
            </div>

            {/* Debug: Show secret word (remove in production) */}
            <div style={{ marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSecretWord(!showSecretWord)}
                style={{ fontSize: '12px', padding: '8px 12px' }}
              >
                {showSecretWord ? 'Hide' : 'Show'} Secret Word (Debug)
              </button>
              {showSecretWord && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '6px',
                  textAlign: '18px',
                  fontWeight: 'bold',
                  color: '#856404'
                }}>
                  Secret Word: <strong>{gameState.gameData?.secretWord || 'N/A'}</strong>
                </div>
              )}
            </div>

            <div className="button-group" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-primary btn-large"
                onClick={handlePlayAgain}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Play Again'}
              </button>
              <button
                className="btn btn-danger btn-large"
                onClick={handleEndGame}
                disabled={loading}
              >
                {loading ? 'Ending Game...' : 'End Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game started but waiting for role to load
  if (!currentRole) {
    return (
      <div className="container">
        <div className="loading">
          {loading ? 'Starting game and generating word...' : 'Loading role...'}
        </div>
      </div>
    )
  }

  // Normal role reveal screen
  return (
    <div className="container game-screen">
      <div className="game-header">
        <h1>Game</h1>
        <div className="progress">
          Player {currentRole.currentIndex + 1} of {currentRole.totalPlayers}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="game-content">
        <div className="player-name-display">
          {currentRole.playerName}
        </div>

        <RoleCard 
          role={currentRole.role}
        />

        <button
          className="btn btn-primary btn-large"
          onClick={handleNextPlayer}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </div>
  )
}