import React from "react";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // State variables for data
  const [showDirections, setShowDirections] = useState(true);
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [realImage, setRealImage] = useState(null);
  const [AIlocated, setAIlocated] = useState(null);

  // State variables for game logic
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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

  // Load the next pair of images from our cached pairs
  const loadNextPair = () => {
    const randomIndex = Math.floor(Math.random() * pairs.length);
    const pair = pairs[randomIndex];

    setAiImage(pair.ai);
    setRealImage(pair.real);

    const aiPosition = Math.random() < 0.5 ? "left" : "right";
    setAIlocated(aiPosition);
  };

  // Load pairs on initial render
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
    setGuess(null);
    setSubmitted(true);
  };

  // Handle starting the game
  const handlePlay = () => {
    setShowDirections(false);
    loadNextPair();
  };

  // Handle loading the next pair
  const handleNext = () => {
    loadNextPair();
    setSubmitted(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI or Real?</h1>
      </header>

      <div className="stats">
        <h2>
          Round: {round} | Correct: {correct} | Accuracy: {accuracy}%
        </h2>
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

      {aiImage && realImage && (
        <div className="content">
          <div className="image-pair">
            <div
              className={`left-card ${guess === "left" ? "selected" : ""} ${
                submitted && AIlocated === "left" ? "ai-image" : ""
              } ${submitted && AIlocated === "right" ? "real-image" : ""}`}
              onClick={() => !submitted && setGuess("left")}
            >
              <img
                src={AIlocated === "left" ? aiImage : realImage}
                alt="left-image"
              />
            </div>
            <div
              className={`right-card ${guess === "right" ? "selected" : ""} ${
                submitted && AIlocated === "right" ? "ai-image" : ""
              } ${submitted && AIlocated === "left" ? "real-image" : ""}`}
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
              disabled={!submitted}
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
