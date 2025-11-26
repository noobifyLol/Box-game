// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import LeftHandImg from "./pictures/Left.png";
import RightHandImg from "./pictures/right.png";
import RoundSystem from "./generator";

function App() {
  const [fading, setFading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [started, setStarted] = useState(false);
  const [leftCount, setLeft] = useState(0);
  const [rightCount, setRight] = useState(0);
  const [roundEnded, setRoundEnded] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [activeBoxes, setActiveBoxes] = useState([]);
  const [boxCounts, setBoxCounts] = useState({ left: 0, right: 0 });
  const [finalScores, setFinalScores] = useState({ left: 0, right: 0 });

  // Handle fading transition when Start is clicked
  const handleStartClick = () => {
    setFading(true);
    setTimeout(() => {
      setShowMenu(false);
      setFading(false);
    }, 500);
  };

  // Keyboard input only works when round is active
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!roundActive) return;
      if (event.key === "a" || event.key === "A") {
        setLeft((prev) => prev + 1);
      } else if (event.key === "ArrowRight") {
        setRight((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundActive]);

  // Determine winner
  const getWinner = () => {
    if (finalScores.left > finalScores.right) {
      return { winner: "Left Player", color: "#4a90e2", emoji: "🎉" };
    } else if (finalScores.right > finalScores.left) {
      return { winner: "Right Player", color: "#e74c3c", emoji: "🎉" };
    } else {
      return { winner: "It's a Draw!", color: "#f39c12", emoji: "🤝" };
    }
  };

  if (showMenu) {
    return (
      <div className={`menu ${fading ? 'fade-out' : ''}`}>
        <h1>Welcome to Box Game</h1>
        <p>Click Start to begin the game.</p>
        <button className="Start" onClick={handleStartClick}>
          Start
        </button>
      </div>
    );
  }

  // Draws the grid of boxes
  const rows = 10;
  const cols = 10;
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const boxInfo = activeBoxes.find(box => box.index === i);
    const cellClass = boxInfo ? `grid-cell ${boxInfo.side}` : 'grid-cell';
    
    return (
      <div key={i} className={cellClass}></div>
    );
  });

  // Main App render
  return (
    <div className="wrapper">
      <div className="top-bar">
        {started && !roundEnded && (
          <RoundSystem 
            started={started} 
            onRoundEnd={() => setRoundEnded(true)}
            onRoundStateChange={setRoundActive}
            leftCount={leftCount}
            rightCount={rightCount}
            onResetCounts={() => {
              setLeft(0);
              setRight(0);
            }}
            onBoxesGenerated={(boxes, counts) => {
              setActiveBoxes(boxes);
              setBoxCounts(counts);
            }}
            onScoreUpdate={(scores) => {
              setFinalScores(scores);
            }}
          />
        )}
      </div>
      
      {!started && (
        <div className={`welcome ${started ? 'fade-out' : ''}`}>
          <h2>Press "A" or "→" to count the boxes!</h2>
        </div>
      )}

      {roundEnded && (
        <div className="final-results">
          <h1 style={{ fontSize: '3rem', margin: '20px' }}>
            {getWinner().emoji} Game Over! {getWinner().emoji}
          </h1>
          <h2 style={{ fontSize: '2.5rem', color: getWinner().color }}>
            {getWinner().winner}
          </h2>
          <div style={{ fontSize: '2rem', margin: '30px 0' }}>
            <p style={{ color: '#4a90e2' }}>Left Player: {finalScores.left} points</p>
            <p style={{ color: '#e74c3c' }}>Right Player: {finalScores.right} points</p>
          </div>
          <button 
            className="Start" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px' }}
          >
            Play Again
          </button>
        </div>
      )}

      {!roundEnded && (
        <div className="middle">
          <div className="LHand">
            <p className="counter">{leftCount}</p>
            <img src={LeftHandImg} alt="Left Controller" />
            <h3>Press "A"</h3>
          </div>

          <div className="grid-container">{cells}</div>

          <div className="RHand">
            <p className="counter">{rightCount}</p>
            <img src={RightHandImg} alt="Right Controller" />
            <h3>Press →</h3>
          </div>
        </div>
      )}

      <div className="hands">
        {!started ? (
          <button className="Start" onClick={() => setStarted(true)}>
            Start Counting
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default App;