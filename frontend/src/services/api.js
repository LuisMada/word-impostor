import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Lobby endpoints
export const lobbyAPI = {
  create: (hostName, numImposters, genrePrompt) =>
    api.post('/lobby/create', { hostName, numImposters, genrePrompt }),
  
  join: (lobbyCode, playerName) =>
    api.post('/lobby/join', { lobbyCode, playerName }),
  
  get: (lobbyCode) =>
    api.get(`/lobby/${lobbyCode}`),
}

// Game endpoints
export const gameAPI = {
  start: (lobbyCode) =>
    api.post(`/game/start`, { lobbyCode }),
  
  end: (lobbyCode) =>
    api.post(`/game/end`, { lobbyCode }),
}

// Player endpoints
export const playerAPI = {
  getRole: (playerId, lobbyCode) =>
    api.get(`/player/${playerId}/role`, { params: { lobbyCode } }),
}

export default api