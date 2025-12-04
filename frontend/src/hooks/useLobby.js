import { useState, useCallback } from 'react'
import { lobbyAPI, gameAPI, playerAPI } from '../services/api'

export const useLobby = () => {
  const [lobbyData, setLobbyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createLobby = useCallback(async (hostName, numImposters, genrePrompt) => {
    setLoading(true)
    setError(null)
    try {
      const response = await lobbyAPI.create(hostName, numImposters, genrePrompt)
      setLobbyData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create lobby'
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
      const response = await lobbyAPI.join(lobbyCode, playerName)
      setLobbyData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to join lobby'
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
      const response = await lobbyAPI.get(lobbyCode)
      setLobbyData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch lobby'
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
      const response = await gameAPI.start(lobbyCode)
      setLobbyData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to start game'
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
      const response = await gameAPI.end(lobbyCode)
      setLobbyData(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to end game'
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
      const response = await playerAPI.getRole(playerId, lobbyCode)
      return response.data
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch role'
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