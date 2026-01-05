import React from "react";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [guess, setGuess] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [realImage, setRealImage] = useState(null);

  useEffect(() => {
    fetch("/pairs/cat1.json")
      .then((response) => response.json())
      .then((pair) => {
        setAiImage(pair.ai);
        setRealImage(pair.real);
      });
  }, []);

  const accuracy = round === 0 ? 0 : ((correct / round) * 100).toFixed(2);

  const handleSubmit = () => {
    if (!guess) return;

    const AIlocated = "left"; // Placeholder logic
    const userCorrect = guess === AIlocated;

    if (userCorrect) {
      setCorrect((c) => c + 1);
    }

    setRound((r) => r + 1);
    setGuess(null);
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
            <img src={aiImage} alt="AI" />
          </div>
          <div
            className={`right-card ${guess === "right" ? "selected" : ""}`}
            onClick={() => setGuess("right")}
          >
            <img src={realImage} alt="Real" />
          </div>
          <button disabled={!guess} onClick={handleSubmit}>
            Submit Guess
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
