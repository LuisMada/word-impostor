import { v4 as uuidv4 } from 'uuid'

const LOBBIES_KEY = 'word_imposter_lobbies'

/**
 * Get all lobbies from localStorage
 */
function getAllLobbies() {
  const data = localStorage.getItem(LOBBIES_KEY)
  return data ? JSON.parse(data) : new Map()
}

/**
 * Save lobbies to localStorage
 */
function saveLobbies(lobbies) {
  localStorage.setItem(LOBBIES_KEY, JSON.stringify(Object.fromEntries(lobbies)))
}

/**
 * Generate a random 6-char lobby code
 */
export function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new lobby
 */
export function createLobby(hostName, numImposters, genrePrompt) {
  const lobbies = new Map(Object.entries(getAllLobbies()))
  
  const lobbyCode = generateLobbyCode()
  const hostId = `player_${uuidv4()}`

  const lobby = {
    lobbyCode,
    hostId,
    status: 'waiting', // waiting | playing | ended
    createdAt: new Date().toISOString(),
    players: [
      {
        playerId: hostId,
        name: hostName,
        joinedAt: new Date().toISOString(),
      },
    ],
    settings: {
      numImposters,
      genrePrompt,
    },
    gameState: null,
  }

  lobbies.set(lobbyCode, lobby)
  saveLobbies(lobbies)

  console.log(`✅ Lobby created: ${lobbyCode}`)
  return lobby
}

/**
 * Join an existing lobby
 */
export function joinLobby(lobbyCode, playerName) {
  const lobbies = new Map(Object.entries(getAllLobbies()))
  const lobby = lobbies.get(lobbyCode)

  if (!lobby) {
    throw new Error('Lobby not found')
  }

  if (lobby.status === 'playing') {
    throw new Error('Game has already started. Cannot join.')
  }

  const playerId = `player_${uuidv4()}`
  const player = {
    playerId,
    name: playerName,
    joinedAt: new Date().toISOString(),
  }

  lobby.players.push(player)
  lobbies.set(lobbyCode, lobby)
  saveLobbies(lobbies)

  console.log(`✅ Player joined lobby ${lobbyCode}: ${playerName}`)
  return { ...lobby, playerId }
}

/**
 * Get lobby by code
 */
export function getLobby(lobbyCode) {
  const lobbies = new Map(Object.entries(getAllLobbies()))
  const lobby = lobbies.get(lobbyCode)

  if (!lobby) {
    throw new Error('Lobby not found')
  }

  return lobby
}

/**
 * Randomly select N imposters from players
 */
function selectImposters(playerIds, numImposters) {
  if (numImposters >= playerIds.length) {
    throw new Error('Number of imposters must be less than total players')
  }

  const shuffled = [...playerIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numImposters)
}

/**
 * Select a random first speaker
 */
function selectFirstSpeaker(playerIds) {
  return playerIds[Math.floor(Math.random() * playerIds.length)]
}

/**
 * Generate role assignments for all players
 */
function generateRoles(playerIds, imposters, secretWord, firstSpeaker) {
  const roles = {}

  playerIds.forEach((playerId) => {
    if (imposters.includes(playerId)) {
      const teammates = imposters.filter(id => id !== playerId)
      roles[playerId] = {
        type: 'imposter',
        teammates,
        isFirstSpeaker: playerId === firstSpeaker,
      }
    } else {
      roles[playerId] = {
        type: 'wordHolder',
        word: secretWord,
        isFirstSpeaker: playerId === firstSpeaker,
      }
    }
  })

  return roles
}

/**
 * Start a game in a lobby
 */
export function startGame(lobbyCode, secretWord) {
  const lobbies = new Map(Object.entries(getAllLobbies()))
  const lobby = lobbies.get(lobbyCode)

  if (!lobby) {
    throw new Error('Lobby not found')
  }

  if (lobby.status !== 'waiting') {
    throw new Error('Game is not in waiting state')
  }

  if (lobby.players.length < 2) {
    throw new Error('Need at least 2 players to start')
  }

  if (lobby.settings.numImposters >= lobby.players.length) {
    throw new Error('Too many imposters for player count')
  }

  // Get all player IDs
  const playerIds = lobby.players.map(p => p.playerId)

  // Assign imposters
  const imposters = selectImposters(playerIds, lobby.settings.numImposters)

  // Select first speaker
  const firstSpeaker = selectFirstSpeaker(playerIds)

  // Generate roles for all players
  const roles = generateRoles(playerIds, imposters, secretWord, firstSpeaker)

  // Update lobby
  lobby.status = 'playing'
  lobby.gameState = {
    secretWord,
    imposters,
    firstSpeaker,
    roles,
    startedAt: new Date().toISOString(),
  }

  lobbies.set(lobbyCode, lobby)
  saveLobbies(lobbies)

  console.log(`🎮 Game started in lobby ${lobbyCode}`)
  console.log(`   Imposters: ${imposters.length}`)
  console.log(`   First speaker: ${lobby.players.find(p => p.playerId === firstSpeaker)?.name}`)

  return lobby
}

/**
 * End a game in a lobby
 */
export function endGame(lobbyCode) {
  const lobbies = new Map(Object.entries(getAllLobbies()))
  const lobby = lobbies.get(lobbyCode)

  if (!lobby) {
    throw new Error('Lobby not found')
  }

  lobby.status = 'waiting'
  lobby.gameState = null

  lobbies.set(lobbyCode, lobby)
  saveLobbies(lobbies)

  console.log(`⏹️  Game ended in lobby ${lobbyCode}`)

  return lobby
}

/**
 * Get player's role in a game
 */
export function getPlayerRole(playerId, lobbyCode) {
  const lobby = getLobby(lobbyCode)

  if (lobby.status !== 'playing' || !lobby.gameState) {
    throw new Error('Game is not active')
  }

  const role = lobby.gameState.roles[playerId]
  if (!role) {
    throw new Error('Role not found')
  }

  return role
}