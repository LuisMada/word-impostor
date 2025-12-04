import express from 'express'
import { lobbies } from '../server.js'

const router = express.Router()

/**
 * GET /player/:playerId/role
 * Get player's role in the game
 * Query: lobbyCode
 */
router.get('/:playerId/role', (req, res) => {
  try {
    const { playerId } = req.params
    const { lobbyCode } = req.query

    if (!lobbyCode) {
      return res.status(400).json({ message: 'Missing lobbyCode query parameter' })
    }

    const lobby = lobbies.get(lobbyCode)
    if (!lobby) {
      return res.status(404).json({ message: 'Lobby not found' })
    }

    // Check if player is in lobby
    const player = lobby.players.find(p => p.playerId === playerId)
    if (!player) {
      return res.status(404).json({ message: 'Player not in this lobby' })
    }

    // Check if game is playing
    if (lobby.status !== 'playing' || !lobby.gameState) {
      return res.status(400).json({ message: 'Game is not active' })
    }

    // Get player's role from gameState
    const role = lobby.gameState.roles[playerId]
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    console.log(`📋 Fetched role for player ${player.name} in lobby ${lobbyCode}`)

    res.json(role)
  } catch (error) {
    console.error('Get player role error:', error)
    res.status(500).json({ message: 'Failed to fetch player role' })
  }
})

export default router