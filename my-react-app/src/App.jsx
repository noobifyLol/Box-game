// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import LeftHandImg from "./pictures/Left.png";
import RightHandImg from "./pictures/right.png";
import RoundSystem from "./generator"; // Remove the curly braces

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [started, setStarted] = useState(false);
  const [leftCount, setLeft] = useState(0);
  const [rightCount, setRight] = useState(0);
  const [roundEnded, setRoundEnded] = useState(false);
  const [roundStart, setRoundStarted] = useState(false);

// Just the keyboard input handler for the score counts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!started) return;
      if (event.key === "a" || event.key === "A") {
        setLeft((prev) => prev + 1);
      } else if (event.key === "ArrowRight") {
        setRight((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started]);


  if (showMenu) {
    return (
      <div className="menu">
        <h1>Welcome to Box Game</h1>
        <p>Click Start to begin the game.</p>
        <button className="Start" onClick={() => setShowMenu(false)}>
          Start
        </button>
      </div>
    );
  }
// Draws the grid of boxes
  const rows = 10;
  const cols = 10;
  const cells = Array.from({ length: rows * cols }, (_, i) => (
    <div key={i} className="grid-cell"></div>
  ));
// Main App render
  return (
    <div className="wrapper">
        <div className="top-bar">
{started && <RoundSystem started={started} onRoundEnd={() => setRoundEnded(true)} />}
  </div>
      <div className="welcome">
        <h2>Press "A" or "→" to count the boxes!</h2>

      </div>

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

      <div className="hands">
        {!started ? (
          <button className="Start" onClick={() => setStarted(true) }>
            Start Counting
          </button>
        ) : (
          roundEnded && <h2>🏁 All Rounds Finished!</h2>
        )}
      </div>
    </div>
  );
}

export default App;
