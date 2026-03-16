import React from "react";
import { useState, useEffect, useCallback } from "react";
import { getRandomPairs } from "./utils";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { Leaderboard, HighScoreForm } from "./components/Leaderboard";
import "./App.css";

function App() {
  const TIMER_DURATION = 10;

  // State variables for data
  const [pairs, setPairs] = useState([]);
  const [batch, setBatch] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [realImage, setRealImage] = useState(null);
  const [AIlocated, setAIlocated] = useState(null);
  const [streak, setStreak] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  // State variables for game logic
  const [showDirections, setShowDirections] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timedMode, setTimedMode] = useState(false);

  // State for image zoom
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setZoomedImage(null);
    };
    if (zoomedImage) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [zoomedImage]);

  // State variables for leaderboard
  const [showHighScoreForm, setShowHighScoreForm] = useState(false);
  const [checkingHighScore, setCheckingHighScore] = useState(false);
  const [playerRank, setPlayerRank] = useState(null);
  const [newEntryId, setNewEntryId] = useState(null);

  // Leaderboard hook
  const {
    scores,
    loading: leaderboardLoading,
    addScore,
    checkHighScore,
    getScoreRank,
  } = useLeaderboard();

  // Load all image pairs from the JSON file
  const loadPairs = () => {
    setLoading(true);
    fetch("/pairs/index.json")
      .then((res) => res.json())
      .then((data) => {
        setPairs(data.pairs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading pairs:", err);
        setLoading(false);
      });
  };

  // Load 10 random image pairs from our cached pairs
  const loadNextBatch = () => {
    const selected = getRandomPairs(pairs);

    setBatch(selected);
    setCurrentIndex(0);
    loadNextPair(selected[0]);
  };

  // Load the next pair of images from our batch
  const loadNextPair = (pair) => {
    setAiImage(pair.ai);
    setRealImage(pair.real);
    setAIlocated(Math.random() < 0.5 ? "left" : "right");
  };

  // Load all pairs on initial render
  useEffect(() => {
    if (pairs.length === 0) {
      loadPairs();
    }
  }, [pairs]);

  // Calculate accuracy
  const accuracy = round === 0 ? 0 : ((correct / round) * 100).toFixed(2);

  // Map streak count to a tier and label for styling
  const getStreakTier = (streak) => {
    if (streak < 3) {
      return "0";
    } else if (streak < 5) {
      return "1";
    } else if (streak < 7) {
      return "2";
    } else if (streak < 10) {
      return "3";
    } else {
      return "4";
    }
  };

  const streakInfo = getStreakTier(streak);

  // Handle user submitting a guess
  const handleSubmit = useCallback(() => {
    if (!guess) return;

    setTimerActive(false);

    const userCorrect = guess === AIlocated;

    if (userCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    const elapsed = TIMER_DURATION - timeLeft;
    const newTotal = totalTime + elapsed;
    setTotalTime(newTotal);
    setRound((r) => r + 1);
    setAvgTime(newTotal / (round + 1));
    setSubmitted(true);
  }, [guess, AIlocated, timeLeft, totalTime, round]);

  // Timer countdown — just ticks down and stops at zero
  useEffect(() => {
    if (!timerActive) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timerActive]);

  // Handle timer expiry — runs once when timer stops at zero
  useEffect(() => {
    if (timerActive || timeLeft > 0) return;
    if (submitted) return; // already handled this round

    if (guess) {
      handleSubmit();
    } else {
      setTotalTime((t) => t + TIMER_DURATION);
      setRound((r) => r + 1);
      setStreak(0);
      setSubmitted(true);
      setAvgTime((totalTime + TIMER_DURATION) / (round + 1));
    }
  }, [timerActive, timeLeft, guess, handleSubmit, round, submitted, totalTime]);

  // Handle starting the game
  const handlePlay = (timed) => {
    setTimedMode(timed);
    setShowDirections(false);
    loadNextBatch();
    if (timed) {
      setTimeLeft(TIMER_DURATION);
      setTimerActive(true);
    }
  };

  // Handle loading the next pair
  const handleNext = async () => {
    setGuess(null);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= batch.length) {
      setGameOver(true);
      setCheckingHighScore(true);

      // Check if this score qualifies for the leaderboard
      const isHigh = await checkHighScore(correct);
      if (isHigh) {
        const rank = await getScoreRank(correct);
        setPlayerRank(rank);
        setShowHighScoreForm(true);
      }
      setCheckingHighScore(false);
      return;
    }

    setCurrentIndex(nextIndex);
    loadNextPair(batch[nextIndex]);
    setSubmitted(false);
    if (timedMode) {
      setTimeLeft(TIMER_DURATION);
      setTimerActive(true);
    }
  };

  // Handle playing again
  const handlePlayAgain = (timed) => {
    setTimedMode(timed);
    setGameOver(false);
    setRound(0);
    setCorrect(0);
    setGuess(null);
    setSubmitted(false);
    setShowHighScoreForm(false);
    setCheckingHighScore(false);
    setPlayerRank(null);
    setNewEntryId(null);
    setTimeLeft(TIMER_DURATION);
    setTimerActive(timed);
    setTotalTime(0);
    setAvgTime(0);
    loadNextBatch();
  };

  // Handle submitting a new high score
  const handleScoreSubmit = async (playerName) => {
    const entry = await addScore({
      playerName,
      score: correct,
      accuracy: parseFloat(accuracy),
      totalRounds: round,
    });

    setNewEntryId(entry.id);
    setShowHighScoreForm(false);
  };

  // Handle skipping score submission
  const handleSkipHighScore = () => {
    setShowHighScoreForm(false);
  };

  return (
    <div className="App" data-streak-tier={streakInfo}>
      <header className="App-header">
        <h1>AI or Real?</h1>
      </header>

      <div className="round-counter">
        <h2>Round: {round}/10</h2>
      </div>

      {timedMode && !showDirections && !gameOver && (
        <div className="timer-bar-container">
          <div
            className={`timer-bar${timerActive ? "" : " timer-bar-stopped"}`}
            style={{
              width: timerActive
                ? `${((timeLeft === TIMER_DURATION ? timeLeft : timeLeft - 1) / TIMER_DURATION) * 100}%`
                : timeLeft === 0
                  ? "0%"
                  : `${(timeLeft / TIMER_DURATION) * 100}%`,
              backgroundColor:
                timeLeft > TIMER_DURATION
                  ? "#4caf50"
                  : timeLeft > 5
                    ? "#FCBF49"
                    : "#D62828",
            }}
          />
          <span className="timer-text">{timeLeft}s</span>
        </div>
      )}

      {showDirections ? (
        <div className="directions">
          <div className="directions-content">
            <h2>
              Can you tell the difference between AI-generated and real images?
            </h2>
            <p>Click the image you think is AI-generated.</p>
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <div className="play-buttons">
                <button
                  className="play-button"
                  onClick={() => handlePlay(false)}
                >
                  Classic
                </button>
                <button
                  className="play-button timed-button"
                  onClick={() => handlePlay(true)}
                >
                  Timed
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {gameOver ? (
        <div className="game-over">
          <div className="game-over-card">
            <h2>Game Over!</h2>
            <p>
              You got {correct} out of {round} correct.
            </p>
            <p>Your accuracy: {accuracy}%</p>
            {timedMode && <p>Avg. Answer Time: {avgTime.toFixed(1)}s</p>}

            {showHighScoreForm ? (
              <HighScoreForm
                onSubmit={handleScoreSubmit}
                onSkip={handleSkipHighScore}
                rank={playerRank}
                score={correct}
                accuracy={accuracy}
              />
            ) : !checkingHighScore ? (
              <>
                <Leaderboard
                  scores={scores}
                  loading={leaderboardLoading}
                  highlightId={newEntryId}
                />
                <div className="play-buttons">
                  <button
                    className="play-again-button"
                    onClick={() => handlePlayAgain(false)}
                  >
                    Classic
                  </button>
                  <button
                    className="play-again-button timed-button"
                    onClick={() => handlePlayAgain(true)}
                  >
                    Timed
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {!gameOver && aiImage && realImage && (
        <div className="content">
          <div className="image-pair">
            <div
              className={`left-card ${guess === "left" ? "selected" : ""} ${
                submitted && guess === "left"
                  ? AIlocated === "left"
                    ? "ai-image"
                    : "real-image"
                  : ""
              } ${submitted && !guess && timeLeft === 0 ? "timed-out" : ""}`}
              onClick={() => !submitted && setGuess("left")}
            >
              <img
                src={AIlocated === "left" ? aiImage : realImage}
                alt="left-image"
              />
              <button
                className="zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedImage(AIlocated === "left" ? aiImage : realImage);
                }}
                aria-label="Expand image"
              >
                &#x26F6;
              </button>
            </div>
            <div
              className={`right-card ${guess === "right" ? "selected" : ""} ${
                submitted && guess === "right"
                  ? AIlocated === "right"
                    ? "ai-image"
                    : "real-image"
                  : ""
              } ${submitted && !guess && timeLeft === 0 ? "timed-out" : ""}`}
              onClick={() => !submitted && setGuess("right")}
            >
              <img
                src={AIlocated === "right" ? aiImage : realImage}
                alt="right-image"
              />
              <button
                className="zoom-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomedImage(AIlocated === "right" ? aiImage : realImage);
                }}
                aria-label="Expand image"
              >
                &#x26F6;
              </button>
            </div>
          </div>
          <div className="button-container">
            <button
              className="submit-button"
              disabled={!guess || submitted}
              onClick={handleSubmit}
            >
              Submit
            </button>
            <button
              className="next-button"
              disabled={!submitted || gameOver}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => setZoomedImage(null)}>
          <img
            className="zoom-overlay-image"
            src={zoomedImage}
            alt="Zoomed"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default App;
