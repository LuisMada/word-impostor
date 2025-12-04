import express from 'express'
import { lobbies } from '../server.js'
import { selectImposters, selectFirstSpeaker, generateRoles } from '../utils/gameLogic.js'
import { generateSecretWord } from '../services/openai.js'

const router = express.Router()

/**
 * POST /game/start
 * Start the game
 * Body: { lobbyCode }
 */
router.post('/start', async (req, res) => {
  try {
    const { lobbyCode } = req.body

    if (!lobbyCode) {
      return res.status(400).json({ message: 'Missing lobbyCode' })
    }

    const lobby = lobbies.get(lobbyCode)
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' })
    }

    // Validation
    if (lobby.status !== 'waiting') {
      return res.status(400).json({ message: 'Game is not in waiting state' })
    }

    if (lobby.players.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 players to start' })
    }

    if (lobby.settings.numImposters >= lobby.players.length) {
      return res.status(400).json({ message: 'Too many imposters for player count' })
    }

    // Generate secret word from OpenAI
    console.log(`🤖 Generating word for: "${lobby.settings.genrePrompt}"`)
    const secretWord = await generateSecretWord(lobby.settings.genrePrompt)
    console.log(`✅ Secret word generated: ${secretWord}`)

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
      startedAt: new Date(),
    }

    console.log(`🎮 Game started in lobby ${lobbyCode}`)
    console.log(`   Imposters: ${imposters.length}`)
    console.log(`   First speaker: ${lobby.players.find(p => p.playerId === firstSpeaker)?.name}`)

    res.json({
      lobbyCode,
      status: lobby.status,
      players: lobby.players,
      settings: lobby.settings,
      gameState: {
        startedAt: lobby.gameState.startedAt,
        // Don't send secret word or imposters to client
        // Each player gets their role via /player/:id/role
      },
    })
  } catch (error) {
    console.error('Start game error:', error)
    res.status(500).json({ message: 'Failed to start game' })
  }
})

/**
 * POST /game/end
 * End the game
 * Body: { lobbyCode }
 */
router.post('/end', (req, res) => {
  try {
    const { lobbyCode } = req.body

    if (!lobbyCode) {
      return res.status(400).json({ message: 'Missing lobbyCode' })
    }

    const lobby = lobbies.get(lobbyCode)
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' })
    }

    // End game, return to waiting state
    lobby.status = 'waiting'
    lobby.gameState = null

    console.log(`⏹️  Game ended in lobby ${lobbyCode}`)

    res.json({
      lobbyCode,
      status: lobby.status,
      players: lobby.players,
      settings: lobby.settings,
    })
  } catch (error) {
    console.error('End game error:', error)
    res.status(500).json({ message: 'Failed to end game' })
  }
})

export default router