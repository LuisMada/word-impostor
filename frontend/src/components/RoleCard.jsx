import { useState } from 'react'
import './RoleCard.css'

export default function RoleCard({ playerName, role, isRevealed, onReveal, onHide }) {
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = () => {
    setIsPressed(true)
    onReveal()
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    onHide()
  }

  const handleTouchStart = () => {
    setIsPressed(true)
    onReveal()
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    onHide()
  }

  const isImposter = role?.type === 'imposter'
  const isWordHolder = role?.type === 'wordHolder'

  return (
    <div
      className={`role-card ${isPressed ? 'pressed' : ''} ${isRevealed ? 'revealed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isRevealed ? (
        <div className="card-front">
          <div className="player-name">{playerName}</div>
          <div className="hint">Hold to reveal role</div>
        </div>
      ) : (
        <div className="card-back">
          {isImposter ? (
            <>
              <div className="role-label imposter-label">IMPOSTER</div>
              <div className="role-content">
                {role.teammates && role.teammates.length > 0 ? (
                  <>
                    <div className="teammates-label">Your Teammates:</div>
                    <div className="teammates-list">
                      {role.teammates.map((teammate, idx) => (
                        <div key={idx} className="teammate">{teammate}</div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="teammates-label">You're the only imposter</div>
                )}
              </div>
            </>
          ) : isWordHolder ? (
            <>
              <div className="role-label word-label">SECRET WORD</div>
              <div className="role-content">
                <div className="secret-word">{role.word}</div>
              </div>
            </>
          ) : (
            <div className="role-label">Unknown Role</div>
          )}
        </div>
      )}
    </div>
  )
}