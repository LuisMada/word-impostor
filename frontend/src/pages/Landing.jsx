import { useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="container landing">
      <h1>Word Imposter Game</h1>
      <p className="subtitle">A game of deception and deduction</p>
      
      <div className="button-group">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/create')}
        >
          Start New Game
        </button>
      </div>
    </div>
  )
}