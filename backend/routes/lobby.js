import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { lobbies } from '../server.js'
import { generateLobbyCode } from '../utils/gameLogic.js'

const router = express.Router()

/**
 * POST /lobby/create
 * Create a new lobby
 * Body: { hostName, numImposters, genrePrompt }
 */
router.post('/create', (req, res) => {
  try {
    const { hostName, numImposters, genrePrompt } = req.body

    // Validation
    if (!hostName || !genrePrompt) {
      return res.status(400).json({ message: 'Missing required fields: hostName, genrePrompt' })
    }

    if (!Number.isInteger(numImposters) || numImposters < 1 || numImposters > 5) {
      return res.status(400).json({ message: 'numImposters must be between 1 and 5' })
    }

    // Generate lobby code
    const lobbyCode = generateLobbyCode()

    // Create host player
    const hostId = `player_${uuidv4()}`

    // Create lobby object
    const lobby = {
      lobbyCode,
      hostId,
      status: 'waiting', // waiting | playing | ended
      createdAt: new Date(),
      players: [
        {
          playerId: hostId,
          name: hostName,
          joinedAt: new Date(),
        },
      ],
      settings: {
        numImposters,
        genrePrompt,
      },
      gameState: null, // Will be set when game starts
    }

    lobbies.set(lobbyCode, lobby)

    console.log(`✅ Lobby created: ${lobbyCode} by ${hostName}`)

    res.status(201).json({
      lobbyCode,
      hostId,
      status: 'waiting',
      players: lobby.players,
      settings: lobby.settings,
    })
  } catch (error) {
    console.error('Create lobby error:', error)
    res.status(500).json({ message: 'Failed to create lobby' })
  }
})

/**
 * POST /lobby/join
 * Join an existing lobby
 * Body: { lobbyCode, playerName }
 */
router.post('/join', (req, res) => {
  try {
    const { lobbyCode, playerName } = req.body

    // Validation
    if (!lobbyCode || !playerName) {
      return res.status(400).json({ message: 'Missing required fields: lobbyCode, playerName' })
    }

    // Find lobby
    const lobby = lobbies.get(lobbyCode)
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' })
    }

    // Check if game already started
    if (lobby.status === 'playing') {
      return res.status(400).json({ message: 'Game has already started. Cannot join.' })
    }

    // Create new player
    const playerId = `player_${uuidv4()}`
    const player = {
      playerId,
      name: playerName,
      joinedAt: new Date(),
    }

    // Add player to lobby
    lobby.players.push(player)

    console.log(`✅ Player joined lobby ${lobbyCode}: ${playerName}`)

    res.status(200).json({
      lobbyCode,
      playerId,
      status: lobby.status,
      players: lobby.players,
      settings: lobby.settings,
    })
  } catch (error) {
    console.error('Join lobby error:', error)
    res.status(500).json({ message: 'Failed to join lobby' })
  }
})

/**
 * GET /lobby/:code
 * Get lobby state
 */
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params

    const lobby = lobbies.get(code)
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' })
    }

    res.json({
      lobbyCode: lobby.lobbyCode,
      status: lobby.status,
      players: lobby.players,
      settings: lobby.settings,
      gameState: lobby.gameState,
    })
  } catch (error) {
    console.error('Get lobby error:', error)
    res.status(500).json({ message: 'Failed to fetch lobby' })
  }
})

export default router