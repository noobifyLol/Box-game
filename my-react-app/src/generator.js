import React, { useState, useEffect } from "react";

function RoundSystem({ started, onRoundEnd }) {
  const roundMax = 7;
  const roundTime = [10, 9, 8, 6, 5, 3, 2]; // seconds for each round
  const BoxesperRound = [10, 15, 20, 25, 30, 35, 40];
  const ShownBoxesTime = [6,5,5,4,4,3,2,2]; // seconds to show boxes
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundTime[0]);

  const [isRunning, setIsRunning] = useState(false);

  const [countdown, setCountdown] = useState(3); // Start with countdown
  const [showAnswers, setShowAnswers] = useState(false);

  const [roundStart, setRoundStart] = useState(false);
  const [roundEnd, setRoundEnd] = useState(false);


  const [rightCheck, setRightCheck] = useState("");

  const [leftCheck, setLeftCheck] = useState("");

  const [setRight, setSetRight] = useState(0);

  const [setLeft, setSetLeft] = useState(0);

  const[ amountofboxes, setamountofboxes]= useState(1);

  const functiion = ranBoxes => {


  };

  // Check if counts match
  function checkTheCount() {
    if (setRight === amountofboxes) {
      setRightCheck("✅");
    } else {
      setRightCheck("❌");
    }

    if (setLeft === amountofboxes) {
      setLeftCheck("✅");
    } else {
      setLeftCheck("❌");
    }
  }

  // Start countdown when component mounts
  useEffect(() => {
    if (started && countdown !== null) {
      startInitialCountdown();
    }
  }, [started]);

  // Handle keyboard input
  useEffect(() => {
    if (!roundStart) return;

    const handleKeyDown = (event) => {
      if (event.key === "a" || event.key === "A") {
        setSetLeft((prev) => prev + 1);
      } else if (event.key === "ArrowRight") {
        setSetRight((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [roundStart]);

  // Main round timer
  useEffect(() => {
    if (!isRunning || showAnswers || countdown !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Round ended
        setRoundEnd(true);
        setRoundStart(false);
        clearInterval(timer);
        checkTheCount();
        setShowAnswers(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, showAnswers, countdown, round]);

  // Show results for n seconds
  useEffect(() => {
    if (!showAnswers) return;

    const timeout = setTimeout(() => {
      setShowAnswers(false);
      if (round < roundMax) {
        startCountdown();
      } else {
        setIsRunning(false);
        if (onRoundEnd) onRoundEnd();
      }
    }, 3500);

    return () => clearTimeout(timeout);
  }, [showAnswers, round]);

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
    let count = 3;
    setCountdown(count);
    setSetRight(0);
    setSetLeft(0);
    setRightCheck("");
    setLeftCheck("");

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
        setRoundStart(true);
        setRoundEnd(false);
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
      setIsRunning(true);
    } else {
      setIsRunning(false);
      if (onRoundEnd) {
        onRoundEnd();
        setLeft(0);
        setRight(0);

      }
    }
  };


 // Render the component
  return (
    <div className="round-display" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Round: {round} / {roundMax}</h2>


      {showAnswers ? (
        <div>
          <h3>✅ Showing answers...</h3>
          <p>Left: {setLeft} {leftCheck}</p>
          <p>Right: {setRight} {rightCheck}</p>
        </div>
      ) : countdown !== null ? (
        <h1 className="countdown" style={{ fontSize: '4rem', margin: '20px' }}>
          {countdown}
        </h1>
      ) : (
        <div>
          <h3 className="Time">⏱ Time left: {timeLeft}s</h3>
          <p>Left count: {setLeft} | Right count: {setRight}</p>
        </div>
      )}
    </div>
  );
}


export default RoundSystem;