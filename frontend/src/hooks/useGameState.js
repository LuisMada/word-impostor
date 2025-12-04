import { useState, useCallback } from 'react'

export const useGameState = (initialRole) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [role, setRole] = useState(initialRole)

  const toggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev)
  }, [])

  const reveal = useCallback(() => {
    setIsRevealed(true)
  }, [])

  const hide = useCallback(() => {
    setIsRevealed(false)
  }, [])

  const updateRole = useCallback((newRole) => {
    setRole(newRole)
  }, [])

  return {
    isRevealed,
    role,
    toggleReveal,
    reveal,
    hide,
    updateRole,
  }
}