import { useState } from 'react'
import './RoleCard.css'

export default function RoleCard({ role }) {
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = () => {
    setIsPressed(true)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleTouchStart = () => {
    setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  const isImposter = role?.type === 'imposter'
  const isWordHolder = role?.type === 'wordHolder'

  return (
    <div
      className={`role-card ${isPressed ? 'pressed' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isPressed ? (
        <div className="card-front">
          <div className="hint">Hold to reveal your role</div>
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