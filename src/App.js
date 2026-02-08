import React from "react";
import { useState, useEffect } from "react";
import { getRandomPairs } from "./utils";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { Leaderboard, HighScoreForm } from "./components/Leaderboard";
import "./App.css";

function App() {
  // State variables for data
  const [pairs, setPairs] = useState([]);
  const [batch, setBatch] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [realImage, setRealImage] = useState(null);
  const [AIlocated, setAIlocated] = useState(null);

  // State variables for game logic
  const [showDirections, setShowDirections] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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

  // Handle user submitting a guess
  const handleSubmit = () => {
    if (!guess) return;

    const userCorrect = guess === AIlocated;

    if (userCorrect) {
      setCorrect((c) => c + 1);
    }

    setRound((r) => r + 1);
    setSubmitted(true);
  };

  // Handle starting the game
  const handlePlay = () => {
    setShowDirections(false);
    loadNextBatch();
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
        const rank = await getScoreRank(correct, parseFloat(accuracy));
        setPlayerRank(rank);
        setShowHighScoreForm(true);
      }
      setCheckingHighScore(false);
      return;
    }

    setCurrentIndex(nextIndex);
    loadNextPair(batch[nextIndex]);
    setSubmitted(false);
  };

  // Handle playing again
  const handlePlayAgain = () => {
    setGameOver(false);
    setRound(0);
    setCorrect(0);
    setGuess(null);
    setSubmitted(false);
    setShowHighScoreForm(false);
    setCheckingHighScore(false);
    setPlayerRank(null);
    setNewEntryId(null);
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
    <div className="App">
      <header className="App-header">
        <h1>AI or Real?</h1>
      </header>

      <div className="round-counter">
        <h2>Round: {round}/10</h2>
      </div>

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
              <button className="play-button" onClick={handlePlay}>
                Play
              </button>
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
                <button className="play-again-button" onClick={handlePlayAgain}>
                  Play Again
                </button>
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
              }`}
              onClick={() => !submitted && setGuess("left")}
            >
              <img
                src={AIlocated === "left" ? aiImage : realImage}
                alt="left-image"
              />
            </div>
            <div
              className={`right-card ${guess === "right" ? "selected" : ""} ${
                submitted && guess === "right"
                  ? AIlocated === "right"
                    ? "ai-image"
                    : "real-image"
                  : ""
              }`}
              onClick={() => !submitted && setGuess("right")}
            >
              <img
                src={AIlocated === "right" ? aiImage : realImage}
                alt="right-image"
              />
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
    </div>
  );
}

export default App;
