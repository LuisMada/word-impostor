import { v4 as uuidv4 } from 'uuid'

/**
 * Randomly select N imposters from players
 */
export function selectImposters(playerIds, numImposters) {
  if (numImposters >= playerIds.length) {
    throw new Error('Number of imposters must be less than total players')
  }

  const shuffled = [...playerIds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, numImposters)
}

/**
 * Select a random first speaker
 */
export function selectFirstSpeaker(playerIds) {
  return playerIds[Math.floor(Math.random() * playerIds.length)]
}

/**
 * Generate role assignments for all players
 */
export function generateRoles(playerIds, imposters, secretWord, firstSpeaker) {
  const roles = {}

  playerIds.forEach((playerId) => {
    if (imposters.includes(playerId)) {
      // Imposter sees other imposters but not the word
      const teammates = imposters.filter(id => id !== playerId)
      roles[playerId] = {
        type: 'imposter',
        teammates,
        isFirstSpeaker: playerId === firstSpeaker,
      }
    } else {
      // Word holder sees the word but not that they're not an imposter
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
 * Validate lobby code format
 */
export function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}