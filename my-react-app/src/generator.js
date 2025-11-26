import React, { useState, useEffect } from "react";

function RoundSystem({ started, onRoundEnd, onRoundStateChange, leftCount, rightCount, onResetCounts, onBoxesGenerated, onScoreUpdate }) {
  const roundMax = 7;
  const roundTime = [10, 9, 8, 6, 5, 3, 2];
  const MaxBoxesperRound = [10, 15, 20, 25, 30, 35, 40];
  const ShownBoxesTime = [6, 5, 5, 4, 4, 3, 2]; // Fixed: removed duplicate entry
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showAnswers, setShowAnswers] = useState(false);
  const [roundStart, setRoundStart] = useState(false);
  const [roundEnd, setRoundEnd] = useState(false);
  const [rightCheck, setRightCheck] = useState("");
  const [leftCheck, setLeftCheck] = useState("");
  const [leftBoxCount, setLeftBoxCount] = useState(0);
  const [rightBoxCount, setRightBoxCount] = useState(0);
  const [showingBoxes, setShowingBoxes] = useState(false);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [boxesGenerated, setBoxesGenerated] = useState(false);

  // Notify parent when round state changes (only during counting phase)
  useEffect(() => {
    const isActive = isRunning && !showAnswers && countdown === null && !showingBoxes && roundStart;
    if (onRoundStateChange) {
      onRoundStateChange(isActive);
    }
  }, [roundStart, showAnswers, countdown, onRoundStateChange, showingBoxes, isRunning]);

  // Generate random boxes for the round
  function generateBoxes(roundNumber) {
    const maxBoxesPerSide = MaxBoxesperRound[roundNumber - 1];
    const totalCells = 100;
    
    // Each side gets random number of boxes (60-100% of max)
    const leftCount = Math.floor(Math.random() * (maxBoxesPerSide * 0.4 + 1)) + Math.floor(maxBoxesPerSide * 0.6);
    const rightCount = Math.floor(Math.random() * (maxBoxesPerSide * 0.4 + 1)) + Math.floor(maxBoxesPerSide * 0.6);
    
    const totalBoxes = leftCount + rightCount;
    
    // Generate random positions
    const positions = [];
    while (positions.length < totalBoxes) {
      const randomPos = Math.floor(Math.random() * totalCells);
      if (!positions.includes(randomPos)) {
        positions.push(randomPos);
      }
    }
    
    // Assign sides to positions
    const boxes = positions.map((pos, idx) => ({
      index: pos,
      side: idx < leftCount ? 'left' : 'right'
    }));
    
    setLeftBoxCount(leftCount);
    setRightBoxCount(rightCount);
    
    return { boxes, counts: { left: leftCount, right: rightCount } };
  }

  // Check if counts match and update scores
  function checkTheCount() {
    let leftCorrect = false;
    let rightCorrect = false;

    if (rightCount === rightBoxCount) {
      setRightCheck("✅");
      rightCorrect = true;
      setRightScore(prev => prev + 1);
    } else {
      setRightCheck("❌");
    }

    if (leftCount === leftBoxCount) {
      setLeftCheck("✅");
      leftCorrect = true;
      setLeftScore(prev => prev + 1);
    } else {
      setLeftCheck("❌");
    }

    // Send scores to parent
    if (onScoreUpdate) {
      onScoreUpdate({
        left: leftCorrect ? leftScore + 1 : leftScore,
        right: rightCorrect ? rightScore + 1 : rightScore
      });
    }
  }

  // Start countdown when component mounts
  useEffect(() => {
    if (started && countdown === 3 && !isRunning && round === 1) {
      startInitialCountdown();
    }
  }, [started]);

  // Show boxes at the start of each round (after GO!)
  useEffect(() => {
    if (roundStart && countdown === null && !showingBoxes && !showAnswers && !boxesGenerated) {
      console.log("Generating boxes for round", round);
      setShowingBoxes(true);
      setBoxesGenerated(true);
      
      const { boxes, counts } = generateBoxes(round);
      
      if (onBoxesGenerated) {
        onBoxesGenerated(boxes, counts);
      }
      
      const displayTime = ShownBoxesTime[round - 1] * 1000;
      console.log("Boxes will hide in", displayTime / 1000, "seconds");
      
      const hideTimeout = setTimeout(() => {
        console.log("Hiding boxes, starting timer");
        if (onBoxesGenerated) {
          onBoxesGenerated([], counts);
        }
        setShowingBoxes(false);
      }, displayTime);
      
      return () => clearTimeout(hideTimeout);
    }
  }, [roundStart, countdown, showingBoxes, showAnswers, boxesGenerated, round]);

  // Main round timer (only runs after boxes are hidden)
  useEffect(() => {
    if (!isRunning || showAnswers || countdown !== null || showingBoxes) {
      return;
    }

    console.log("Timer running, time left:", timeLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        console.log("Round ended");
        setRoundEnd(true);
        setRoundStart(false);
        setIsRunning(false);
        clearInterval(timer);
        checkTheCount();
        setShowAnswers(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, showAnswers, countdown, showingBoxes, timeLeft]);

  // Show results for n seconds
  useEffect(() => {
    if (!showAnswers) return;

    const timeout = setTimeout(() => {
      setShowAnswers(false);
      setBoxesGenerated(false); // Reset for next round
      
      if (round < roundMax) {
        startCountdown();
      } else {
        setIsRunning(false);
        if (onRoundEnd) onRoundEnd();
      }
    }, 3500);

    return () => clearTimeout(timeout);
  }, [showAnswers]);

  // Initial countdown at start
  const startInitialCountdown = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
      } else {
        clearInterval(interval);
        setCountdown(null);
        setRoundStart(true);
        setIsRunning(true);
      }
    }, 1000);
  };

  // Countdown between rounds
  const startCountdown = () => {
    setRoundStart(false);
    let count = 3;
    setCountdown(count);
    if (onResetCounts) onResetCounts();
    setRightCheck("");
    setLeftCheck("");

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
      } else {
        clearInterval(interval);
        setCountdown(null);
        nextRound();
      }
    }, 1000);
  };

  // Initiate the next round
  const nextRound = () => {
    if (round < roundMax) {
      const next = round + 1;
      setRound(next);
      setTimeLeft(roundTime[next - 1]);
      setRoundStart(true);
      setRoundEnd(false);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (onRoundEnd) {
        onRoundEnd();
      }
    }
  };

  return (
    <div className="round-display" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Round: {round} / {roundMax}</h2>
      <div style={{ fontSize: '1.5rem', margin: '10px 0' }}>
        <span style={{ color: '#4a90e2', fontWeight: 'bold' }}>Left: {leftScore}</span>
        {' | '}
        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Right: {rightScore}</span>
      </div>

      {showAnswers ? (
        <div>
          <h3>✅ Round Results</h3>
          <p>Left: {leftCount} {leftCheck} (Correct: {leftBoxCount})</p>
          <p>Right: {rightCount} {rightCheck} (Correct: {rightBoxCount})</p>
        </div>
      ) : countdown !== null ? (
        <h1 className="countdown" style={{ fontSize: '4rem', margin: '20px' }}>
          {countdown}
        </h1>
      ) : showingBoxes ? (
        <div>
          <h3 style={{ fontSize: '2rem', margin: '20px' }}>👀 Memorize the boxes!</h3>
          <p style={{ fontSize: '1.2rem' }}>Blue (Left): {leftBoxCount} | Red (Right): {rightBoxCount}</p>
        </div>
      ) : (
        <div>
          <h3 className="Time" style={{ fontSize: '2rem', color: '#e74c3c' }}>⏱ Time left: {timeLeft}s</h3>
          <p style={{ fontSize: '1.2rem' }}>Left count: {leftCount} | Right count: {rightCount}</p>
        </div>
      )}
    </div>
  );
}

export default RoundSystem;