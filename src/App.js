import React from "react";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [realImage, setRealImage] = useState(null);
  const [AIlocated, setAIlocated] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const loadNextPair = () => {
    fetch("/pairs/index.json")
      .then((res) => res.json())
      .then((data) => {
        const pairs = data.pairs;
        const randomPair = pairs[Math.floor(Math.random() * pairs.length)];

        return fetch(`/pairs/${randomPair}.json`);
      })
      .then((res) => res.json())
      .then((pair) => {
        setAiImage(pair.ai);
        setRealImage(pair.real);
        setAIlocated(Math.random() < 0.5 ? "left" : "right");
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadNextPair();
  }, []);

  const accuracy = round === 0 ? 0 : ((correct / round) * 100).toFixed(2);

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

  const handleNext = () => {
    loadNextPair();
    setSubmitted(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI or Real?</h1>
        <p>
          Round: {round} | Correct: {correct} | Accuracy: {accuracy}%
        </p>
      </header>

      {aiImage && realImage && (
        <div className="content">
          <div
            className={`left-card ${guess === "left" ? "selected" : ""}`}
            onClick={() => setGuess("left")}
          >
            <img
              src={AIlocated === "left" ? aiImage : realImage}
              alt="left-image"
            />
          </div>
          <div
            className={`right-card ${guess === "right" ? "selected" : ""}`}
            onClick={() => setGuess("right")}
          >
            <img
              src={AIlocated === "right" ? aiImage : realImage}
              alt="right-image"
            />
          </div>
          <button disabled={!guess} onClick={handleSubmit}>
            Submit Guess
          </button>
          <button disabled={!submitted} onClick={handleNext}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
