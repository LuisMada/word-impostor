import { useState, useCallback, useEffect } from 'react'
import * as gameLogic from '../services/gameLogic'
import { generateSecretWord } from '../services/openai'

export const useLobby = () => {
  const [gameState, setGameState] = useState(null)
  const [currentRole, setCurrentRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load game state from localStorage on mount
  useEffect(() => {
    console.log('🔍 useLobby useEffect - loading gameState from localStorage')
    const game = gameLogic.getGame()
    console.log('🔍 gameLogic.getGame() returned:', game)
    
    if (game) {
      console.log('✅ Found game in localStorage, setting gameState')
      setGameState(game)
      if (game.status === 'playing') {
        try {
          const role = gameLogic.getCurrentPlayerRole()
          console.log('✅ Found current role:', role)
          setCurrentRole(role)
        } catch (err) {
          console.log('No current role yet:', err.message)
        }
      }
    } else {
      console.log('❌ No game found in localStorage')
    }
  }, [])

  const createGame = useCallback(async (playerNames, numImposters, genrePrompt) => {
    setLoading(true)
    setError(null)
    try {
      console.log('🎮 Creating game with players:', playerNames)
      const game = gameLogic.createGame(playerNames, numImposters, genrePrompt)
      console.log('🎮 Game created:', game)
      setGameState(game)
      setCurrentRole(null) // Clear old roles
      
      // Verify it was saved to localStorage
      const saved = gameLogic.getGame()
      console.log('🔍 Verified game in localStorage:', saved)
      
      return game
    } catch (err) {
      const message = err.message || 'Failed to create game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startGame = useCallback(async (genrePrompt) => {
    setLoading(true)
    setError(null)
    try {
      console.log(`🤖 Generating word for: "${genrePrompt}"`)
      const secretWord = await generateSecretWord(genrePrompt)
      console.log(`✅ Secret word generated: ${secretWord}`)
      
      const game = gameLogic.startGame(secretWord)
      console.log('🎮 Game started:', game)
      setGameState(game)
      
      // Load first player's role
      const role = gameLogic.getCurrentPlayerRole()
      console.log('✅ First player role:', role)
      setCurrentRole(role)
      
      return game
    } catch (err) {
      const message = err.message || 'Failed to start game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const goToNextPlayer = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      const result = gameLogic.nextPlayer()
      
      if (result.isLastPlayer) {
        // All players seen, don't load another role
        console.log('✅ All players have cycled through')
        setCurrentRole(null)
        return result
      } else {
        // Load next player's role
        const role = gameLogic.getCurrentPlayerRole()
        setCurrentRole(role)
        return result
      }
    } catch (err) {
      const message = err.message || 'Failed to move to next player'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const endGameSession = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      gameLogic.endGame()
      gameLogic.deleteGame()
      setGameState(null)
      setCurrentRole(null)
      return true
    } catch (err) {
      const message = err.message || 'Failed to end game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game...')
    setLoading(true)
    setError(null)
    try {
      gameLogic.resetToSetup()
      const game = gameLogic.getGame()
      console.log('✅ Game reset to setup:', game)
      setGameState(game)
      setCurrentRole(null) // Clear roles
      return game
    } catch (err) {
      const message = err.message || 'Failed to reset game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    gameState,
    currentRole,
    loading,
    error,
    createGame,
    startGame,
    goToNextPlayer,
    endGameSession,
    resetGame,
  }
}