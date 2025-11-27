import React, { useState, useEffect, useRef } from "react";

// ============= GENERATOR.JS (RoundSystem Component) ============= This makes the portion of the game that handles rounds, timers, box generation, and scoring.
export default function RoundSystem({ started, onRoundEnd, onRoundStateChange, leftCount, rightCount, onResetCounts, onBoxesGenerated, onScoreUpdate }) {
  const roundMax = 7;
  const roundTime = [5, 9, 9, 10, 10, 9, 8];
  const MaxBoxesperRound = [12, 16, 22, 25, 30, 38, 47];
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showAnswers, setShowAnswers] = useState(false);
  const [roundStart, setRoundStart] = useState(false);
  const [rightCheck, setRightCheck] = useState("");
  const [leftCheck, setLeftCheck] = useState("");
  const [leftBoxCount, setLeftBoxCount] = useState(0);
  const [rightBoxCount, setRightBoxCount] = useState(0);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [boxesShown, setBoxesShown] = useState(false);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const leftCountRef = useRef(leftCount);
  const rightCountRef = useRef(rightCount);

  // Update refs when counts change
  useEffect(() => {
    leftCountRef.current = leftCount;
    rightCountRef.current = rightCount;
  }, [leftCount, rightCount]);

  // Notify parent when round is active
  useEffect(() => {
    const isActive = roundStart && !showAnswers && countdown === null && boxesShown;
    if (onRoundStateChange) {
      onRoundStateChange(isActive);
    }
  }, [roundStart, showAnswers, countdown, boxesShown, onRoundStateChange]);

  // Generate random boxes
  function generateBoxes(roundNumber) {
    const maxBoxesPerSide = MaxBoxesperRound[roundNumber - 1];
    const totalCells = 100;
    
    const leftCount = Math.floor(Math.random() * (maxBoxesPerSide * 0.4 + 1)) + Math.floor(maxBoxesPerSide * 0.6);
    const rightCount = Math.floor(Math.random() * (maxBoxesPerSide * 0.4 + 1)) + Math.floor(maxBoxesPerSide * 0.6);
    
    const totalBoxes = leftCount + rightCount;
    const positions = [];
    
    while (positions.length < totalBoxes) {
      const randomPos = Math.floor(Math.random() * totalCells);
      if (!positions.includes(randomPos)) {
        positions.push(randomPos);
      }
    }
    
    const boxes = positions.map((pos, idx) => ({
      index: pos,
      side: idx < leftCount ? 'left' : 'right'
    }));
    
    setLeftBoxCount(leftCount);
    setRightBoxCount(rightCount);
    
    return { boxes, counts: { left: leftCount, right: rightCount } };
  }

  // Check counts and update scores
  function checkTheCount() {
    let newLeftScore = leftScore;
    let newRightScore = rightScore;

    // Use refs to get the most current count values
    const currentLeftCount = leftCountRef.current;
    const currentRightCount = rightCountRef.current;


    if (currentRightCount === rightBoxCount) {
      setRightCheck("✅");
      newRightScore = rightScore + 1;
      setRightScore(newRightScore);
    } else {
      setRightCheck("❌");
    }

    if (currentLeftCount === leftBoxCount) {
      setLeftCheck("✅");
      newLeftScore = leftScore + 1;
      setLeftScore(newLeftScore);
    } else {
      setLeftCheck("❌");
    }

    // Send updated scores to parent immediately
    if (onScoreUpdate) {
      onScoreUpdate({
        left: newLeftScore,
        right: newRightScore
      });
    }
  }

  // Start initial countdown
  useEffect(() => {
    if (started && countdown === 3 && !isRunning && round === 1) {
      startInitialCountdown();
    }
  }, [started]);

  // Show boxes when round starts
  useEffect(() => {
    if (roundStart && countdown === null && !boxesShown && !showAnswers) {
      const { boxes, counts } = generateBoxes(round);
      
      if (onBoxesGenerated) {
        onBoxesGenerated(boxes, counts);
      }
      
      setBoxesShown(true);
    }
  }, [roundStart, countdown, boxesShown, showAnswers]);

  // Main timer
  useEffect(() => {
    if (!isRunning || showAnswers || countdown !== null || !boxesShown) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        clearInterval(timerRef.current);
        timerRef.current = null;
        
        setRoundStart(false);
        setIsRunning(false);
        
        // Use setTimeout to ensure counts are captured at the right time
        setTimeout(() => {
          checkTheCount();
        }, 100);
        
        setShowAnswers(true);
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, showAnswers, countdown, boxesShown]);

  // Show results
  useEffect(() => {
    if (!showAnswers) return;

    const timeout = setTimeout(() => {
      setShowAnswers(false);
      setBoxesShown(false);
      
      if (round < roundMax) {
        startCountdown();
      } else {
        setIsRunning(false);
        if (onRoundEnd) onRoundEnd();
      }
    }, 3500);

    return () => clearTimeout(timeout);
  }, [showAnswers]);

  const startInitialCountdown = () => {
    let count = 3;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
      } else {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        setRoundStart(true);
        setIsRunning(true);
      }
    }, 1000);
  };

  const startCountdown = () => {
    setRoundStart(false);
    let count = 3;
    setCountdown(count);
    if (onResetCounts) onResetCounts();
    setRightCheck("");
    setLeftCheck("");

    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
      } else {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        nextRound();
      }
    }, 1000);
  };

  const nextRound = () => {
    if (round < roundMax) {
      const next = round + 1;
      setRound(next);
      setTimeLeft(roundTime[next - 1]);
      setRoundStart(true);
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (onRoundEnd) {
        onRoundEnd();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
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
        <h1 style={{ fontSize: '4rem', margin: '20px' }}>
          {countdown}
        </h1>
      ) : (
        <div>
          <h3 style={{ fontSize: '2rem', color: '#e74c3c' }}>⏱ Time left: {timeLeft}s</h3>
          <p style={{ fontSize: '1.2rem' }}>Left: {leftCount} | Right: {rightCount}</p>
        </div>
      )}
    </div>
  );
}