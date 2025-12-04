import { v4 as uuidv4 } from 'uuid'

const GAME_STATE_KEY = 'word_imposter_gameState'

/**
 * Get current game state from localStorage
 */
function getGameState() {
  const data = localStorage.getItem(GAME_STATE_KEY)
  return data ? JSON.parse(data) : null
}

/**
 * Save game state to localStorage
 */
function saveGameState(state) {
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state))
}

/**
 * Clear game state
 */
function clearGameState() {
  localStorage.removeItem(GAME_STATE_KEY)
}

/**
 * Create a new game
 */
export function createGame(playerNames, numImposters, genrePrompt) {
  if (playerNames.length < 2) {
    throw new Error('Need at least 2 players')
  }

  if (numImposters >= playerNames.length) {
    throw new Error('Too many imposters for player count')
  }

  const gameId = `game_${uuidv4()}`
  const players = playerNames.map((name, index) => ({
    id: `player_${index}`,
    name,
    order: index,
  }))

  const gameState = {
    gameId,
    status: 'setup', // setup | playing | ended
    players,
    settings: {
      numImposters,
      genrePrompt,
    },
    gameData: null, // Will be set when game starts
    currentPlayerIndex: 0,
  }

  saveGameState(gameState)
  return gameState
}

/**
 * Start the game (assign roles)
 */
export function startGame(secretWord) {
  const gameState = getGameState()
  if (!gameState) {
    throw new Error('No game in progress')
  }

  if (gameState.status !== 'setup') {
    throw new Error('Game already started')
  }

  const playerIds = gameState.players.map(p => p.id)
  const imposters = selectImposters(playerIds, gameState.settings.numImposters)
  const roles = generateRoles(playerIds, imposters, secretWord)

  gameState.status = 'playing'
  gameState.currentPlayerIndex = 0
  gameState.gameData = {
    secretWord,
    imposters,
    roles,
    startedAt: new Date().toISOString(),
  }

  saveGameState(gameState)
  console.log(`🎮 Game started with ${gameState.players.length} players`)
  return gameState
}

/**
 * Get current player's role
 */
export function getCurrentPlayerRole() {
  const gameState = getGameState()
  if (!gameState || gameState.status !== 'playing') {
    throw new Error('Game not in progress')
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const role = gameState.gameData.roles[currentPlayer.id]
  
  return {
    playerName: currentPlayer.name,
    role,
    currentIndex: gameState.currentPlayerIndex,
    totalPlayers: gameState.players.length,
  }
}

/**
 * Move to next player
 */
export function nextPlayer() {
  const gameState = getGameState()
  if (!gameState || gameState.status !== 'playing') {
    throw new Error('Game not in progress')
  }

  gameState.currentPlayerIndex += 1
  saveGameState(gameState)

  const isLastPlayer = gameState.currentPlayerIndex >= gameState.players.length
  return {
    isLastPlayer,
    currentIndex: gameState.currentPlayerIndex,
    totalPlayers: gameState.players.length,
  }
}

/**
 * End the game
 */
export function endGame() {
  const gameState = getGameState()
  if (!gameState) {
    throw new Error('No game in progress')
  }

  gameState.status = 'ended'
  saveGameState(gameState)
  console.log('⏹️  Game ended')
  return gameState
}

/**
 * Get current game state
 */
export function getGame() {
  return getGameState()
}

/**
 * Reset to setup (same players, new roles)
 */
export function resetToSetup() {
  const gameState = getGameState()
  if (!gameState) {
    throw new Error('No game in progress')
  }

  gameState.status = 'setup'
  gameState.currentPlayerIndex = 0
  gameState.gameData = null

  saveGameState(gameState)
  return gameState
}

/**
 * Delete entire game
 */
export function deleteGame() {
  clearGameState()
}

// ============ Helper Functions ============

/**
 * Randomly select N imposters from player IDs
 */
function selectImposters(playerIds, numImposters) {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numImposters)
}

/**
 * Generate role assignments for all players
 */
function generateRoles(playerIds, imposters, secretWord) {
  const roles = {}

  playerIds.forEach((playerId) => {
    if (imposters.includes(playerId)) {
      const teammates = imposters.filter(id => id !== playerId)
      roles[playerId] = {
        type: 'imposter',
        teammates,
      }
    } else {
      roles[playerId] = {
        type: 'wordHolder',
        word: secretWord,
      }
    }
  })

  return roles
}