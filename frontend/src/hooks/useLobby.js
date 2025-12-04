import { useState, useCallback } from 'react'
import * as gameLogic from '../services/gameLogic'
import { generateSecretWord } from '../services/openai'

export const useLobby = () => {
  const [lobbyData, setLobbyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createLobby = useCallback(async (hostName, numImposters, genrePrompt) => {
    setLoading(true)
    setError(null)
    try {
      const lobby = gameLogic.createLobby(hostName, numImposters, genrePrompt)
      setLobbyData(lobby)
      return lobby
    } catch (err) {
      const message = err.message || 'Failed to create lobby'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const joinLobby = useCallback(async (lobbyCode, playerName) => {
    setLoading(true)
    setError(null)
    try {
      const result = gameLogic.joinLobby(lobbyCode, playerName)
      setLobbyData(result)
      return result
    } catch (err) {
      const message = err.message || 'Failed to join lobby'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLobby = useCallback(async (lobbyCode) => {
    setLoading(true)
    setError(null)
    try {
      const lobby = gameLogic.getLobby(lobbyCode)
      setLobbyData(lobby)
      return lobby
    } catch (err) {
      const message = err.message || 'Failed to fetch lobby'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startGame = useCallback(async (lobbyCode) => {
    setLoading(true)
    setError(null)
    try {
      // Generate secret word from OpenAI
      const lobby = gameLogic.getLobby(lobbyCode)
      console.log(`🤖 Generating word for: "${lobby.settings.genrePrompt}"`)
      const secretWord = await generateSecretWord(lobby.settings.genrePrompt)
      
      // Start game with secret word
      const updatedLobby = gameLogic.startGame(lobbyCode, secretWord)
      setLobbyData(updatedLobby)
      return updatedLobby
    } catch (err) {
      const message = err.message || 'Failed to start game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const endGame = useCallback(async (lobbyCode) => {
    setLoading(true)
    setError(null)
    try {
      const lobby = gameLogic.endGame(lobbyCode)
      setLobbyData(lobby)
      return lobby
    } catch (err) {
      const message = err.message || 'Failed to end game'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getPlayerRole = useCallback(async (playerId, lobbyCode) => {
    setLoading(true)
    setError(null)
    try {
      const role = gameLogic.getPlayerRole(playerId, lobbyCode)
      return role
    } catch (err) {
      const message = err.message || 'Failed to fetch role'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    lobbyData,
    loading,
    error,
    createLobby,
    joinLobby,
    fetchLobby,
    startGame,
    endGame,
    getPlayerRole,
  }
}