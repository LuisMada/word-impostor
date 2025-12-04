import { useState, useEffect } from 'react'

const PLAYER_ID_KEY = 'wordimposter_playerId'
const CURRENT_LOBBY_KEY = 'wordimposter_currentLobby'

export const usePlayer = () => {
  const [playerId, setPlayerId] = useState(null)
  const [currentLobby, setCurrentLobby] = useState(null)

  // Initialize playerId from localStorage or create new one
  useEffect(() => {
    let id = localStorage.getItem(PLAYER_ID_KEY)
    if (!id) {
      id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(PLAYER_ID_KEY, id)
    }
    setPlayerId(id)

    const lobby = localStorage.getItem(CURRENT_LOBBY_KEY)
    if (lobby) {
      setCurrentLobby(JSON.parse(lobby))
    }
  }, [])

  const saveCurrentLobby = (lobbyCode) => {
    localStorage.setItem(CURRENT_LOBBY_KEY, JSON.stringify({ code: lobbyCode }))
    setCurrentLobby({ code: lobbyCode })
  }

  const clearCurrentLobby = () => {
    localStorage.removeItem(CURRENT_LOBBY_KEY)
    setCurrentLobby(null)
  }

  return {
    playerId,
    currentLobby,
    saveCurrentLobby,
    clearCurrentLobby,
  }
}