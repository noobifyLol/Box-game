import React, { useState, useEffect, useRef } from "react";
import RoundSystem from "./generator";
import "./App.css";

function App() {
  const [fading, setFading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [started, setStarted] = useState(false);
  const [leftCount, setLeft] = useState(0);
  const [rightCount, setRight] = useState(0);
  const [roundEnded, setRoundEnded] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [activeBoxes, setActiveBoxes] = useState([]);
  const [finalScores, setFinalScores] = useState({ left: 0, right: 0 });
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Create audio pools for different sounds
  const clickSoundPool = useRef([]);
  const decrementSoundPool = useRef([]);
  const currentClickIndex = useRef(0);
  const currentDecrementIndex = useRef(0);
  const startSound = useRef(null);
  const winSound = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize audio pools on mount with preloading
  useEffect(() => {
    const loadAudio = async () => {
      clickSoundPool.current = await Promise.all(
        Array.from({ length: 15 }, async () => {
          const audio = new Audio('/Audio/ButtonClick.ogg');
          audio.preload = 'auto';
          audio.volume = 0.5;
          try {
            await audio.load();
          } catch (e) {
            console.log('Preload click sound:', e);
          }
          return audio;
        })
      );

      decrementSoundPool.current = await Promise.all(
        Array.from({ length: 15 }, async () => {
          const audio = new Audio('/Audio/D.ogg');
          audio.preload = 'auto';
          audio.volume = 0.3;
          try {
            await audio.load();
          } catch (e) {
            console.log('Preload decrement sound:', e);
          }
          return audio;
        })
      );

      startSound.current = new Audio('/Audio/game.ogg');
      startSound.current.preload = 'auto';
      startSound.current.volume = 0.7;
      try {
        await startSound.current.load();
      } catch (e) {
        console.log('Preload start sound:', e);
      }

      winSound.current = new Audio('/Audio/win.ogg');
      winSound.current.preload = 'auto';
      winSound.current.volume = 0.8;
      try {
        await winSound.current.load();
      } catch (e) {}

      setAudioLoaded(true);
    };

    loadAudio();
  }, []);

  // Play when game ends
  useEffect(() => {
    if (roundEnded && winSound.current && audioLoaded) {
      const clone = winSound.current.cloneNode();
      clone.volume = 0.8;
      clone.play().catch(e => console.log('Win sound failed:', e));
    }
  }, [roundEnded, audioLoaded]);

  // Optimized increment sound
  const playClickSound = () => {
    if (!audioLoaded || clickSoundPool.current.length === 0) return;
    
    const audio = clickSoundPool.current[currentClickIndex.current];
    const clone = audio.cloneNode();
    clone.volume = 0.5;
    clone.play().catch(e => console.log('Audio play failed:', e));
    
    currentClickIndex.current = (currentClickIndex.current + 1) % clickSoundPool.current.length;
  };

  // Optimized decrement sound
  const playDecrementSound = () => {
    if (!audioLoaded || decrementSoundPool.current.length === 0) return;
    
    const audio = decrementSoundPool.current[currentDecrementIndex.current];
    const clone = audio.cloneNode();
    clone.volume = 0.5;
    clone.play().catch(e => console.log('Decrement audio failed:', e));
    
    currentDecrementIndex.current = (currentDecrementIndex.current + 1) % decrementSoundPool.current.length;
  };

  const handleStartClick = () => {
    setFading(true);
    
    if (startSound.current && audioLoaded) {
      const clone = startSound.current.cloneNode();
      clone.volume = 0.7;
      clone.play().catch(e => console.log('Start sound failed:', e));
    }
    
    setTimeout(() => {
      setShowMenu(false);
      setFading(false);
    }, 500);
  };

  // Handle button clicks (mobile)
  const handleLeftIncrement = () => {
    if (!roundActive) return;
    playClickSound();
    setLeft((prev) => prev + 1);
  };

  const handleRightIncrement = () => {
    if (!roundActive) return;
    playClickSound();
    setRight((prev) => prev + 1);
  };

  // Keyboard input for desktop
  useEffect(() => {
    if (isMobile) return; // Skip keyboard on mobile
    
    const handleKeyDown = (event) => {
      if (!roundActive) return;
      
      if (event.key === "a" || event.key === "A") {
        playClickSound();
        setLeft((prev) => prev + 1);
      } else if (event.key === "ArrowRight") {
        playClickSound();
        setRight((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundActive, audioLoaded, isMobile]);

  // Decrement for desktop only
  useEffect(() => {
    if (isMobile) return;
    
    const handleKeyDown = (event) => {
      if (!roundActive) return;
      
      if (event.key === "s" || event.key === "S") {
        setLeft(prev => {
          if (prev > 0) {
            playDecrementSound();
            return prev - 1;
          }
          return prev;
        });
      }
      if (event.key === "ArrowLeft") {
        setRight(prev => {
          if (prev > 0) {
            playDecrementSound();
            return prev - 1;
          }
          return prev;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundActive, audioLoaded, isMobile]);

  // Determine winner at game end
  const getWinner = () => {
    if (finalScores.left > finalScores.right) {
      return { winner: "Left Player", color: "#fd9a04ff", emoji: "🎉" };
    } else if (finalScores.right > finalScores.left) {
      return { winner: "Right Player", color: "#48ff00ff", emoji: "🎉" };
    } else {
      return { winner: "It's a Draw!", color: "#a322caff", emoji: "🤝" };
    }
  };

  // Menu screen
  if (showMenu) {
    return (
      <div className={`menu ${fading ? 'fade-out' : ''}`}>
        <h1>Welcome to Box Game</h1>
        <p>Click Start to begin the game.</p>
        {!audioLoaded && <p style={{fontSize: '0.9rem', opacity: 0.7}}>Loading audio...</p>}
        <button className="Start" onClick={handleStartClick} disabled={!audioLoaded}>
          Start
        </button>
      </div>
    );
  }

  const rows = 10;
  const cols = 10;
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const boxInfo = activeBoxes.find(box => box.index === i);
    const cellClass = boxInfo ? `grid-cell ${boxInfo.side}` : 'grid-cell';
    
    return (
      <div key={i} className={cellClass}></div>
    );
  });

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
            onBoxesGenerated={(boxes) => {
              setActiveBoxes(boxes);
            }}
            onScoreUpdate={(scores) => {
              setFinalScores(scores);
            }}
          />
        )}
      </div>
      
      {!started && !roundEnded && (
        <div className="welcome">
          <h2>{isMobile ? 'Tap the buttons to count!' : 'Press "A" or "→" to count the boxes!'}</h2>
          {!isMobile && <h3>Press "S" or "←" to decrement the count!</h3>}
        </div>
      )}

      {roundEnded && (
        <div className="final-results">
          <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', margin: '20px' }}>
            {getWinner().emoji} Game Over! {getWinner().emoji}
          </h1>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.5rem', color: getWinner().color }}>
            {getWinner().winner}
          </h2>
          <div style={{ fontSize: isMobile ? '1.2rem' : '2rem', margin: '30px 0' }}>
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
        <div className={isMobile ? "middle-mobile" : "middle"}>
          <div className="LHand">
            <p className="counter">{leftCount}</p>
            <div style={{
              width: isMobile ? '80px' : '100px', 
              height: isMobile ? '80px' : '100px', 
              background: '#4a90e2', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '10px', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Left
            </div>
            {isMobile ? (
              <button 
                className="count-button left-button"
                onClick={handleLeftIncrement}
                disabled={!roundActive}
                style={{
                  marginTop: '15px',
                  padding: '15px 30px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  backgroundColor: roundActive ? '#4a90e2' : '#ccc',
                  color: 'white',
                  border: '3px solid #2e5c8a',
                  borderRadius: '12px',
                  cursor: roundActive ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.1s ease',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
                onTouchStart={(e) => {
                  if (roundActive) e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                TAP +
              </button>
            ) : (
              <h3>Press "A"</h3>
            )}
          </div>

          <div className="grid-container">{cells}</div>

          <div className="RHand">
            <p className="counter">{rightCount}</p>
            <div style={{
              width: isMobile ? '80px' : '100px', 
              height: isMobile ? '80px' : '100px', 
              background: '#e74c3c', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '10px', 
              color: 'white', 
              fontWeight: 'bold',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Right
            </div>
            {isMobile ? (
              <button 
                className="count-button right-button"
                onClick={handleRightIncrement}
                disabled={!roundActive}
                style={{
                  marginTop: '15px',
                  padding: '15px 30px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  backgroundColor: roundActive ? '#e74c3c' : '#ccc',
                  color: 'white',
                  border: '3px solid #a93226',
                  borderRadius: '12px',
                  cursor: roundActive ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.1s ease',
                  touchAction: 'manipulation',
                  userSelect: 'none'
                }}
                onTouchStart={(e) => {
                  if (roundActive) e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                TAP +
              </button>
            ) : (
              <h3>Press →</h3>
            )}
          </div>
        </div>
      )}

      <div className="hands">
        {!started && (
          <button className="Start" onClick={() => setStarted(true)}>
            Start Counting
          </button>
        )}
      </div>
    </div>
  );
}

export default App;